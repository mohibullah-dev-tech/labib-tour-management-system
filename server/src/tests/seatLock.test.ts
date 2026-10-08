import assert from 'node:assert/strict';
import test from 'node:test';
import { getRedisStatus, disconnectRedis } from '@/config/redis.js';
import { SeatLockService, getSeatLockKey } from '@/modules/seats/seatLock.service.js';
import { TourEvent } from '@/models/TourEvent.model.js';
import { EventSeat } from '@/models/EventSeat.model.js';
import { ApiError } from '@/utils/ApiError.js';

test.after(async () => {
  await disconnectRedis();
});

test('Redis health status returns a valid connection status', () => {
  const status = getRedisStatus();
  assert.ok(['connected', 'disconnected', 'connecting', 'unavailable'].includes(status));
});

test('Seat lock key naming convention follows labib:seat-lock:{eventId}:{seatNumber}', () => {
  const key = getSeatLockKey('evt_123', 'A1');
  assert.equal(key, 'labib:seat-lock:evt_123:A1');
});

test('SeatLockService: single seat atomic locking, collision, and ownership', async (t) => {
  const mockEventId = '66f5c09a89123456789abcde';
  const userA = '66f5c09a89123456789aaa01';
  const userB = '66f5c09a89123456789bbb02';

  // Mock TourEvent.findById and EventSeat.find
  const originalFindById = TourEvent.findById;
  const originalEventSeatFind = EventSeat.find;

  // @ts-expect-error Mocking for test
  TourEvent.findById = () => ({
    select: () => ({
      lean: async () => ({ _id: mockEventId, status: 'booking_open' }),
    }),
  });

  // @ts-expect-error Mocking for test
  EventSeat.find = () => ({
    select: () => ({
      lean: async () => [],
    }),
  });

  t.after(() => {
    TourEvent.findById = originalFindById;
    EventSeat.find = originalEventSeatFind;
  });

  // 1. User A locks A1
  const lockA = await SeatLockService.lockSeats({
    eventId: mockEventId,
    seatNumbers: ['A1'],
    userId: userA,
    sessionId: 'session_A',
    ttlSeconds: 5,
  });

  assert.equal(lockA.seatNumbers[0], 'A1');
  assert.ok(lockA.expiresAt);

  // 2. User B tries to lock A1 -> Expected: 409 Conflict
  await assert.rejects(
    SeatLockService.lockSeats({
      eventId: mockEventId,
      seatNumbers: ['A1'],
      userId: userB,
      sessionId: 'session_B',
    }),
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      assert.ok(err.message.includes('currently being held by another customer'));
      return true;
    },
  );

  // 3. User B tries to release User A's lock -> Expected: 0 released (unauthorized release protected)
  const unauthorizedRelease = await SeatLockService.releaseSeats({
    eventId: mockEventId,
    seatNumbers: ['A1'],
    userId: userB,
    sessionId: 'session_B',
  });
  assert.equal(unauthorizedRelease.releasedCount, 0);

  // Lock still active for User A
  const stillActive = await SeatLockService.verifyActiveLocks({
    eventId: mockEventId,
    seatNumbers: ['A1'],
    userId: userA,
    sessionId: 'session_A',
  });
  assert.equal(stillActive, true);

  // 4. User A releases own lock
  const userARelease = await SeatLockService.releaseSeats({
    eventId: mockEventId,
    seatNumbers: ['A1'],
    userId: userA,
    sessionId: 'session_A',
  });
  assert.equal(userARelease.releasedCount, 1);

  // Now User B can lock A1
  const lockB = await SeatLockService.lockSeats({
    eventId: mockEventId,
    seatNumbers: ['A1'],
    userId: userB,
    sessionId: 'session_B',
    ttlSeconds: 5,
  });
  assert.equal(lockB.seatNumbers[0], 'A1');

  // Clean up
  await SeatLockService.releaseSeats({
    eventId: mockEventId,
    seatNumbers: ['A1'],
    userId: userB,
    sessionId: 'session_B',
  });
});

