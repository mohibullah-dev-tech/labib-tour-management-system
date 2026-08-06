# LTMS Tours Module

Status: complete frontend architecture for browsing and viewing tours — filtering, sorting, pagination, and a full Tour Details page. No booking transaction, payment, or backend calls are wired up; every interactive control that would eventually hit an API is a working UI with a clearly marked placeholder action.

---

## 1. Why the `Tour` type has so many optional fields

`features/tours/types.ts` defines one `Tour` interface used by both the listing grid and the details page. Detail-page fields (`packages`, `route`, `hotel`, `host`, `reviews`, `foodMenu`, `faq`, ...) are all optional, deliberately. The business context is explicit that these 11 destinations don't all look alike — a Day Tour has no hotel or route timeline; a multi-day Premium tour has both. Rather than force every tour to carry empty arrays/placeholder objects, the type says "this section may or may not exist," and every Tour Details component (`PackagePricing`, `HotelInfo`, `TravelTimeline`, ...) renders `null` when its data is absent. `DetailBlock` in `TourDetailsPage.tsx` wraps each section so the heading itself disappears too — no section ever shows an empty "Hotel Information" heading with nothing under it.

## 2. Filtering is a hook, not page-level `useState` sprawl

`useTourFilters()` owns all seven filter fields, sort state, and derives `filteredTours` in one `useMemo`. It also derives its own filter option lists (`destinations`, `busTypes`, `priceBounds`) directly from the data array — the filter UI never hardcodes a destination or bus-type list that could silently go stale as new tours are added. `ToursPage.tsx` only calls the hook and renders what it returns; `ToursFilters.tsx` is a pure controlled-inputs component with no state of its own, rendered identically in both the desktop sidebar and the mobile Sheet.

## 3. Pagination over infinite scroll

Chosen for two concrete reasons: (1) numbered pages compose predictably with the seven active filters — a filter change resets to page 1 in a single, obvious place — where infinite scroll would need extra bookkeeping to avoid inconsistent scroll-restoration when filters change mid-scroll; (2) accessibility — a numbered `<nav aria-label="Pagination">` with `aria-current="page"` is straightforward for screen reader and keyboard users, while infinite scroll requires careful focus and live-region announcement work to reach the same bar. `Pagination` itself is generic (`currentPage`/`totalPages`/`onPageChange` only) and reusable for any future paginated list.

## 4. Package pricing, includes/excludes, and every other detail section are independent components

Each is genuinely standalone — takes its slice of `Tour` as props, returns `null` if that data is missing, otherwise renders itself. This was a deliberate granularity choice: a future "Admin: edit tour" form can import and preview any single section in isolation, and a future "compact tour view" (e.g. inside a booking confirmation) can reuse `QuickOverview` or `HostInfo` alone without pulling in the whole details page.

## 5. Route Map is a placeholder — on purpose

The brief asks for a Route Map **placeholder**, not a working map. `RouteMapPlaceholder` renders a static, styled "coming soon" panel. The underlying reason this is easy to upgrade later: `RouteStop` (in `types.ts`) already has optional `lat`/`lng` fields. Once real coordinates exist, this component becomes a Leaflet `<MapContainer>` (already in the tech stack) plotting the same `route` array `TravelTimeline` renders — no data-shape change needed, only this one component's internals.

## 6. Performance

