# LTMS Home Page

Status: commercial home page built on top of the design system, application shell, and navigation from earlier phases. All content is placeholder data — no booking, search, or auth logic is wired to a real backend yet.

---

## 1. Why a `features/home/` module (not more `pages/` code)

Everything specific to the home page — its 12 section components and their placeholder data — lives in `features/home/`, not scattered into `components/` or piled into `pages/HomePage.tsx`. `HomePage.tsx` itself is a thin composition root: it imports sections and lays them out in order, nothing else. This matches the feature-based architecture from the project setup phase and means the entire home page feature can be reasoned about, modified, or even deleted as one unit.

## 2. Why placeholder data lives in typed `data/*.ts` files, not inline JSX

Every section (`DESTINATIONS`, `UPCOMING_EVENTS`, `GUEST_REVIEWS`, `FAQ_ITEMS`, `TRAVEL_STATS`, `WHY_CHOOSE_US`, `TOUR_PROCESS_STEPS`, `GALLERY_IMAGES`) reads from a typed array in its own file. This is the single most important decision for future API integration: each interface (`Destination`, `UpcomingEvent`, `GuestReview`, ...) is written to match what the real API will eventually return. Swapping a static array for a TanStack Query hook later is a **one-line change at the top of the component** — the JSX underneath never changes, because it was always just mapping over `Destination[]`, never over the literal constant.

## 3. Hero: transparent navbar via route `handle`, not a prop

The brief requires "transparent on hero, solid on scroll" — but only the Home page has a hero; every other page (Tours, About, Contact placeholders) should stay solid. Rather than adding a `transparentOnTop` prop that every future page would need to remember to pass, the Home route opts in via React Router's `handle` property:
```tsx
{ index: true, element: <HomePage />, handle: { transparentNavbar: true } }
```
`PublicLayout` reads this via `useMatches()` and passes it to `Navbar`. This is additive to the existing router structure from the Application Shell phase — no existing route or component had to change its API.

