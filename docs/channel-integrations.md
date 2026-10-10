# External Channel Integrations & Webhook Setup

## 1. Overview & Separation of Concerns

The Labib Tour & Travel Group Unified Communication System enforces a strict rule:
> **Never claim that an external channel is connected when its account credentials, permissions, webhook verification, or platform configuration are missing.**

When an external platform (Meta / Telegram) is not configured, the application displays an honest `not_configured` badge in the Admin Unified Inbox, while website visitors are gracefully offered public contact links (e.g. WhatsApp Click-to-Chat with sanitized numbers).

---

## 2. WhatsApp Business Cloud API

### Configuration Variables (`.env`)
```env
# Meta / WhatsApp Credentials
META_PAGE_ACCESS_TOKEN=EAAG...
META_APP_SECRET=a8b3...
META_WEBHOOK_VERIFY_TOKEN=labib_tour_meta_verify_token_2026
WHATSAPP_PHONE_NUMBER_ID=109876543210
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321098
PUBLIC_WHATSAPP_NUMBER=+8801819800000
```

### Webhook Endpoints
- **Verify Webhook (GET)**: `/api/v1/communications/webhooks/meta`
  - Validates `hub.mode === 'subscribe'` and `hub.verify_token === META_WEBHOOK_VERIFY_TOKEN`.
  - Responds with `hub.challenge`.
- **Receive Events (POST)**: `/api/v1/communications/webhooks/meta`
  - Validates cryptographic signature header: `X-Hub-Signature-256`.
  - Extracts WhatsApp messages (`changes[0].value.messages[0]`).
  - Stores message with `providerMessageId: message.id` (idempotent deduplication).
  - Triggers AI response (if handling mode is `ai`) or alerts admin inbox.

### Public Click-to-Chat Fallback
When API credentials are not yet verified, website visitors use standard WhatsApp Click-to-Chat:
`https://wa.me/8801819800000?text=Hello%20Labib%20Tour!%20...`
Numbers are sanitized by `formatWhatsAppClickToChat()` to ensure valid formatting across all mobile devices.

---

## 3. Facebook Messenger

### Webhook Setup
Facebook Messenger uses the same Meta Webhook endpoint:
- **Endpoint**: `/api/v1/communications/webhooks/meta`
- **Fields Subscribed**: `messages`, `messaging_postbacks`
- **Signature Verification**: Validated via `META_APP_SECRET` using `HMAC-SHA256`.
- **Sender ID**: Customer's Page-Scoped ID (PSID).
- **Outbound Dispatch**: Sends via `https://graph.facebook.com/v21.0/me/messages` with `recipient.id = PSID`.

---

## 4. Instagram Direct Messages

### Webhook Setup
Instagram uses the Meta Graph API for Professional Accounts:
- **Endpoint**: `/api/v1/communications/webhooks/meta`
- **Fields Subscribed**: `instagram_messaging`
- **Sender ID**: Instagram Scoped ID (IGSID).
- **Outbound Dispatch**: Sends via `https://graph.facebook.com/v21.0/me/messages` with `recipient.id = IGSID`.

---

## 5. Telegram Bot API

### Configuration Variables (`.env`)
```env
TELEGRAM_BOT_TOKEN=123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_WEBHOOK_SECRET=labib_telegram_webhook_secret_key_2026
PUBLIC_TELEGRAM_URL=https://t.me/labibtour
```

### Webhook Setup
- **Endpoint (POST)**: `/api/v1/communications/webhooks/telegram`
- **Security**: Validates incoming header `X-Telegram-Bot-Api-Secret-Token` against `TELEGRAM_WEBHOOK_SECRET`.
- **Sender ID**: Customer's Telegram Chat ID (`message.chat.id`).
- **Outbound Dispatch**: Dispatches via `https://api.telegram.org/bot<TOKEN>/sendMessage`.

---

## 6. Adapter Architecture & Extensibility

All channels implement the `BaseChannelAdapter` abstract interface (`server/src/modules/communications/adapters/base.adapter.ts`):
```typescript
export interface BaseChannelAdapter {
  channel: CommunicationChannel;
  isConfigured(): boolean;
  sendTextMessage(recipientId: string, text: string): Promise<ChannelSendResult>;
  verifyWebhook(req: Request): boolean;
  parseInboundMessage(req: Request): InboundMessagePayload | null;
}
```
This modular structure allows adding new channels (e.g. Viber, SMS Gateway, Email) without modifying the core messaging, conversation, or AI pipelines.
