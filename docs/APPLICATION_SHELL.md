# LTMS Application Shell & Navigation

Status: layout/navigation foundation only. No homepage sections, business logic, or auth were built — placeholders are used everywhere real content will eventually go.

---

## 1. Why nested layouts (`RootLayout` → `PublicLayout`)

React Router v7's nested routes let a layout wrap its children via `<Outlet />`. Two layers, not one, because they have genuinely different jobs:

- **`RootLayout`** — app-wide routing concerns only: `<ScrollRestoration />` (reset scroll position between page navigations) and rendering whatever layout the matched branch needs.
- **`PublicLayout`** — the marketing/booking-site chrome: Navbar, Footer, the two floating action buttons.

This split means a future authenticated area (customer dashboard, admin panel) adds a **sibling** `DashboardLayout` (sidebar instead of Navbar/Footer) under the same `RootLayout`, without touching `PublicLayout` or any existing route.

## 2. Why every nav item gets a real route (`ComingSoonPage`)

`NAV_ITEMS` (in `config/navigation.ts`) is mapped straight into the route table, each rendering a shared `ComingSoonPage` placeholder until its real feature exists. This was a deliberate choice over linking to `#` or leaving them to 404:
- **Active Route Highlight** actually has something to highlight against a real matched route.
- Clicking "Tours" today shows a clean "coming soon" state instead of a broken link or generic 404 — better for stakeholder demos.
- When the Tours feature is built, it's a one-line swap in `router/index.tsx` (`element: <ComingSoonPage .../>` → `element: <ToursPage />`), not a structural change.

## 3. Navbar: transparent-on-hero vs. solid-on-scroll

`Navbar` takes a `transparentOnTop` prop (default `false`). Pages with a full-bleed hero image will pass `true`; every other page (and the placeholders today) get the always-solid default — there's no hero yet to be transparent over. The transition itself is driven by `useScrolled(threshold)`, a hook that flips one boolean via a `requestAnimationFrame`-throttled scroll listener — not a re-render on every scroll pixel.

## 4. Why Drawer (not Sheet) for mobile nav

Both were built in the design-system phase. `Drawer` (vaul-based, bottom sheet, swipe-to-dismiss) is the more natural mobile interaction for a hamburger menu than `Sheet`'s side-panel slide — matches the touch patterns people already know from native apps.

## 5. Floating actions: WhatsApp + Scroll-to-Top

Both are `position: fixed`, bottom-right, stacked with different offsets (`bottom-6` WhatsApp, `bottom-24` Scroll-to-Top) so they never visually collide. Both check `useReducedMotion()` and skip their entrance/hover animation for users who've asked the OS for reduced motion — the buttons still work instantly, only the motion is skipped.

## 6. Layout primitives: `Container` vs `Section` vs `PageWrapper`

- **`Container`** (built in the design-system phase) — horizontal max-width + padding only.
- **`Section`** — adds consistent vertical rhythm (`py-16 laptop:py-24`) and wraps `Container` by default; pass `contained={false}` for full-bleed content (an edge-to-edge image row) inside an otherwise normal section.
- **`PageWrapper`** — marks the `<main id="main-content">` landmark once per page (the target of `SkipToContent`) and guarantees a minimum height so short pages don't collapse the Footer up against the Navbar.

Every page composes these three; none of them hardcode page-specific content.

## 7. Named breakpoints alongside Tailwind's defaults

`tokens.css` now also defines `--breakpoint-tablet` (768px), `--breakpoint-laptop` (1024px), `--breakpoint-desktop` (1280px), `--breakpoint-ultrawide` (1920px) — usable as `tablet:`, `laptop:`, `desktop:`, `ultrawide:` variants. Tailwind's original `sm/md/lg/xl/2xl` still work everywhere; these are additive aliases for the handful of places a named tier reads clearer (the Navbar's desktop-nav breakpoint is `laptop:flex`, which is more legible in context than `lg:flex`).

## 8. Accessibility

- **`SkipToContent`** — visually hidden until keyboard-focused; jumps straight to `#main-content`, satisfying WCAG 2.4.1 (Bypass Blocks).
- **Active route highlight** uses React Router's built-in `aria-current="page"` on the active `NavLink` — no extra code needed.
- **`:focus-visible` ring** (from the design-system phase) applies to every nav link, button, and drawer trigger here — full keyboard navigability without a single custom tabindex hack.
- **`useReducedMotion`** gates every non-essential animation added this phase (WhatsApp button, Scroll-to-Top, drawer).

