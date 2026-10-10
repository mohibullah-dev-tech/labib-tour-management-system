# AI Travel Assistant System Architecture & Safety Guardrails

## 1. Executive Summary

The **Labib Tour AI Travel Assistant** is a bilingual (Bengali & English) conversational agent embedded into the website live chat and external customer channels. It provides instant, accurate travel advice, itinerary overviews, and package details while strictly preventing hallucination and enforcing safety boundaries.

---

## 2. Bilingual Support (Bangla + English)

The assistant features native language detection:
- **Bengali Recognition**: Inspects Unicode range `\u0980-\u09FF`. When Bengali text is detected, responses, itineraries, and greeting messages are delivered in standard Bengali (বাংলা).
- **English**: Serves international and domestic English-speaking tourists.
- **Language Switcher**: Visitors can switch between English and Bengali directly from the floating widget header at any time.

---

## 3. Strict Safety Guardrails & Zero-Hallucination Policy

### Non-Negotiable Operational Rules
1. **No Invented Packages, Dates, or Prices**:
   The AI assistant is strictly bound to real-time data retrieved from MongoDB:
   - `TourTemplate`: Only published templates (`isPublished: true`).
   - `TourEvent`: Only upcoming, active departures (`status: 'booking_open' | 'published'`, `departureDate >= now`).
2. **Read-Only Context**:
   The AI service never has database write access. It cannot create bookings, change seat statuses, apply discounts, or alter customer profiles.
3. **No Financial Guarantees**:
   The assistant never finalizes payments or promises unofficial fee waivers. Booking confirmations require the official booking and payment flow.
4. **Fallback Knowledge Engine**:
   If an external AI API key is omitted or unavailable, the system transparently utilizes a deterministic local knowledge formatting engine that formats real packages, prices, and dates directly from the database without any LLM hallucination risk.

---

## 4. Human Handover Protocol

The AI Assistant actively monitors conversation intent to determine when a human representative is needed.

### Handover Triggers
- Direct user requests (e.g. *"talk to human"*, *"connect me to support"*, *"মানুষের সাথে কথা বলতে চাই"*, *"এজেন্ট এর সাথে কথা বলতে চাই"*, *"কাস্টমার কেয়ার"*).
- Complex complaints, dispute reports, or payment discrepancies.
- User clicking the **"Talk to Human"** button in the chat interface.

### Handover Execution Lifecycle
1. **Handling Mode Transition**: Conversation `handlingMode` transitions from `'ai'` to `'human'`.
2. **Priority Escalation**: `priority` is escalated to `'urgent'`.
3. **Admin Alerting**: The server emits a `conversation:handover` event via Socket.IO directly to the `inbox:admin` room.
4. **AI Silence**: Once transferred, automated AI replies are silenced for the thread until staff explicitly re-enables AI assistance.
5. **Staff Takeover**: Support staff receive the full conversation transcript and customer context drawer inside the Admin Unified Inbox (`/admin/messages`).

