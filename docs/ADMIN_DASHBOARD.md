# LTMS Admin Dashboard

Status: **All 12 admin sections fully built** — Dashboard Overview, Tour Templates, Tour Events, Buses, Hosts, Bookings, Guests, Reviews, Gallery, Website Content, Settings, and Analytics. Every list/table supports full CRUD (create, edit, delete) against typed mock data; every mutation is a clearly-swappable local state update, not a real API call.

## Note on how this was built

This module was originally scoped down to just the Dashboard Overview (with the other 11 sections scaffolded as navigation-only placeholders), following the project's one-module-at-a-time convention — 12 distinct admin areas in a single prompt is a lot to build responsibly at once. A follow-up request asked for the rest of the original prompt to be completed, so this document (and the codebase) now reflects the **complete** brief: every section below has real list views, forms, and actions.

---

## 1. `AdminLayout` is a sibling of `PublicLayout`, not nested under it

This was flagged as the intended future structure back in the Application Shell phase's `PublicLayout.tsx` docstring. `/admin/*` lives as its own top-level branch under `RootLayout`, with no public Navbar/Footer/WhatsApp button/ScrollToTop — none of those belong in an authenticated admin context. Route protection (redirecting non-admins) is intentionally **not** implemented here; it's the future Authentication module's job, and when that exists, it wraps `AdminLayout` with a guard without changing anything inside this layout.

## 2. Real charts, not empty gray boxes

The brief says "Charts (placeholder)" — interpreted as *placeholder data*, not placeholder visuals. `recharts` was added (a new, well-justified dependency — the project had no charting library) so `ChartCard` renders genuine bar/line charts against mock `ChartSeriesPoint[]` data. Swapping mock data for a real API response later is a prop change on `ChartCard`, not a rewrite. Both the Overview and Analytics pages reuse the same `ChartCard`.

## 3. One `types.ts` for every collection

`features/admin/types.ts` defines `TourTemplate`, `TourEventAdmin`, `BusAdmin`, `HostAdmin`, `BookingAdmin`, `GuestAdmin`, `ReviewAdmin`, `GalleryItemAdmin`, `CompanySettings` (with `MinimumAdvanceSettings`), and `WebsiteContentSettings` — every field the brief lists for each entity. This single file **is** the answer to "Future Database Collections."

## 4. Shared CRUD building blocks

Rather than each of the 11 sections reinventing table/form/confirm patterns, five components in `components/shared/` carry the weight:
- **`DataTable`** — generic `<T>` table: columns are just `{ key, header, render(row) }`. Every list page (Templates, Events, Buses, Hosts, Bookings, Guests, Reviews) uses this one implementation.
- **`AdminToolbar`** — the recurring search input + filter `<Select>`s + primary action row above every list.
- **`ConfirmDialog`** — one confirmation dialog for every destructive action (delete template, delete bus, cancel booking, ...).
- **`StatusBadge`** — thin `Badge` wrapper so every status column renders identically; each page supplies its own `status -> Badge variant` map.
- **`TagInput`** — editor for string-array fields (Tour Includes/Excludes, Places to Visit) — press Enter to add, click × to remove.

## 5. Section-by-section notes

- **Tour Templates**: full form for name/destination/category/duration/status/cover image/includes/excludes/places. Food Menu, Travel Timeline, and Gallery are intentionally *not* nested editors here — they're summarized as counts on the list (`foodMenuCount`, `routeStopCount`, `galleryCount`), since each is realistically its own sub-editor (comparable in scope to the Tour Details page's `FoodMenu`/`TravelTimeline` components).
- **Tour Events**: created *from* a template (a `<Select>` of `TOUR_TEMPLATES`), with its own bus, host, capacity, and booking window — matching the brief's example exactly (Sajek / Aug 15 / Hanif-01 / Rahim / 45).
- **Buses**: full CRUD; a note in the form explains the seat layout uses the same standard A–J + K arrangement the Booking module's `SeatMap` already implements, rather than building a second, separate seat-layout editor.
- **Hosts**: full CRUD including WhatsApp link and experience years; "Assigned Events" is shown read-only (computed from Tour Events elsewhere, not directly editable on the host record).
- **Bookings**: search, filter by booking status *and* payment status, Approve, Cancel (via `ConfirmDialog`), Mark Paid, and a detail view with Print Ticket / Download PDF — the latter two are explicit placeholders (toast-only) per the brief.
- **Guests**: list + profile dialog (tour counts, emergency contact); a note explains detailed per-tour travel history arrives once bookings are joined to guest profiles server-side.
- **Reviews**: Approve / Reject / Feature toggle, filterable by moderation status.
- **Gallery**: image grid (not a table — visually appropriate for photos), filterable by destination, per-image featured toggle and delete, and an Upload dialog that accepts real file selection but doesn't perform a real upload (no storage backend yet — Cloudinary is the intended eventual destination, already in the tech stack).
- **Website Content**: a new `Tabs` primitive (Radix, added this phase) organizes Hero Banner / Statistics / FAQ / About / Contact / Footer into one page without it becoming an overwhelming single scroll. Every field maps directly onto what the public Home page and FAQ section already render.
- **Settings**: company info, dynamic social links list, and — the brief's explicit business rule — **configurable minimum advance per tour category**, four number inputs directly editing the same shape `features/booking/utils/pricing.ts` currently hardcodes.
- **Analytics**: five `ChartCard`s (Revenue, Profit, Bookings, Guests, Top Destinations) plus a Monthly Reports `DataTable`.