## 9. Performance

- **Icons**: Lucide's named-export pattern (`import { Menu } from 'lucide-react'`) is already tree-shaken per-icon by the bundler — no additional lazy-loading layer would reduce bundle size further without adding complexity that doesn't pay for itself yet.
- **Memoization**: `NavLinks`, `MobileNav`, `WhatsAppButton`, and `ScrollToTopButton` are wrapped in `React.memo` — they're pure/props-driven and shouldn't re-render just because their parent `Navbar` re-renders on every scroll-state flip.
- **Fonts**: unchanged from the design-system phase (Latin-subset only, self-hosted).
- **Noted for later**: the production JS bundle is a single ~617KB (197KB gzip) chunk today because there's only one real route. Once Tours/Events/Gallery/etc. become real, heavier feature pages, switch each route's `element` to `React.lazy(() => import(...))` so each page ships its own chunk — trivial to add against the route table structure already in place, deliberately not added now since every current route is a tiny placeholder with nothing to gain from splitting.

---

## Folder Structure

```
client/src/
├── config/
│   └── navigation.ts          # NAV_ITEMS + LEGAL_ITEMS — single source read by Navbar, MobileNav, Footer, router
├── hooks/
│   └── useScrolled.ts           # rAF-throttled scroll-threshold hook
├── components/
│   ├── layout/
│   │   ├── RootLayout.tsx          # ScrollRestoration + Outlet
│   │   ├── PublicLayout.tsx          # Navbar + Outlet + Footer + floating actions
│   │   ├── Section.tsx                 # vertical rhythm + Container wrapper
│   │   ├── PageWrapper.tsx               # <main id="main-content"> landmark
│   │   ├── SkipToContent.tsx               # keyboard bypass-blocks link
│   │   ├── Navbar/
│   │   │   ├── Navbar.tsx                    # sticky, transparent/solid, logo, actions, mobile trigger
│   │   │   ├── NavLinks.tsx                    # memoized desktop nav list
│   │   │   └── MobileNav.tsx                     # Drawer content (nav + auth/CTA placeholders)
│   │   ├── Footer/
│   │   │   ├── Footer.tsx                      # company info, quick links, destinations, contact, legal
│   │   │   └── footer-data.ts                     # placeholder destinations/social/contact data
│   │   └── FloatingActions/
│   │       ├── WhatsAppButton.tsx                  # expandable, bottom-right
│   │       └── ScrollToTopButton.tsx                 # bottom-right, above WhatsApp
│   └── common/ (from design-system phase — reused here, not modified)
│
├── pages/
│   ├── HomePage.tsx              # updated to use PageWrapper/Section
│   ├── NotFoundPage.tsx            # updated to use PageWrapper/Section + EmptyState
│   └── ComingSoonPage.tsx            # generic placeholder for every nav destination
│
└── app/router/index.tsx         # RootLayout → PublicLayout → { Home, one route per NAV_ITEM/LEGAL_ITEM, catch-all }
```

## Components Created
Navbar, NavLinks, MobileNav, Footer, WhatsAppButton, ScrollToTopButton, RootLayout, PublicLayout, Section, PageWrapper, SkipToContent, ComingSoonPage — 12 components, plus 2 config/data files (`navigation.ts`, `footer-data.ts`) and 1 hook (`useScrolled`).

## Future Integration Points
- Swap each `ComingSoonPage` route for its real feature page (`ToursPage`, `EventsPage`, ...) as those are built — one line each in `router/index.tsx`.
- `Navbar`'s Search/Login/Register buttons are visual placeholders with no `onClick` yet — wire to real modals/routes in the Auth and Search phases.
- `WhatsAppButton`'s `WHATSAPP_PLACEHOLDER_URL` — swap in the real business number.
- `Footer`'s `POPULAR_DESTINATIONS` — swap the hardcoded list for a live query (TanStack Query) once the Tours API exists.
- A `DashboardLayout` sibling to `PublicLayout` for the authenticated area, once Auth is built.
- `ThemeToggle` (built in the design-system phase) isn't placed anywhere yet — a natural home is the Navbar's desktop action row or a future Settings page.
