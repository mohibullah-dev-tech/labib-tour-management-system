# Real-Time Socket.IO Architecture & Integration Guide
**Labib Tour Management System (LTMS) — Phase 16**

---

## 1. Overview & Architecture

LTMS employs a hybrid distributed architecture where **REST/MongoDB** is the source of truth for persistent data, **Redis** manages ephemeral distributed locks (seat reservations), and an authenticated **Socket.IO** server layer handles low-latency real-time bidirectional communication.

```
                      +-----------------------------+
                      |     React 19 Frontend       |
                      | (useSocket, useEventRoom)   |
                      +--------------+--------------+
                                     |
                         WebSocket / HTTP Polling
                                     |
                                     v
                      +-----------------------------+
                      |   Socket.IO Server Engine   |
                      |  (Express / HTTP Server)    |
                      +--------------+--------------+
                                     |
              +----------------------+----------------------+
              |                      |                      |
              v                      v                      v
     +-----------------+    +-----------------+    +-----------------+
     | Redis Cache &   |    | MongoDB Primary |    | Role-Based Room |
     | Distributed Lock|    | Persistence     |    | Scopes (RBAC)   |
     +-----------------+    +-----------------+    +-----------------+
```

---

## 2. Authentication & Connection Lifecycle

1. **Handshake**: The client initiates a WebSocket connection passing its short-lived JWT access token in `socket.handshake.auth.token` (or `headers.authorization`).
2. **Middleware Verification (`socketAuthMiddleware`)**:
   - The token is verified against `JWT_ACCESS_SECRET` with required claims (`sub`, `iss: ltms-api`, `aud: ltms-client`).
   - The user account is validated against MongoDB to ensure `isActive: true`.
   - The user profile (`id`, `name`, `email`, `role`) is attached to `socket.data.user`.
3. **Automatic User Room Assignment**:
   - The socket automatically joins its private user room: `user:{userId}`.
   - All targeted notifications, announcements, and direct messages route through this secure personal room.

---

## 3. Predictable Room Matrix

| Room Pattern | Target Audience | Access Rules |
| :--- | :--- | :--- |
| `user:{userId}` | Single authenticated user | Auto-joined on handshake connection |
| `event:{eventId}` | All participants of a tour | Admin, assigned Host, or Guests with verified active bookings |
| `event:{eventId}:guests` | Tour guest attendees only | Guests with active/confirmed booking |
| `event:{eventId}:hosts` | Assigned host & co-hosts | Event host only |
| `event:{eventId}:admins` | Operations & Super Admins | Admin / Super Admin roles only |
| `live-location:{eventId}` | Live GPS location channel | Event participants during active tour |
| `seat:{eventId}` | Real-time seat reservation map | Event participants booking or viewing seats |
| `conversation:{conversationId}` | Chat conversation participants | Verified conversation participants or Admin |

---

## 4. Real-Time Event Catalog

### A. Live Location Tracking
- **`location:start` (Client -> Server)**:
  - *Emitted by*: Assigned Host.
  - *Payload*: `{ eventId: string, initialCoords?: GeoLocation, timestamp?: number }`.
  - *Action*: Updates `LiveLocation` in MongoDB, joins host to `live-location:{eventId}`, broadcasts `location:started`.
- **`location:update` (Client -> Server)**:
  - *Emitted by*: Assigned Host.
  - *Payload*: `{ eventId: string, latitude: number, longitude: number, accuracy?: number, heading?: number, speed?: number }`.
  - *Action*: In-memory throttled (1.5s DB persistence buffer) to prevent database flooding; instantly broadcasts `location:update` to `live-location:{eventId}`.
- **`location:stop` (Client -> Server)**:
  - *Emitted by*: Assigned Host.
  - *Payload*: `{ eventId: string, reason?: 'host_stopped' | 'tour_ended' | 'emergency' }`.
  - *Action*: Marks status `stopped`, cleans throttle records, broadcasts `location:stopped`.

### B. Seat Locking & Concurrency
- **`seat:locked` (Server -> Client)**:
  - *Broadcast to*: `seat:{eventId}`.
  - *Payload*: `{ eventId: string, seats: string[], lockedBy: 'held', expiresAt: string }`.
  - *Privacy Rule*: `lockedBy` is anonymized to `'held'` to prevent leaking guest identity.
- **`seat:released` (Server -> Client)**:
  - *Broadcast to*: `seat:{eventId}`.
  - *Payload*: `{ eventId: string, seats: string[] }`.
- **`seat:expired` (Server -> Client)**:
  - *Broadcast to*: `seat:{eventId}` when TTL runs out.
- **`seat:booked` (Server -> Client)**:
  - *Broadcast to*: `seat:{eventId}` upon permanent MongoDB transaction commit.
  - *Payload*: `{ eventId: string, seats: string[], bookingId?: string }`.

### C. Notifications
- **`notification:new` (Server -> Client)**:
  - *Delivered to*: `user:{userId}`.
  - *Payload*: `{ id, type, title, message, eventId?, bookingId?, actionUrl?, createdAt }`.
- **`notification:read` (Client -> Server & Broadcast to user's other sessions)**:
  - Marks notification as read in MongoDB and syncs all active tabs of the user.
- **`notification:read-all` (Client -> Server)**:
  - Marks all unread notifications for the user as read.

### D. Messaging & Real-Time Chat
- **`conversation:join` / `conversation:leave` (Client -> Server)**:
  - Joins / leaves `conversation:{conversationId}` after server verifies participation.
- **`message:send` (Client -> Server)**:
  - Validates participant access, persists message to MongoDB, sets conversation `lastMessageAt`, and broadcasts `message:new` to `conversation:{conversationId}`.
- **`message:typing` / `message:stop-typing` (Client -> Server)**:
  - Ephemeral events broadcast to other participants in the conversation room.
- **`message:delivered` / `message:seen` (Client -> Server)**:
  - Updates delivery/seen state in MongoDB and broadcasts update to room.

### E. Event Announcements
- **`event:announcement` (Server -> Client)**:
  - Triggered by Host or Admin creating an announcement via REST API.
  - Instantly broadcast to `event:{eventId}` and mirrored to individual user notification inboxes.

---

## 5. Client-Side Integration Patterns

### React Hooks (`client/src/lib/socket.ts`)
```tsx
import { useSocket, useEventRoom, useSocketEvent } from '@/lib/socket';

function TourSeatMap({ eventId }: { eventId: string }) {
  const queryClient = useQueryClient();

  // Automatically joins event room on mount, leaves on unmount
  useEventRoom(eventId);

  // Instantly refreshes seat map on real-time hold or release
  useSocketEvent('seat:locked', (payload) => {
    if (payload.eventId === eventId) {
      queryClient.invalidateQueries({ queryKey: ['event-seats', eventId] });
    }
  });

  useSocketEvent('seat:booked', (payload) => {
    if (payload.eventId === eventId) {
      queryClient.invalidateQueries({ queryKey: ['event-seats', eventId] });
    }
  });

  return <SeatGrid />;
}
```

---

## 6. Security & Performance Guardrails

1. **Server-Side Authorization**: Every room join (`event:join`, `conversation:join`) and state mutation executes database authorization checks.
2. **GPS Throttling**: GPS pings are throttled in memory to at most 1 database write every 1.5 seconds per tour event, preventing database write spikes while maintaining smooth live client map movement.
3. **Graceful Fallback**: If the WebSocket connection disconnects, TanStack Query polling acts as a secondary background fallback, ensuring high availability even in low-bandwidth or restricted network environments.

