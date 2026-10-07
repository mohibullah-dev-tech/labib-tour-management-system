# LTMS REST API (Phase 14)

Base URL: `http://localhost:5000/api/v1` (the same router also serves `/api`). JSON responses use `{ "success": true, "data": ... }`; failures use `{ "success": false, "error": { "code", "message" } }`.

## Authentication

| Method | Path | Access |
| --- | --- | --- |
| POST | `/auth/register` | Public; creates guest account |
| POST | `/auth/login` | Public |
| POST | `/auth/refresh` | Refresh cookie |
| POST | `/auth/logout` | Refresh cookie |
| GET | `/auth/me` | Authenticated |
| POST | `/auth/change-password` | Authenticated |
| POST | `/auth/forgot-password`, `/auth/verify-reset-code`, `/auth/reset-password`, `/auth/verify-email` | Returns `501 EMAIL_NOT_CONFIGURED`; email delivery is not enabled |

Access JWTs are short lived and held in browser memory. The rotated refresh JWT is stored only in an HTTP-only cookie. Admin and host roles are loaded from the active user record on each authenticated request; registration cannot select a role.

## Resource routes

- Public: `GET /tours`, `GET /tours/:id`, `GET /events`, `GET /events/:id`, `GET /events/:id/seats`, `GET /events/:id/announcements`, `GET /reviews`.
- Admin: `/admin/users`, `/admin/tours`, `/admin/events`, `/admin/buses`, `/admin/bookings/:id/status`, `/admin/bookings/:id/payments`, `/admin/payments`, `/admin/reviews/:id/status`.
- Account and bookings: `GET|PATCH /users/me`, `GET|POST /bookings`, `GET /bookings/:id`, `PATCH /bookings/:id/cancel`.
- Host: `GET /host/events`, `GET /host/events/:eventId/bookings`, `POST /host/events/:eventId/announcements`, and `/host/events/:eventId/location/*`.
- Messaging and notifications: `/conversations`, `/conversations/:id/messages`, `/conversations/:id/read`, `/notifications`, `/notifications/:id/read`.
- Guest reviews and live location: `POST /reviews`, `GET /events/:eventId/location` (confirmed booking required).

List endpoints accept `page` and `limit` (1–100; default 20) where pagination applies. Booking creation derives price from the saved tour template and atomically locks available seats. Payment recording is an admin action; no payment provider is connected. MongoDB transactions require a replica set.

## Development seed

Run `npm run seed --workspace=server` in a non-production environment after MongoDB is reachable. Sample accounts use password `Demo-Only-2026!`:

- `admin@example.com` — admin
- `host@example.com` — host
- `guest@example.com` — guest

The seed also creates a sample Sundarbans tour, an upcoming event and a bus layout.
