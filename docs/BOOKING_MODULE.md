# LTMS Booking Module

Status: complete 7-step booking flow UI (Select Event → Package → Bus → Seat → Details → Summary → Success) against typed mock data. No backend calls, no payment gateway — every business rule (minimum advance, pricing) is a clearly-marked placeholder formula the backend will eventually own.

---

## 1. Why one `BookingProvider` instead of URL-routed steps

The 7 steps share one continuously-growing draft (event → package → bus → seats → guest info → confirmation) where each step depends on everything chosen before it. Rather than 7 separate routes passing state through URL params or a global store, `BookingProvider` (`useReducer` + Context) holds the whole draft in memory, scoped to `BookingPage` only — it's created when the page mounts and discarded when the guest navigates away, so a new booking always starts clean. `BookingWizard` reads `draft.step` and renders exactly one step component; moving between steps is a reducer action, not a navigation.

The one exception: `?tourId=` **is** a real URL query param (read via `useSearchParams`), because arriving at Step 1 pre-filtered from a specific Tour's "Book Now" button is a genuine deep-linkable entry point worth preserving in the URL — see decision #2.

## 2. Connecting Tours → Booking

Every existing "Book Now"/"Book Tour" button in the app (Navbar, mobile drawer, Home Hero, Home's closing CTA banner, Tours module's `TourCard` and `StickyBookingSummary`) now points at `/booking`, and the Tours-module buttons pass `?tourId=<id>` so `SelectEventStep` opens pre-filtered to that tour's events (with a "Show all" escape hatch). This was a deliberate connection made this phase — the booking flow isn't useful in isolation from where guests actually discover tours.

## 3. Business rules are placeholders, not real logic — and are labeled as such everywhere

