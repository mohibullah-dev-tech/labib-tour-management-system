import { randomUUID } from 'node:crypto';
import { redisClient, isRedisConnected } from '@/config/redis.js';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';
import { ApiError } from '@/utils/ApiError.js';
import { EventSeat, TourEvent } from '@/models/index.js';
import { PASSENGER_SEAT_NUMBERS } from '@/constants/index.js';

export interface SeatLockPayload {
  userId: string;
  sessionId: string;
  eventId: string;
  seatNumber: string;
  lockedAt: number;
  expiresAt: number;
  firstLockedAt: number;
}

export interface LockSeatsResult {
  sessionId: string;
  seatNumbers: string[];
  expiresAt: string;
  ttlSeconds: number;
}

export interface SeatStatusItem {
  seatNumber: string;
  status: 'available' | 'locked' | 'booked' | 'reserved' | 'blocked';
  lockExpiresAt: string | null;
  lockedByCurrentUser: boolean;
  busId?: string;
  bookingId?: string | null;
}

// Prefix for namespaced Redis keys
const KEY_PREFIX = 'labib:seat-lock';

export function getSeatLockKey(eventId: string, seatNumber: string): string {
  return `${KEY_PREFIX}:${eventId}:${seatNumber}`;
}

/**
 * In-memory fallback lock store for when Redis is offline/disconnected.
 * Guarantees zero crashing and identical atomic semantics.
 */
class MemoryLockStore {
  private locks = new Map<string, { payload: SeatLockPayload; timer: NodeJS.Timeout }>();

  get(key: string): SeatLockPayload | null {
    const entry = this.locks.get(key);
    if (!entry) return null;
    if (Date.now() >= entry.payload.expiresAt) {
      clearTimeout(entry.timer);
      this.locks.delete(key);
      return null;
    }
    return entry.payload;
  }

  set(key: string, payload: SeatLockPayload, ttlSeconds: number): void {
    const existing = this.locks.get(key);
    if (existing) clearTimeout(existing.timer);

    const timer = setTimeout(() => {
      this.locks.delete(key);
    }, ttlSeconds * 1000);
    timer.unref();

    this.locks.set(key, { payload, timer });
  }

  del(key: string): void {
    const existing = this.locks.get(key);
    if (existing) {
      clearTimeout(existing.timer);
      this.locks.delete(key);
    }
  }

  clear(): void {
    for (const entry of this.locks.values()) {
      clearTimeout(entry.timer);
    }
    this.locks.clear();
  }
}

const memoryLockStore = new MemoryLockStore();

/**
 * Lua script for atomic multi-seat acquisition:
 * Checks if ANY key is held by another user/session.
 * If all are available or held by same user/session, locks all of them atomically.
 * Returns: { 1, "OK" } on success, or { 0, conflictedSeatKey } on failure.
 */
const ACQUIRE_LOCKS_LUA = `
local ttl = tonumber(ARGV[1])
local payloadJson = ARGV[2]
local sessionId = ARGV[3]
local userId = ARGV[4]

for i, key in ipairs(KEYS) do
  local existing = redis.call('GET', key)
  if existing then
    local data = cjson.decode(existing)
    if data.userId ~= userId and data.sessionId ~= sessionId then
      return {0, key}
    end
  end
end

for i, key in ipairs(KEYS) do
  redis.call('SET', key, payloadJson, 'EX', ttl)
end

return {1, "OK"}
`;

/**
 * Lua script for safe release:
 * Deletes keys only if owned by the user or session.
 */
const RELEASE_LOCKS_LUA = `
local sessionId = ARGV[1]
local userId = ARGV[2]
local released = 0

for i, key in ipairs(KEYS) do
  local existing = redis.call('GET', key)
  if existing then
    local data = cjson.decode(existing)
    if data.sessionId == sessionId or data.userId == userId then
      redis.call('DEL', key)
      released = released + 1
    end
  end
end

return released
`;

/**
 * Lua script for heartbeat / lock extension:
 * Extends TTL only for owned locks, capping to max total duration.
 */
