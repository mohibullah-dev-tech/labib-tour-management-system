# Communications Security, Privacy & Reliability Architecture

## 1. Threat Model & Security Principles

The Unified Communication System handles public customer interactions, external webhooks, and administrative CRM data. Security is enforced through multiple defensive layers:

```
[External Webhooks] ──> Cryptographic HMAC/Secret Verification ──> Sanitization & Deduplication ──> DB & Socket
[Website Visitors]  ──> Scoped Guest Session JWT ──────────────> Room Isolation (No Eavesdropping) ──> DB & Socket
[Admins & Staff]    ──> RBAC Middleware (Admin/SuperAdmin) ─────> Full Multi-Channel Inbox Access
```

---

## 2. Authentication & Authorization

### Zero-Trust Client Boundary
- **Sender Spoofing Prevention**: The server never trusts client-provided sender IDs, user roles, booking ownership, or channel identities.
- **Visitor Isolation**:
  - Unauthenticated website visitors receive an ephemeral JWT scoped with `type: 'guest_chat_session'`.
  - Visitors can **only** read and write messages to their own `guestConversationId`.
  - Attempting to query, join, or mutate conversations belonging to other visitors or registered users is rejected with `403 Forbidden` / `unauthorized`.
- **Administrative RBAC**:
  - Endpoints under `/api/v1/communications/admin/*` require authenticated user sessions with `Admin` or `SuperAdmin` roles enforced by `authenticate` and `authorizeRoles(Role.Admin, Role.SuperAdmin)`.

---

## 3. Webhook Cryptographic Verification

All inbound webhook traffic from external providers is cryptographically authenticated before processing:

### Meta Platforms (WhatsApp, Facebook Messenger, Instagram Direct)
- Header: `X-Hub-Signature-256: sha256=<HMAC_HEX>`
- Algorithm: HMAC with SHA-256 using `META_APP_SECRET`.
- Time-safe comparison: `crypto.timingSafeEqual` prevents timing-attack vulnerabilities.
- Verification challenge: GET requests require matching `hub.verify_token === META_WEBHOOK_VERIFY_TOKEN`.

### Telegram Bot API
- Header: `X-Telegram-Bot-Api-Secret-Token`
- Secret matching against `TELEGRAM_WEBHOOK_SECRET`. Requests lacking this header or with an invalid token are dropped immediately with `401 Unauthorized`.

---

## 4. Message Idempotency & Deduplication

External messaging webhooks (particularly Meta Cloud API) frequently re-deliver messages if network acknowledgments are delayed.
- Every incoming message has its external provider identifier extracted (e.g. `wamid...`, Meta message ID, Telegram message ID).
- Stored in MongoDB with `providerMessageId` as a **sparse index**.
- Before writing a new message record or dispatching automated AI answers, the service queries `Message.findOne({ providerMessageId })`.
- If an existing record is found, the duplicate webhook event is acknowledged with HTTP 200 without creating duplicate database rows or duplicate customer notifications.

---

## 5. Rate Limiting & Abuse Prevention

1. **Guest Chat Session Issuance**:
   - Rate-limited to prevent automated bot flooding and session starvation.
2. **Inbound Message Throttle**:
   - Chat message endpoints enforce rate limits per IP address and per conversation ID.
3. **Safe Knowledge Extraction**:
   - The AI Travel Assistant queries only public, sanitized fields (`title`, `destination`, `durationDays`, `pricing`, `inclusions`).
   - Customer PII, admin private notes, booking payment tokens, and password hashes are excluded at the database projection level.