Per the brief: minimum advance amounts (`utils/pricing.ts`'s `MIN_ADVANCE_PER_GUEST_BY_CATEGORY`) are hardcoded per the three examples given (Day 500 / Relax 1000 / Premium 2000 BDT per guest) plus a reasonable placeholder for "seasonal" (1500) that wasn't specified. `computePricing()` is a **pure function** — no side effects, no fetch — that takes category/price/guestCount/discount/receivedAmount and returns a `PricingBreakdown`. This exact shape is what a future `POST /api/v1/bookings/quote` endpoint should return; swapping the client-side calculation for a real API response later only touches the one call site in `BookingSummaryStep`.

## 4. Seat selection: `Seat` → `SeatRow` → `SeatMap`

Three layers, each independently reusable:
- **`Seat`** — one memoized button, six visual states (`available`, `selected`, `booked`, `locked`, `reserved`, `female-reserved`), only `available` is interactive.
- **`SeatRow`** — lays out one row: 2 seats | aisle | 2 seats for rows A–J, or a full 5-seat bench for the back row K, per the brief's exact layout.
- **`SeatMap`** — composes all rows plus a decorative driver/helper/door header, wraps everything in a horizontally-scrollable container, and adds a mobile-only zoom control (`transform: scale()` at 3 levels) since a real pinch-gesture library wasn't justified for this scope.

Seat *status* (available/booked/locked/reserved/female-reserved) comes from mock data (`data/buses.ts`) exactly as a backend would send it; *selection* is separate client-side state in `BookingProvider` — a seat is never actually "selected" in its own status field, avoiding the two concerns (server truth vs. local UI state) getting tangled.

## 5. "Select Bus" displays, it doesn't offer a choice

Per the business rule "one event = one bus," `BusCard` and `SelectBusStep` show the event's single bus and a "Continue" button — there's deliberately no picker UI, because building one would imply a choice that doesn't exist in the business model. This is the concrete application of "Do NOT use fake business logic."

## 6. Forms: react-hook-form + zod, matching the project's chosen stack

`GuestForm` validates with the exact same libraries (`react-hook-form`, `@hookform/resolvers/zod`, `zod`) already in the project's tech stack — no new form library introduced. "Booking Type" from the brief's Step 5 field list is shown **read-only** (referencing the package already chosen in Step 2) rather than re-asked as a second, potentially contradictory selection.

## 7. Booking ID and QR code are placeholders

`BookingSummaryStep`'s "Confirm Booking" generates a client-side placeholder ID (`LTMS-` + a timestamp fragment) purely so `BookingSuccessStep` has something concrete to display. The QR code is a static icon, not a generated code — both are explicitly called out in the brief as placeholders, and both become real the moment `POST /api/v1/bookings` exists and returns an actual booking ID/verification payload.

## 8. Performance

- **Route-level code splitting**: `/booking` loads via React Router's `lazy` field, same pattern as the Tours module — entirely absent from the Home/Tours bundles, verified as its own `BookingPage-*.js` chunk in the production build.
- **Memoization**: `Seat` (rendered up to 45 times per bus), `EventCard`, and `PackageCard` are all `React.memo`'d — none should re-render from an unrelated draft-state change elsewhere in the wizard.
- **Images**: `EventCard` uses `LazyImage` like every other card in the app.
- Given the wizard is a single in-memory flow (no per-step network fetch in this phase), a loading skeleton wasn't needed for the steps themselves; once a real API backs event/bus/seat data, each step's data-fetching moment is the natural place to add one, following the same skeleton pattern already used in Tours/Home.

## 9. Accessibility

- `BookingStepper` is a `<nav aria-label="Booking progress">` with `aria-current="step"` on the active step; completed steps are real, keyboard-operable `<button>`s (jump back without losing state).
- Every `Seat` has a descriptive `aria-label` (e.g. "Seat A1, already booked" / "Seat B2, selected") and `aria-pressed` reflecting selection — screen reader users get the same information sighted users get from color alone.
- `GuestForm` associates every error message via `aria-describedby`, and `invalid` styling on `Input` reflects `aria-invalid` (from the design-system phase's primitive).
- The seat map's zoom controls and legend are supplementary, not required — all seats remain reachable and operable via keyboard/Tab regardless of zoom level.

---

## Folder Structure

```
client/src/features/booking/
├── types.ts                      # BookingEvent, Bus, Seat, GuestFormData, PricingBreakdown, ...
├── data/
│   ├── buses.ts                    # 4 buses, each with a generated 45-seat layout
│   └── events.ts                     # 4 booking events, each linked to one bus + 4 package tiers
├── hooks/
│   ├── BookingProvider.tsx           # useReducer + Context — the wizard's single source of truth
│   └── useBooking.ts                   # context hook
├── utils/
│   ├── pricing.ts                    # computePricing() — placeholder business rules, clearly labeled
│   └── seat-layout.ts                  # generateSeatRows() — builds the A–J + K layout once, reused per bus
└── components/
    ├── BookingStepper.tsx             # 6-step progress nav (Success is a separate terminal screen)
    ├── EventCard.tsx                    # Step 1 card
    ├── PackageCard.tsx                    # Step 2 card
    ├── BusCard.tsx                          # Step 3 display (not a picker)
    ├── GuestForm.tsx                          # Step 5 form (react-hook-form + zod)
    ├── BookingSummaryCard.tsx                   # Step 6's full field list, reusable elsewhere later
    ├── SeatMap/
    │   ├── Seat.tsx                                # one seat button, memoized
    │   ├── SeatRow.tsx                               # aisle layout / back-row layout
    │   ├── SeatLegend.tsx                              # status color key
    │   └── SeatMap.tsx                                   # composes rows + zoom + driver/helper/door
    └── steps/
        ├── SelectEventStep.tsx
        ├── SelectPackageStep.tsx
        ├── SelectBusStep.tsx
        ├── SelectSeatStep.tsx
        ├── BookingDetailsStep.tsx
        ├── BookingSummaryStep.tsx
        └── BookingSuccessStep.tsx

client/src/pages/BookingPage.tsx     # wizard shell: BookingProvider + BookingStepper + current step
client/src/app/router/index.tsx      # /booking registered via React Router's `lazy` field
```

Also updated this phase (wiring only, no structural change): `Navbar`, `MobileNav`, Home's `HeroSection`/`CtaBanner`, Tours' `TourCard`/`StickyBookingSummary` — every existing "Book Tour"/"Book Now" control now links to `/booking` (optionally with `?tourId=`).

## Components Created
**Booking-specific**: `BookingStepper`, `EventCard`, `PackageCard`, `BusCard`, `GuestForm`, `BookingSummaryCard`, `Seat`, `SeatRow`, `SeatLegend`, `SeatMap` — 10 components, exactly matching the brief's "Reusable Components" list.
**7 step components** composing the above into the full flow.

## Future API Integration
- `data/events.ts` (`BOOKING_EVENTS`) → `GET /api/v1/booking/events` (or reuse the Tours API's upcoming-events data — the shapes are close enough to unify).
- `data/buses.ts` (`BUSES`, seat layout/status) → `GET /api/v1/booking/events/:eventId/bus` — real-time seat status (booked/locked/reserved) must come from the backend at read time, not be baked into static data, since it changes as other guests book.
- Seat **locking**: when a guest selects a seat, a real implementation should call something like `POST /api/v1/booking/events/:eventId/seats/:seatId/lock` (temporary hold) so two guests can't both select the same seat — `SeatMap`'s `onToggleSeat` is exactly where that call would be added.
- `computePricing()` → `POST /api/v1/bookings/quote`, same input/output shape.
- `BookingSummaryStep`'s "Confirm Booking" → `POST /api/v1/bookings`, returning the real booking ID that replaces the placeholder `LTMS-${Date.now()}` generation.
- `BookingSuccessStep`'s QR code → generate from the real booking ID/verification URL once issued.
- `BookingSuccessStep`'s "Download PDF" → a future ticket/invoice-generation endpoint.

## Backend Data Requirements
- **Event**: id, tourId, tourName, tourCategory, destination, coverImage, departureDate, durationDays/Nights, busId, startingPriceBDT, availableSeats, totalSeats, status, packages[] (id, tier, name, pricePerPersonBDT, description, inclusions[]).
- **Bus**: id, name, busNumber, acType, totalSeats, availableSeats, rows[] (row label, seats[] with id + status) — status must reflect real-time booking/lock state.
- **Booking (on create)**: eventId, packageId, seatIds[], guest info (all `GuestFormData` fields), computed pricing (subtotal, discount, total, minimumAdvance, receivedAmount, dueAmount) — server-computed and authoritative, not trusted from the client.
- **Minimum advance rule**: currently a flat per-category, per-guest amount on the client; the backend should own and expose this (e.g. as a field on the Tour/Event record, or a dedicated pricing-rules endpoint) rather than the frontend hardcoding it, once real rules exist.
