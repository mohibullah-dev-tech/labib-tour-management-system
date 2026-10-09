# Redis Real-Time Seat Locking & Booking Concurrency Architecture

## Overview

The Labib Tour Management System (LTMS) utilizes a distributed two-tier seat reservation architecture:
1. **Redis (In-Memory Key-Value Store)**: Serves as the high-throughput temporary seat locking coordinator to prevent concurrent double-booking race conditions.
2. **MongoDB (Document Database)**: Acts as the permanent and immutable source of truth for confirmed bookings and persistent seat states (`available`, `booked`, `reserved`, `blocked`).

```mermaid
flowchart TD
    User["Guest / Customer"]
    API["Express REST API (/api/events/:id/seats/lock)"]
    Redis["Redis (Atomic Lua Lock Script)"]
    Mongo["MongoDB (EventSeat & Booking)"]
    Confirmed["Booking Confirmed (Status: Booked)"]

    User -->|"1. Selects seats (e.g. A1, A2)"| API
    API -->|"2. Checks MongoDB (booked/reserved/blocked?)"| Mongo
    API -->|"3. Atomic SET NX EX (labib:seat-lock:...)"| Redis
    Redis -- "Held by another?" -->|"Conflict 409"| User
    Redis -- "All seats available" -->|"Success (TTL: 600s)"| User
    User -->|"4. Submits Booking with idempotencyKey"| API
    API -->|"5. Verify Redis lock ownership"| Redis
    API -->|"6. Start Transaction (Booking + EventSeat)"| Mongo
    Mongo -->|"7. Update EventSeat status = booked"| Mongo
    API -->|"8. Release temporary Redis locks"| Redis
    API -->|"9. Return Booking Response"| Confirmed
```

---

## 1. Redis Key Design & Namespacing

Seat locks are strictly scoped to the specific tour event and seat number:

```text
labib:seat-lock:{eventId}:{seatNumber}
```

*Example:* `labib:seat-lock:66f5c09a89123456789abcde:A1`

### Stored Lock Payload (JSON)
```json
{
  "userId": "66f5c09a89123456789aaa01",
  "sessionId": "sess_m1abc23_xyz789",
  "eventId": "66f5c09a89123456789abcde",
  "seatNumber": "A1",
  "lockedAt": 1728345678901,
  "expiresAt": 1728346278901,
  "firstLockedAt": 1728345678901
}
```

*Security rule:* Sensitive personal information (passwords, payment tokens, phone numbers) is never stored in Redis.

---

## 2. Lock Expiration & Heartbeat Strategy

- **Initial TTL (`SEAT_LOCK_TTL_SECONDS`)**: 600 seconds (10 minutes).
- **Max Session Duration (`MAX_SEAT_LOCK_DURATION_SECONDS`)**: 900 seconds (15 minutes).
- **Automatic Cleanup**: Abandoned booking sessions expire automatically via Redis native TTL; administrators never need to manually unlock abandoned seats.
- **Heartbeat Endpoint (`POST /api/events/:eventId/seats/heartbeat`)**:
  - The client transmits a lightweight heartbeat while the user is actively entering passenger details.
  - The server verifies lock ownership and extends the TTL up to the maximum capped duration of 900 seconds.

---

## 3. Multi-Seat Atomic Acquisition (All-or-Nothing)

To prevent partial reservation anomalies (e.g., booking a 2-person package where seat A1 succeeds but seat A2 is taken), seat acquisition executes via an atomic Redis Lua script:

```lua
local ttl = tonumber(ARGV[1])
local payloadJson = ARGV[2]
local sessionId = ARGV[3]
local userId = ARGV[4]

-- Step 1: Verify NO seat is held by another user/session
for i, key in ipairs(KEYS) do
  local existing = redis.call('GET', key)
  if existing then
    local data = cjson.decode(existing)
    if data.userId ~= userId and data.sessionId ~= sessionId then
      return {0, key} -- Conflict detected, return failing key
    end
  end
end

-- Step 2: Acquire all requested seats atomically
for i, key in ipairs(KEYS) do
  redis.call('SET', key, payloadJson, 'EX', ttl)
end

return {1, "OK"}
```

If ANY seat is already held or booked, **no locks are set** and a `409 Conflict` status is returned with:
`"This seat is currently being held by another customer."`

---

## 4. Safe Lock Release & Ownership Enforcement

Locks can only be released by their legitimate owner:
```lua
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
```

---

## 5. Booking Confirmation & MongoDB Transaction

When the user submits the booking form:

1. **Idempotency Protection**: Checks `idempotencyKey` in Redis (`labib:idempotency:{userId}:{idempotencyKey}`) to eliminate accidental duplicate charges from double clicks or network retries.
2. **Lock Ownership Verification**: Invokes `SeatLockService.verifyActiveLocks` to guarantee the current user holds active, unexpired locks for every selected seat.
3. **MongoDB Transaction**:
   - Initiates `session.withTransaction` (with fallback for non-replica set environments).
   - Re-checks `EventSeat` persistence status.
   - Inserts `Booking` record.
   - Updates `EventSeat`: `status = 'booked'`, `bookingId = booking._id`.
   - Commits transaction.
4. **Redis Cleanup**: Releases temporary Redis locks once permanent booking persistence succeeds.

---

## 6. Real-Time Seat Status Model

The backend merges MongoDB permanent states with Redis temporary locks into a single composite representation:

| MongoDB Status | Redis Status | Resulting API Status | Can Book? | Description |
| :--- | :--- | :--- | :--- | :--- |
| `available` | None | `available` | Yes | Open for selection |
| `available` | Held by current user | `locked` (`lockedByCurrentUser: true`) | Yes | Currently selected / held by you |
| `available` | Held by another user | `locked` (`lockedByCurrentUser: false`) | No | Temporarily unavailable |
| `booked` | Any | `booked` | No | Permanently booked in MongoDB |
| `reserved` | Any | `reserved` | No | Reserved by administrative policy |
| `blocked` | Any | `blocked` | No | Mechanically or safety blocked |

*Privacy guarantee:* When a seat is held by another customer, their identity, phone number, and user ID are strictly hidden from other users.

---

## 7. Frontend Integration & Countdown Timer

- **`SeatLockCountdown`**:
  - Derives remaining time directly from the server-provided `expiresAt` ISO timestamp, eliminating client clock drift.
  - Automatically re-synchronizes when the browser tab transitions from hidden to visible.
  - Displays `MM:SS` (e.g. `09:59`), pulsing with amber warning under 2 minutes.
  - Disables the "Confirm Booking" button immediately upon expiration and prompts the user to re-select seats.
- **Session Preservation**:
  - Scoped `seatLockSessionId` stored in `sessionStorage` allows browser refreshes during seat selection without dropping acquired locks.
- **Double-Click Prevention**:
  - Confirm button is disabled with an active loading state during form submission.

---

## 8. Environment Variables

```env
# Redis URL
REDIS_URL=redis://127.0.0.1:6379

# Seat lock configuration (in seconds)
SEAT_LOCK_TTL_SECONDS=600
MAX_SEAT_LOCK_DURATION_SECONDS=900
```