const EXTEND_LOCKS_LUA = `
local ttl = tonumber(ARGV[1])
local maxDuration = tonumber(ARGV[2])
local sessionId = ARGV[3]
local userId = ARGV[4]
local nowMs = tonumber(ARGV[5])
local extended = 0

for i, key in ipairs(KEYS) do
  local existing = redis.call('GET', key)
  if existing then
    local data = cjson.decode(existing)
    if data.sessionId == sessionId or data.userId == userId then
      local firstLockedAt = data.firstLockedAt or data.lockedAt or nowMs
      local elapsedSeconds = (nowMs - firstLockedAt) / 1000
      if elapsedSeconds + ttl <= maxDuration then
        data.expiresAt = nowMs + (ttl * 1000)
        redis.call('SET', key, cjson.encode(data), 'EX', ttl)
        extended = extended + 1
      else
        local remainingTtl = math.max(1, math.floor(maxDuration - elapsedSeconds))
        data.expiresAt = nowMs + (remainingTtl * 1000)
        redis.call('SET', key, cjson.encode(data), 'EX', remainingTtl)
        extended = extended + 1
      end
    end
  end
end

return extended
`;

/**
 * Seat Lock Service
 * Encapsulates all Redis atomic seat locking, lock ownership, heartbeat, and expiration logic.
 */
export class SeatLockService {
  /**
   * Acquire atomic lock on one or more passenger seats.
   * Enforces all-or-nothing guarantee.
   */
  static async lockSeats(params: {
    eventId: string;
    seatNumbers: string[];
    userId: string;
    sessionId?: string;
    ttlSeconds?: number;
  }): Promise<LockSeatsResult> {
    const { eventId, userId } = params;
    const sessionId = params.sessionId || randomUUID();
    const seatNumbers = Array.from(new Set(params.seatNumbers));
    const ttlSeconds = params.ttlSeconds || env.SEAT_LOCK_TTL_SECONDS;

    if (!seatNumbers.length) {
      throw ApiError.badRequest('At least one seat number is required');
    }

    // 1. Verify Event exists and is open for booking
    const event = await TourEvent.findById(eventId).select('status').lean();
    if (!event) {
      throw ApiError.notFound('Tour event not found');
    }
    if (event.status !== 'booking_open' && event.status !== 'published') {
      throw ApiError.conflict('This event is not accepting seat bookings');
    }

    // 2. Validate seat numbers
    for (const seatNumber of seatNumbers) {
      if (!PASSENGER_SEAT_NUMBERS.includes(seatNumber)) {
        throw ApiError.badRequest(`Invalid passenger seat number: ${seatNumber}`);
      }
    }

    // 3. Permanent Check: MongoDB EventSeat
    // Redis is NOT the source of truth; MongoDB booked/reserved/blocked overrides Redis
    const mongoSeats = await EventSeat.find({
      eventId,
      seatNumber: { $in: seatNumbers },
    })
      .select('seatNumber status')
      .lean();

    for (const seat of mongoSeats) {
      if (['booked', 'reserved', 'blocked'].includes(seat.status)) {
        throw ApiError.conflict(
          `Seat ${seat.seatNumber} has already been ${seat.status}. Please select another seat.`,
        );
      }
    }

    // 4. Temporary Check & Atomic Lock in Redis
    const now = Date.now();
    const expiresAt = now + ttlSeconds * 1000;
    const keys = seatNumbers.map((seatNum) => getSeatLockKey(eventId, seatNum));

    const payloadTemplate: SeatLockPayload = {
      userId,
      sessionId,
      eventId,
      seatNumber: seatNumbers[0],
      lockedAt: now,
      expiresAt,
      firstLockedAt: now,
    };

    if (isRedisConnected()) {
      try {
        const result = (await redisClient.eval(
          ACQUIRE_LOCKS_LUA,
          keys.length,
          ...keys,
          ttlSeconds.toString(),
          JSON.stringify(payloadTemplate),
          sessionId,
          userId,
        )) as [number, string];

        const [success, conflictedKey] = result;
        if (success !== 1) {
          const conflictedSeat = conflictedKey.split(':').pop();
          throw ApiError.conflict(
            `Seat ${conflictedSeat || 'selected'} is currently being held by another customer.`,
          );
        }
      } catch (err: unknown) {
        if (err instanceof ApiError) throw err;
        logger.error('Redis atomic lock error, falling back to memory store', { error: err });
        this.acquireMemoryLocks(keys, seatNumbers, payloadTemplate, ttlSeconds, userId, sessionId);
      }
    } else {
      this.acquireMemoryLocks(keys, seatNumbers, payloadTemplate, ttlSeconds, userId, sessionId);
    }

    return {
      sessionId,
      seatNumbers,
      expiresAt: new Date(expiresAt).toISOString(),
      ttlSeconds,
    };
  }

