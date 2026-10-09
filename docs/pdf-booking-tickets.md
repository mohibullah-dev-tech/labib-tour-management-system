# Phase 17 — Production PDF Booking Slip & Confirmation System

## 1. Overview & Architecture

The PDF Booking Slip & Confirmation System in **Labib Tour Management System (LTMS)** provides server-generated, cryptographically consistent, and print-ready PDF tickets and receipts for all bookings across the platform.

```
Guest / Admin / Host UI
        │
        ▼ (Axios apiClient with Bearer JWT, responseType: 'blob')
GET /api/bookings/:bookingId/ticket.pdf
GET /api/bookings/:bookingId/receipt.pdf
        │
        ▼ (authenticate + RBAC middleware)
Resource Router (`resource.routes.ts`)
        │
        ▼
PDF Booking Service (`bookingPdf.service.ts`)
        ├── 1. Fetch & verify Booking, Event, Template, Bus, User records
        ├── 2. Strict Role-Based Access Control (RBAC) validation
        ├── 3. Status eligibility checks (confirmed vs pending)
        ├── 4. Trusted backend financial recalculation (`calculateBookingFinance`)
        └── 5. PDFKit document stream generation (A4 format, brand layout)
        │
        ▼
HTTP Response (Content-Type: application/pdf, streamed directly to client)
```

---

## 2. API Endpoint Specifications

### 2.1 Get Confirmed Booking Ticket PDF
* **URL:** `/api/bookings/:bookingId/ticket.pdf` (also alias `/api/bookings/:bookingId/ticket`)
* **Method:** `GET`
* **Authentication:** Required (`Bearer <access_token>`)
* **Headers:**
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="ticket-<bookingCode>.pdf"`
  - `Cache-Control: private, no-cache, no-store, must-revalidate`
* **Eligibility Rule:** Only bookings with `bookingStatus` of `confirmed` or `completed` can generate a confirmed ticket.
* **Error Response (Pending Booking):**
  - Status: `409 Conflict`
  - Body: `{ "success": false, "message": "Booking is pending confirmation and is not eligible for a confirmed ticket. Please download the receipt instead or complete the required advance payment." }`
* **Error Response (Cancelled Booking):**
  - Status: `409 Conflict`
  - Body: `{ "success": false, "message": "Cannot generate a confirmed ticket for a cancelled booking." }`

### 2.2 Get Booking Receipt PDF
* **URL:** `/api/bookings/:bookingId/receipt.pdf` (also alias `/api/bookings/:bookingId/receipt`)
* **Method:** `GET`
* **Authentication:** Required (`Bearer <access_token>`)
* **Headers:**
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="receipt-<bookingCode>.pdf"`
  - `Cache-Control: private, no-cache, no-store, must-revalidate`
* **Eligibility Rule:** Available for `pending`, `confirmed`, and `completed` bookings.

---

## 3. Role-Based Access Control (RBAC) Rules

The document download endpoints enforce server-side security checks:

1. **Guest Users (`role === 'guest'`):**
   - Can strictly download documents only for bookings where `booking.customerId === req.user.id`.
   - Attempting to download any other guest's booking returns `403 Forbidden`.

2. **Host Users (`role === 'host'`):**
   - Can access bookings belonging to events assigned to them (`event.hostId === req.user.id` or matching `HostProfile.assignedEventIds`).
   - Attempting to access bookings for events assigned to other hosts returns `403 Forbidden`.

3. **Admin & Super Admin (`role === 'admin' | 'super_admin'`):**
   - Authorized to view and download tickets and receipts for any booking in the system.

4. **Unauthenticated / Invalid Users:**
   - Rejected at the `authenticate` middleware with `401 Unauthorized`.

---

## 4. Financial Calculation & Data Integrity

* **Never Trust Frontend Calculations:** All prices, discounts, advance minimums, received amounts, and outstanding due balances are recalculated strictly on the backend using the trusted financial calculator:
  ```ts
  calculateBookingFinance({
    unitPrice: packagePrice,
    quantity: booking.personCount,
    amountReceived: booking.receivedAmount,
    discount: booking.discount,
    minimumAdvancePercent: template.minimumAdvancePercent,
  })
  ```
* **Currency Formatting:** All financial figures are formatted in Bangladeshi Taka (`BDT 1,500.00` / `৳`) using consistent decimal formatting.

---

## 5. Transportation & Seat Rules

* **Dedicated Bus Rule:** Every Tour Event in LTMS is strictly assigned exactly one dedicated bus (`TourEvent.busId -> Bus`).
* **Confirmed Seat Allocation:** The PDF displays only permanently booked seats from the trusted `Booking.seatNumbers` and `EventSeat` records. Temporarily locked seats or expired Redis locks are never rendered as confirmed seats.

---

## 6. Frontend Integration

1. **Client Ticket Service (`client/src/features/booking/services/ticket.service.ts`):**
   - `downloadTicketPdf(bookingId, bookingCode)`: Issues authenticated Axios request with `responseType: 'blob'`, triggers safe file download, and handles error responses from blob payloads.
   - `downloadReceiptPdf(bookingId, bookingCode)`: Downloads the official payment receipt.
2. **Booking Success Step (`BookingSuccessStep.tsx`):**
   - Direct action buttons for `Download Ticket PDF` and `Download Receipt` with live loading states and Sonner notifications.
3. **Guest Digital Ticket Modal (`DigitalTicket.tsx` & `TicketsView.tsx`):**
   - Integrated `Download Ticket PDF` / `Download Receipt` action with visual spinner feedback.
4. **Admin Booking Dialog (`BookingDetailDialog.tsx`):**
   - `Print Ticket` and `Download PDF` buttons wired to stream official tickets.
5. **Guest Payments View (`PaymentsView.tsx`):**
   - Download Receipt button wired directly to `ticketService.downloadReceiptPdf`.

---

## 7. Testing & Verification

The test suite covers 9 key verification scenarios in `server/src/tests/pdf.test.ts`:
1. Successful PDF generation for confirmed bookings (binary chunk validation with `%PDF-` header).
2. Pending bookings rejected for confirmed tickets with HTTP 409.
3. Pending bookings allowed to generate official receipts.
4. Guest cross-account download blocked with HTTP 403.
5. Host allowed to download tickets for assigned events.
6. Host rejected for unassigned events with HTTP 403.
7. Admin access permitted for any booking.
8. Non-existent booking IDs return HTTP 404.
9. Missing optional fields (host details, pickup locations) handle graceful fallbacks without crashing.

### How to Run Tests
```bash
npm --prefix server test
```