- **Route-level code splitting**: `/tours` and `/tours/:slug` are registered via React Router's `lazy` route field, not a static import — the entire Tours module (11 tour records plus ~15 detail-page components) is absent from the Home page's bundle and only downloads when a visitor navigates to a Tours route. Verified in the production build: `ToursPage-*.js`, `TourDetailsPage-*.js`, and their shared `TourCard-*.js` chunk are separate files; the app's main bundle dropped after this change.
- **`React.memo`**: `TourCard` is memoized — it's rendered up to 9 times per grid page and again inside `RelatedTours`, and shouldn't re-render just because a sibling filter control re-renders `ToursPage`.
- **Images**: every image uses `LazyImage` (native `loading="lazy"` + skeleton) except the Tour Details hero banner, which — like the Home page's Hero — is the page's likely LCP element and loads eager/high-priority instead.
- **Loading skeleton**: `TourCardSkeleton` mirrors `TourCard`'s exact layout so there's no layout shift once real cards replace it; `ToursPage` shows it for a brief simulated initial load (stand-in for a real fetch's `isLoading`).

## 7. Accessibility

- `Pagination` is a `<nav aria-label="Pagination">` with `aria-current="page"` on the active page button.
- Every detail section uses a real `<h2>`, `<dl>/<dt>/<dd>` for stat-style data (`QuickOverview`, `StickyBookingSummary`), and `<blockquote>/<figcaption>` for reviews — consistent with the Home page's patterns.
- The image lightbox reuses the existing `Dialog` primitive — focus trap, Escape-to-close, and `DialogTitle` (visually hidden, screen-reader only) all come for free.
- The mobile filter panel is a `Sheet` (existing primitive) — same keyboard/focus handling as every other sheet in the app.
- The `Slider` (new this phase, Radix-based) is fully keyboard-operable (arrow keys adjust the range) and labeled via `aria-labelledby` pointing at the "Price Range" `<Label>`.

---

## Folder Structure

```
client/src/features/tours/
├── types.ts                     # Tour, TourPackage, RouteStop, HostInfo, ... — the shared data model
├── data/
│   └── tours.ts                   # 11 placeholder tours (3 with full detail-page data)
├── hooks/
│   └── useTourFilters.ts            # filter/sort state + derived option lists
└── components/
    ├── CategoryBadge.tsx             # category -> color mapping, shared by card + details
    ├── ToursListing/
    │   ├── TourCard.tsx                 # memoized listing card
    │   ├── TourCardSkeleton.tsx           # loading placeholder, matches TourCard's layout
    │   ├── ToursFilters.tsx                 # all 7 filter controls (pure, controlled)
    │   └── ToursToolbar.tsx                   # result count, sort, mobile filter trigger (Sheet)
    └── TourDetails/
        ├── TourHeroBanner.tsx
        ├── ImageGallery.tsx                     # grid + Dialog-based lightbox
        ├── QuickOverview.tsx
        ├── PackagePricing.tsx
        ├── TourIncludesExcludes.tsx
        ├── FoodMenu.tsx
        ├── TravelTimeline.tsx                     # the Dhaka -> ... -> Sajek style route
        ├── PlacesToVisit.tsx
        ├── RouteMapPlaceholder.tsx                  # placeholder, route-data-ready
        ├── HotelInfo.tsx
        ├── HostInfo.tsx
        ├── TourReviews.tsx
        ├── RelatedTours.tsx                           # reuses TourCard
        ├── TourFaq.tsx                                  # reuses the Accordion primitive
        └── StickyBookingSummary.tsx                       # desktop sidebar + mobile bottom bar

client/src/components/
├── ui/slider.tsx                # new this phase — Radix Slider, used by the price range filter
└── common/Pagination.tsx          # new this phase — generic, reusable beyond Tours

client/src/lib/format.ts         # new this phase — formatBDT/formatDate/formatMonth, shared helpers

client/src/pages/
├── ToursPage.tsx                 # All Tours listing (lazy-loaded route)
└── TourDetailsPage.tsx             # Tour Details (lazy-loaded route)

client/src/app/router/index.tsx  # /tours and /tours/:slug registered via React Router's `lazy` field
```

## Reusable Components
**New generic primitives**: `Slider` (ui/), `Pagination` (common/) — neither knows anything about tours, both reusable app-wide.
**New tours-scoped, still broadly reusable**: `TourCard` (used in both the listing grid and Related Tours), `CategoryBadge`, `HostInfo` (will reappear on future host-profile pages), every `TourDetails/*` section component (each independently reusable in isolation, per decision #4 above).

## Future Backend Integration
- `TOURS` (`data/tours.ts`) → `useTours()` / `useTour(slug)` (TanStack Query) once `GET /api/v1/tours` and `GET /api/v1/tours/:slug` exist. `useTourFilters(source)` already accepts a `source` array as a parameter for exactly this swap.
- Filtering/sorting → move server-side once the catalog is large enough that client-side filtering of the full list stops being appropriate; `useTourFilters`'s filter *state* shape can stay identical, only sent as query params instead of used to `.filter()` a local array.
- `RouteMapPlaceholder` → real Leaflet map once `RouteStop.lat`/`lng` are populated by the backend.
- `StickyBookingSummary`'s "Book Now" / `TourCard`'s "Book Now" links → currently route to `#booking` on the details page; will become real booking-flow triggers once the Booking module (explicitly out of scope this phase) is built.
- `HostInfo`'s WhatsApp/phone links are already real `tel:`/`wa.me` links against placeholder numbers — swap the numbers in `data/tours.ts` for real host contact info.

## Future API Requirements
- `GET /api/v1/tours` — list endpoint, should support the same filter params `useTourFilters` already models: `search`, `destination`, `category`, `duration`, `priceMin`/`priceMax`, `departureMonth`, `busType`, `sort`, plus `page`/`pageSize` for server-side pagination.
- `GET /api/v1/tours/:slug` — single tour, full `Tour` shape including all optional detail sections.
- `GET /api/v1/tours/:slug/related` — or the backend simply returns `relatedTourIds` and the client resolves them, as it does today.
- Media (gallery, cover images, hotel/host photos) served from Cloudinary, per the project's existing tech stack — `data/tours.ts`'s `picsum.photos` URLs are placeholders in the exact fields real Cloudinary URLs will occupy.