The Hero itself uses `-mt-16` (Navbar's exact height) to slide its full-bleed image up behind the sticky, transparent Navbar, producing the cinematic edge-to-edge effect without any position/z-index hacks on the Navbar itself.

## 4. Hero image is intentionally NOT lazy-loaded

Every other image on the page uses the `LazyImage` component (`loading="lazy"`, skeleton-while-loading). The Hero background is the opposite: `loading="eager"` and `fetchPriority="high"`, because it's virtually guaranteed to be the page's Largest Contentful Paint element — lazy-loading it would directly hurt the page's Core Web Vitals score, the one image on the page where "performance" and "lazy load images" are in tension, and performance wins.

## 5. Animation discipline

- **Entrance animations**: every section uses the same `fadeInUp`/`fadeIn`/`staggerContainer` variants from the design-system phase (`lib/animations/variants.ts`) with `whileInView={{ once: true }}` — they play once, the first time a section scrolls into view, never again. No section invents its own timing.
- **Hover/interaction feedback** (card lift, image zoom, button press) is plain CSS (`hover:`, `group-hover:`, `transition-*`), not Framer Motion — instant, no JS scheduling overhead for something that happens on every mouse move.
- **GSAP** was deliberately **not used** on this page. Every animation need here (fade/slide-in-on-scroll, hover states, an animated counter) is something Framer Motion already does well; reaching for GSAP as well would mean two animation systems doing overlapping jobs. GSAP's ScrollTrigger helpers (`lib/animations/gsap.ts`, from the design-system phase) remain available for a future page with a genuine scroll-driven timeline need it's actually suited for.
- **`AnimatedCounter`** counts up once via Framer Motion's imperative `animate()`, triggered by `useInView({ once: true })` — reused identically in the Hero's mini-stats and the full Travel Statistics section.
- **`useReducedMotion`** gates the Hero's entrance animations and scroll-indicator bounce — OS "reduce motion" users get the final state immediately.

## 6. Performance

- **Lazy-loaded images**: every section except the Hero uses `LazyImage` (native `loading="lazy"` + a `Skeleton` shown until the image decodes — no layout shift).
- **Code splitting**: `GalleryPreview`, `ReviewsPreview`, and `FaqPreview` — the three heaviest, furthest-below-the-fold sections — are loaded via `React.lazy()` + `Suspense` with a shared `SectionSkeleton` fallback. Verified in the production build: they ship as separate chunks (`GalleryPreview-*.js`, `ReviewsPreview-*.js`, `FaqPreview-*.js`) instead of bloating the initial bundle.
- **Fonts**: unchanged from the design-system phase (Latin-subset, self-hosted).

## 7. Accessibility

- Semantic landmarks throughout: `<section aria-labelledby="...">` paired with an `id` on each `SectionTitle`'s `<h2>`, `<dl>/<dt>/<dd>` for stat and event metadata, `<blockquote>`/`<figcaption>` for reviews, `<ol>` for the Tour Process steps.
- `Rating` renders one `role="img" aria-label="4.8 out of 5 stars"` rather than 5 individually-announced star icons.
- The Newsletter form's email input has a visually-hidden but screen-reader-available `<Label>` (not just a placeholder — placeholders are not a substitute for a label).
- Every decorative icon (`aria-hidden="true"`) is separated from meaningful icons that stand in for text.
- Keyboard support comes largely "for free" from the design-system phase's primitives (`Select`, `Accordion`, `Input`, `Button` all already handle focus/keyboard correctly) — no new custom keyboard handling was needed on this page.

---

## Folder Structure

```
client/src/features/home/
├── data/
│   ├── destinations.ts       # Destination[] — 8 placeholder destinations
│   ├── events.ts                # UpcomingEvent[] — 4 placeholder events
│   ├── reviews.ts                 # GuestReview[] — 4 placeholder reviews
│   ├── faq.ts                       # FaqItem[] — 5 Q&A pairs
│   ├── why-choose-us.ts               # WhyChooseUsItem[] — 6 value props
│   ├── tour-process.ts                  # TourProcessStep[] — 5 steps
│   ├── stats.ts                           # TravelStat[] — 4 counters
│   └── gallery.ts                           # GalleryImage[] — 6 images
│
└── components/
    ├── HeroSection.tsx            # full-viewport cinematic hero
    ├── SearchTourWidget.tsx         # UI-only search form (destination/date/guests)
    ├── PopularDestinations/
    │   ├── PopularDestinations.tsx
    │   └── DestinationCard.tsx
    ├── UpcomingEvents/
    │   ├── UpcomingEvents.tsx
    │   └── EventCard.tsx
    ├── WhyChooseUs.tsx
    ├── TravelStats/
    │   ├── TravelStats.tsx
    │   └── AnimatedCounter.tsx
    ├── GalleryPreview.tsx           # lazy-loaded
    ├── ReviewsPreview/
    │   ├── ReviewsPreview.tsx        # lazy-loaded
    │   └── ReviewCard.tsx
    ├── TourProcess.tsx
    ├── CtaBanner.tsx
    ├── FaqPreview.tsx                # lazy-loaded
    └── Newsletter.tsx

client/src/components/
├── ui/accordion.tsx              # new this phase — Radix Accordion, used by FaqPreview
└── common/
    ├── LazyImage.tsx                # new this phase — skeleton-while-loading image wrapper
    └── Rating.tsx                     # new this phase — accessible star rating display

client/src/pages/HomePage.tsx      # composition root: imports + orders the sections above
client/src/app/router/index.tsx    # Home route now carries handle: { transparentNavbar: true }
client/src/components/layout/PublicLayout.tsx  # reads the handle via useMatches()
```

## Component Breakdown
**12 section components**: HeroSection, PopularDestinations (+DestinationCard), UpcomingEvents (+EventCard), WhyChooseUs, TravelStats (+AnimatedCounter), GalleryPreview, ReviewsPreview (+ReviewCard), TourProcess, CtaBanner, FaqPreview, Newsletter, SearchTourWidget.
**2 new reusable primitives**: `Accordion` (ui/), and `LazyImage` + `Rating` (common/) — all three are generic and will be reused by future features (Tours listing, Tour detail page), not home-page-specific despite being introduced here.

## Future API Integration Points
- `DESTINATIONS` → `useDestinations()` (TanStack Query) once `GET /api/v1/tours` exists.
- `UPCOMING_EVENTS` → `useUpcomingEvents()` once the Events feature/API exists.
- `GUEST_REVIEWS` → `useFeaturedReviews()` once Reviews are backed by real bookings.
- `GALLERY_IMAGES` → pulled from Cloudinary (already in the tech stack) via a media/gallery endpoint.
- `SearchTourWidget`'s `handleSubmit` → replace the no-op with `navigate(\`/tours?destination=${destination}&date=${date}&guests=${guests}\`)` once the Tours search/listing page exists.
- `Newsletter`'s `handleSubmit` → replace the `toast.success` placeholder with a real mutation once a newsletter subscription endpoint exists.
- Every `picsum.photos` URL in `data/*.ts` → real Cloudinary URLs, swapped in the data files only; no component changes needed.