  private static acquireMemoryLocks(
    keys: string[],
    seatNumbers: string[],
    payloadTemplate: SeatLockPayload,
    ttlSeconds: number,
    userId: string,
    sessionId: string,
  ): void {
    // Check if any key is held by someone else
    for (let i = 0; i < keys.length; i++) {
      const existing = memoryLockStore.get(keys[i]);
      if (existing && existing.userId !== userId && existing.sessionId !== sessionId) {
        throw ApiError.conflict(
          `Seat ${seatNumbers[i]} is currently being held by another customer.`,
        );
      }
    }

    // Lock all atomically
    for (let i = 0; i < keys.length; i++) {
      const payload: SeatLockPayload = {
        ...payloadTemplate,
        seatNumber: seatNumbers[i],
      };
      memoryLockStore.set(keys[i], payload, ttlSeconds);
    }
  }

  /**
   * Release temporary seat locks owned by this user/session.
   */
  static async releaseSeats(params: {
    eventId: string;
    seatNumbers: string[];
    userId: string;
    sessionId?: string;
  }): Promise<{ releasedCount: number }> {
    const { eventId, seatNumbers, userId } = params;
    const sessionId = params.sessionId || '';
    const keys = seatNumbers.map((seatNum) => getSeatLockKey(eventId, seatNum));

    let releasedCount = 0;

    if (isRedisConnected()) {
      try {
        releasedCount = (await redisClient.eval(
          RELEASE_LOCKS_LUA,
          keys.length,
          ...keys,
          sessionId,
          userId,
        )) as number;
      } catch (err) {
        logger.warn('Redis release failed, falling back to memory store', { error: err });
        releasedCount = this.releaseMemoryLocks(keys, userId, sessionId);
      }
    } else {
      releasedCount = this.releaseMemoryLocks(keys, userId, sessionId);
    }

    return { releasedCount };
  }