## 6. Performance

- **Route-level code splitting**: every admin route loads via React Router's `lazy` field — verified as 12 separate chunks in the production build (2.7KB–22.9KB each; `ChartCard`'s recharts cost, ~395KB, is its own shared chunk loaded once and reused by Overview + Analytics). None of this is in the public site's bundle.
- **Memoization**: `StatCard` (8 instances on Overview) is `React.memo`'d.
- **Skeleton loading**: the Overview's stat-card grid and every `DataTable` show `Skeleton` placeholders during loading states.

## 7. Accessibility

- `AdminSidebar` is a `<nav aria-label="Admin">` with active-route highlighting via `NavLink`.
- `AdminBreadcrumb` derives its trail from the URL — never manually out of sync with a page's title.
- Mobile sidebar and every dialog/sheet/dropdown reuse existing design-system primitives — full focus-trap/Escape/keyboard behavior for free.
- Every icon-only button (`DataTable` row actions, Gallery's hover actions) has an `aria-label`; destructive actions go through `ConfirmDialog`'s keyboard-operable buttons, never a bare click-to-delete.

---

## Folder Structure

```
client/src/features/admin/
├── types.ts                        # every admin entity's shape
├── config/
│   └── admin-navigation.ts           # sidebar groups + flat lookup
├── data/
│   ├── dashboard.ts                    # Overview mock stats/charts/activity
│   ├── templates.ts                      # Tour Template mock data
│   ├── events.ts                           # Tour Event mock data
│   ├── buses.ts                              # Bus mock data
│   ├── hosts.ts                                # Host mock data
│   ├── bookings.ts                               # Booking mock data
│   ├── guests.ts                                   # Guest mock data
│   ├── reviews.ts                                    # Review mock data
│   ├── gallery.ts                                      # Gallery mock data
│   ├── content.ts                                        # Website Content mock data
│   ├── settings.ts                                         # Company Settings mock data
│   └── analytics.ts                                          # Analytics mock data + MonthlyReportRow
└── components/
    ├── shared/                          # DataTable, AdminToolbar, ConfirmDialog, StatusBadge, TagInput
    ├── layout/                          # AdminLayout, AdminSidebar, AdminTopbar, AdminBreadcrumb, AdminPageHeader
    ├── overview/                        # StatCard, ChartCard, RecentActivityList
    ├── templates/TemplateFormSheet.tsx
    ├── events/EventFormDialog.tsx
    ├── buses/BusFormDialog.tsx
    ├── hosts/HostFormDialog.tsx
    ├── bookings/BookingDetailDialog.tsx
    ├── guests/GuestProfileDialog.tsx
    └── gallery/UploadImagesDialog.tsx

client/src/pages/admin/          # 12 pages, one per section, each lazy-loaded
client/src/components/ui/tabs.tsx  # new this phase — Radix Tabs, used by Website Content
client/src/app/router/index.tsx  # /admin/* registered as a sibling branch, every route lazy-loaded
```

## Reusable Components
**Shared across every section**: `DataTable`, `AdminToolbar`, `ConfirmDialog`, `StatusBadge`, `TagInput` (5 generic components used by 7+ pages each).
**Layout**: `AdminSidebar`, `AdminTopbar`, `AdminBreadcrumb`, `AdminPageHeader` (used by all 12 pages).
**Overview/Analytics**: `StatCard`, `ChartCard` (used by both Overview and Analytics), `RecentActivityList`.
**Per-section forms**: `TemplateFormSheet`, `EventFormDialog`, `BusFormDialog`, `HostFormDialog`, `BookingDetailDialog`, `GuestProfileDialog`, `UploadImagesDialog`.

## Future Backend APIs
- `GET /api/v1/admin/dashboard` — Overview stats/charts/activity.
- `GET/POST/PUT/DELETE /api/v1/admin/tour-templates`, `/events`, `/buses`, `/hosts` — full CRUD for each.
- `GET /api/v1/admin/bookings` (search/filter), `PATCH /api/v1/admin/bookings/:id` (approve/cancel/mark-paid), `GET /api/v1/admin/bookings/:id/pdf`.
- `GET /api/v1/admin/guests`, `GET /api/v1/admin/guests/:id` (with real travel history once bookings are joined).
- `PATCH /api/v1/admin/reviews/:id` (approve/reject/feature).
- `POST /api/v1/admin/gallery` (upload, via Cloudinary), `PATCH/DELETE /api/v1/admin/gallery/:id`.
- `GET/PUT /api/v1/admin/content` — Website Content (hero, stats, FAQ, about, contact, footer).
- `GET/PUT /api/v1/admin/settings` — company info, social links, and `minimumAdvance` per category (the brief's "admin can change these values without code changes" requirement, made real).
- `GET /api/v1/admin/analytics` — revenue, profit, bookings, guests, top destinations, monthly reports.
- `GET /api/v1/admin/notifications` — currently an empty-state placeholder in `AdminTopbar`.

## Future Database Collections
Every interface in `features/admin/types.ts` maps to one collection/table: `tour_templates`, `tour_events` (referencing `tour_templates`, `buses`, `hosts`), `buses`, `hosts`, `bookings` (referencing `tour_events`, `guests`), `guests`, `reviews`, `gallery_items`, a `settings` document (`CompanySettings`), and a `website_content` document (`WebsiteContentSettings`). `DashboardStat`/`ChartSeriesPoint`/`RecentActivity`/analytics series aren't their own collections — they're computed views over the collections above, most naturally served by aggregation queries.