test('SeatLockService: multi-seat atomic locking with all-or-nothing rollback', async (t) => {
  const mockEventId = '66f5c09a89123456789abcde';
  const userA = '66f5c09a89123456789aaa01';
  const userB = '66f5c09a89123456789bbb02';

  const originalFindById = TourEvent.findById;
  const originalEventSeatFind = EventSeat.find;

  // @ts-expect-error Mocking for test
  TourEvent.findById = () => ({
    select: () => ({
      lean: async () => ({ _id: mockEventId, status: 'booking_open' }),
    }),
  });

  // @ts-expect-error Mocking for test
  EventSeat.find = () => ({
    select: () => ({
      lean: async () => [],
    }),
  });

  t.after(() => {
    TourEvent.findById = originalFindById;
    EventSeat.find = originalEventSeatFind;
  });

  // User A locks A2
  await SeatLockService.lockSeats({
    eventId: mockEventId,
    seatNumbers: ['A2'],
    userId: userA,
    sessionId: 'session_A',
    ttlSeconds: 5,
  });

  // User B tries to lock [A1, A2] -> A2 conflicts.
  // CRITICAL REQUIREMENT: A1 must NOT be left locked! Must rollback completely.
  await assert.rejects(
    SeatLockService.lockSeats({
      eventId: mockEventId,
      seatNumbers: ['A1', 'A2'],
      userId: userB,
      sessionId: 'session_B',
    }),
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.statusCode, 409);
      return true;
    },
  );

  // Verify A1 was rolled back and is completely free (e.g. another user C can lock A1)
  const userC = '66f5c09a89123456789ccc03';
  const lockC = await SeatLockService.lockSeats({
    eventId: mockEventId,
    seatNumbers: ['A1'],
    userId: userC,
    sessionId: 'session_C',
    ttlSeconds: 5,
  });
  assert.equal(lockC.seatNumbers[0], 'A1');

  // Clean up
  await SeatLockService.releaseSeats({
    eventId: mockEventId,
    seatNumbers: ['A1'],
    userId: userC,
    sessionId: 'session_C',
  });
  await SeatLockService.releaseSeats({
    eventId: mockEventId,
    seatNumbers: ['A2'],
    userId: userA,
    sessionId: 'session_A',
  });
});

test('SeatLockService: lock expiration after TTL', async (t) => {
  const mockEventId = '66f5c09a89123456789abcde';
  const userA = '66f5c09a89123456789aaa01';

  const originalFindById = TourEvent.findById;
  const originalEventSeatFind = EventSeat.find;

  // @ts-expect-error Mocking for test
  TourEvent.findById = () => ({
    select: () => ({
      lean: async () => ({ _id: mockEventId, status: 'booking_open' }),
    }),
  });

  // @ts-expect-error Mocking for test
  EventSeat.find = () => ({
    select: () => ({
      lean: async () => [],
    }),
  });

  t.after(() => {
    TourEvent.findById = originalFindById;
    EventSeat.find = originalEventSeatFind;
  });

  // Lock seat with 1-second TTL
  await SeatLockService.lockSeats({
    eventId: mockEventId,
    seatNumbers: ['B1'],
    userId: userA,
    sessionId: 'session_short',
    ttlSeconds: 1,
  });

  // Initially active
  const activeNow = await SeatLockService.verifyActiveLocks({
    eventId: mockEventId,
    seatNumbers: ['B1'],
    userId: userA,
    sessionId: 'session_short',
  });
  assert.equal(activeNow, true);

  // Wait 1.1s for expiration
  await new Promise((resolve) => setTimeout(resolve, 1100));

  // Now expired
  const activeAfter = await SeatLockService.verifyActiveLocks({
    eventId: mockEventId,
    seatNumbers: ['B1'],
    userId: userA,
    sessionId: 'session_short',
  });
  assert.equal(activeAfter, false);
});