  private static releaseMemoryLocks(keys: string[], userId: string, sessionId: string): number {
    let count = 0;
    for (const key of keys) {
      const existing = memoryLockStore.get(key);
      if (existing && (existing.sessionId === sessionId || existing.userId === userId)) {
        memoryLockStore.del(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Heartbeat to extend active seat locks without exceeding MAX_SEAT_LOCK_DURATION_SECONDS.
   */
  static async heartbeatSeats(params: {
    eventId: string;
    seatNumbers: string[];
    userId: string;
    sessionId?: string;
  }): Promise<{ extendedCount: number; expiresAt: string }> {
    const { eventId, seatNumbers, userId } = params;
    const sessionId = params.sessionId || '';
    const keys = seatNumbers.map((seatNum) => getSeatLockKey(eventId, seatNum));
    const now = Date.now();
    const ttlSeconds = env.SEAT_LOCK_TTL_SECONDS;
    const maxDurationSeconds = env.MAX_SEAT_LOCK_DURATION_SECONDS;

    let extendedCount = 0;

    if (isRedisConnected()) {
      try {
        extendedCount = (await redisClient.eval(
          EXTEND_LOCKS_LUA,
          keys.length,
          ...keys,
          ttlSeconds.toString(),
          maxDurationSeconds.toString(),
          sessionId,
          userId,
          now.toString(),
        )) as number;
      } catch (err) {
        logger.warn('Redis heartbeat failed, extending memory store', { error: err });
        extendedCount = this.heartbeatMemoryLocks(
          keys,
          userId,
          sessionId,
          ttlSeconds,
          maxDurationSeconds,
          now,
        );
      }
    } else {
      extendedCount = this.heartbeatMemoryLocks(
        keys,
        userId,
        sessionId,
        ttlSeconds,
        maxDurationSeconds,
        now,
      );
    }

    const calculatedExpiresAt = new Date(now + ttlSeconds * 1000).toISOString();
    return {
      extendedCount,
      expiresAt: calculatedExpiresAt,
    };
  }

  private static heartbeatMemoryLocks(
    keys: string[],
    userId: string,
    sessionId: string,
    ttlSeconds: number,
    maxDurationSeconds: number,
    now: number,
  ): number {
    let count = 0;
    for (const key of keys) {
      const existing = memoryLockStore.get(key);
      if (existing && (existing.sessionId === sessionId || existing.userId === userId)) {
        const firstLockedAt = existing.firstLockedAt || existing.lockedAt || now;
        const elapsedSeconds = (now - firstLockedAt) / 1000;
        let newTtl = ttlSeconds;
        if (elapsedSeconds + ttlSeconds > maxDurationSeconds) {
          newTtl = Math.max(1, Math.floor(maxDurationSeconds - elapsedSeconds));
        }
        existing.expiresAt = now + newTtl * 1000;
        memoryLockStore.set(key, existing, newTtl);
        count++;
      }
    }
    return count;
  }

  /**
   * Verify that the specified seats currently have active locks owned by this user/session.
   * Required before completing booking transaction!
   */
  static async verifyActiveLocks(params: {
    eventId: string;
    seatNumbers: string[];
    userId: string;
    sessionId?: string;
  }): Promise<boolean> {
    const { eventId, seatNumbers, userId, sessionId } = params;
    if (!seatNumbers.length) return false;

    for (const seatNumber of seatNumbers) {
      const key = getSeatLockKey(eventId, seatNumber);
      let lock: SeatLockPayload | null = null;

      if (isRedisConnected()) {
        try {
          const val = await redisClient.get(key);
          if (val) lock = JSON.parse(val);
        } catch {
          lock = memoryLockStore.get(key);
        }
      } else {
        lock = memoryLockStore.get(key);
      }

      if (!lock) return false;
      const isOwner = lock.userId === userId || (sessionId && lock.sessionId === sessionId);
      if (!isOwner) return false;
      if (Date.now() >= lock.expiresAt) return false;
    }

    return true;
  }

  /**
   * Get merged seat statuses (MongoDB permanent status + Redis temporary locks).
   */
  static async getEventSeatStatuses(params: {
    eventId: string;
    userId?: string;
    sessionId?: string;
  }): Promise<SeatStatusItem[]> {
    const { eventId, userId, sessionId } = params;

    // Fetch permanent seat status from MongoDB
    const mongoSeats = await EventSeat.find({ eventId })
      .select('seatNumber status busId bookingId')
      .lean();

    // Map by seat number
    const mongoMap = new Map(mongoSeats.map((s) => [s.seatNumber, s]));

    // Fetch all active Redis locks for this event
    const lockKeys = PASSENGER_SEAT_NUMBERS.map((num) => getSeatLockKey(eventId, num));
    const lockMap = new Map<string, SeatLockPayload>();

    if (isRedisConnected()) {
      try {
        const values = await redisClient.mget(lockKeys);
        for (let i = 0; i < lockKeys.length; i++) {
          const val = values[i];
          if (val) {
            try {
              const parsed = JSON.parse(val) as SeatLockPayload;
              if (Date.now() < parsed.expiresAt) {
                lockMap.set(PASSENGER_SEAT_NUMBERS[i], parsed);
              }
            } catch {
              // ignore json parse error
            }
          }
        }
      } catch (err) {
        logger.warn('Failed to mget Redis locks; reading memory locks', { error: err });
        for (const num of PASSENGER_SEAT_NUMBERS) {
          const lock = memoryLockStore.get(getSeatLockKey(eventId, num));
          if (lock) lockMap.set(num, lock);
        }
      }
    } else {
      for (const num of PASSENGER_SEAT_NUMBERS) {
        const lock = memoryLockStore.get(getSeatLockKey(eventId, num));
        if (lock) lockMap.set(num, lock);
      }
    }

    // Build combined status items
    const result: SeatStatusItem[] = PASSENGER_SEAT_NUMBERS.map((seatNumber) => {
      const mongoSeat = mongoMap.get(seatNumber);
      const redisLock = lockMap.get(seatNumber);

      let status: SeatStatusItem['status'] = 'available';
      let lockExpiresAt: string | null = null;
      let lockedByCurrentUser = false;

      // MongoDB status always takes precedence if booked, reserved, or blocked
      if (mongoSeat && ['booked', 'reserved', 'blocked'].includes(mongoSeat.status)) {
        status = mongoSeat.status as SeatStatusItem['status'];
      } else if (redisLock) {
        status = 'locked';
        lockExpiresAt = new Date(redisLock.expiresAt).toISOString();
        if (userId && redisLock.userId === userId) {
          lockedByCurrentUser = true;
        } else if (sessionId && redisLock.sessionId === sessionId) {
          lockedByCurrentUser = true;
        }
      } else if (mongoSeat?.status === 'available') {
        status = 'available';
      }

      return {
        seatNumber,
        status,
        lockExpiresAt,
        lockedByCurrentUser,
        busId: mongoSeat?.busId?.toString(),
        bookingId: mongoSeat?.bookingId?.toString() || null,
      };
    });

    return result;
  }
}
