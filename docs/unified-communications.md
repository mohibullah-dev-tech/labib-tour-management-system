# Unified Communication System Architecture

## 1. Overview & Objective

The **Labib Tour & Travel Group Unified Communication System** centralizes multi-channel customer communications into a single, high-performance, real-time workspace.

### Supported Channels
1. **Website Live Chat**: Native real-time web chat supporting both anonymous visitors (guest chat sessions) and authenticated travelers.
2. **WhatsApp Business**: Official WhatsApp Business Cloud API integration + instant Click-to-Chat fallback.
3. **Facebook Messenger**: Meta Graph API webhook and send integration.
4. **Instagram Direct Messages**: Meta Professional Instagram Direct integration.
5. **Telegram**: Telegram Bot API webhook integration.

---

## 2. Core Architecture & Data Models

### Database Persistence (MongoDB)
The system builds upon and extends the existing `Conversation` and `Message` models, preserving all previous booking and user relations without breaking changes.

#### Conversation Model Extensions
- `channel`: `'website' | 'whatsapp' | 'facebook' | 'instagram' | 'telegram' | 'internal'`
- `externalContactId`: External platform ID (WhatsApp phone number, Meta PSID / IGSID, Telegram chat ID).
- `customerDisplayName`: Customer's public name on the channel.
- `customerPhone`: Contact phone number when provided or extracted.
- `customerEmail`: Customer email if captured.
- `customerId`: Reference to registered `User` (if logged in).
- `assignedTo`: Reference to assigned staff/admin `User`.
- `status`: `'pending' | 'active' | 'waiting' | 'resolved' | 'archived'`
- `priority`: `'low' | 'normal' | 'high' | 'urgent'`
- `handlingMode`: `'ai' | 'human' | 'hybrid'`
- `bookingId`: Reference to related `Booking` (for contextual reservation inquiries).
- `unreadCountAdmin` & `unreadCountCustomer`: Independent counter tracking.

#### Message Model Extensions
- `conversationId`: Reference to parent conversation.
- `channel`: Channel through which message arrived or was dispatched.
- `direction`: `'inbound' | 'outbound'`
- `senderType`: `'customer' | 'staff' | 'ai' | 'system'`
- `senderId`: User ID or visitor identifier.
- `senderName`: Display label of sender.
- `providerMessageId`: Sparse-indexed external ID (e.g., `wamid...`, Meta message ID, Telegram message ID) used for **idempotent message deduplication**.
- `status`: `'sending' | 'sent' | 'delivered' | 'seen' | 'failed'`
- `deliveryError`: Descriptive error if delivery fails.

---

## 3. Real-Time Socket.IO Architecture

### Socket Authentication & Room Scoping
1. **Authenticated Users**: Authenticated via access tokens (JWT).
   - Staff/Admins automatically join the `inbox:admin` room to receive real-time notifications for every incoming conversation and message across all channels.
2. **Website Visitors (Guest Sessions)**:
   - When a visitor opens the chat widget, the server issues a scoped JWT (`issuer: 'ltms-guest-session'`, `type: 'guest_chat_session'`) containing a generated `visitorId` and `guestConversationId`.
   - The visitor connects to Socket.IO using this token and is only authorized to join `conversation:<guestConversationId>`.
   - Cross-room joining and eavesdropping are strictly prevented by `socketAuthMiddleware`.

### Socket Events
- `conversation:join`: Subscribes a client to a conversation room.
- `conversation:leave`: Unsubscribes a client.
- `message:new`: Broadcasts a persisted message to conversation participants and `inbox:admin`.
- `message:status`: Updates delivery or seen status.
- `conversation:updated`: Broadcasts handling mode changes, assignments, and status updates.
- `conversation:handover`: Alerts admin staff when AI triggers human assistance.

---

## 4. Admin Unified Inbox (`/admin/messages`)

The Admin Unified Inbox features a responsive 3-panel CRM layout:
1. **Conversation Navigation & Filters**:
   - Filter by channel: All, Website, WhatsApp, Messenger, Instagram, Telegram.
   - Filter by status: All, Pending, Active, Resolved.
   - Search bar: Real-time search across customer names, phones, and message previews.
   - Live badge indicators showing unread counts and channel tags.
2. **Active Live Chat Thread**:
   - Displays real-time message stream with sender attribution (Customer, Staff, AI Assistant).
   - Quick handover controls: Toggle between AI Assistant handling and Human Staff takeover.
   - Rich message composer supporting Shift+Enter newlines, Enter to send, and delivery status badges.
3. **Customer & Booking CRM Context Drawer**:
   - Channel metadata, customer contact details, and platform identifiers.
   - Related Booking details (Package, Travel Dates, Payment Status, Due Amount).
   - One-click links to guest profile and booking invoice.

---

## 5. Website Floating Live Chat Widget

A modern, responsive floating widget on the public website:
- **Instant AI Assistance**: Greets travelers in Bengali or English.
- **Quick Inquiry Prompts**: Suggested chips for popular questions (Upcoming tours, Booking process, Helpline).
- **Human Handover Button**: Allows guests to request a human operator at any moment.
- **Direct Channel Shortcuts**: Quick-action links to WhatsApp Click-to-Chat, Facebook Messenger, Instagram, and Telegram.

