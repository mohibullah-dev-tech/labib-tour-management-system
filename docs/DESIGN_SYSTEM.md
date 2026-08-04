# LTMS Design System & UI Foundation

Status: **foundation only** — no pages, navbar, or business UI built yet, per project scope. This document explains what was built, why, where it lives, and how to extend it.

---

## 1. File Map

```
client/src/
├── styles/
│   ├── tokens.css          # Color/font/radius/shadow tokens + semantic light theme (Tailwind v4 @theme)
│   └── base.css            # Dark theme overrides, element resets, focus ring, font wiring
├── index.css                # Composition root: Tailwind, fonts, dark-mode variant, tokens, base
│
├── lib/
│   ├── utils.ts              # cn() — class merge helper (used by every component)
│   ├── theme/
│   │   ├── ThemeProvider.tsx   # Light/Dark/System controller
│   │   └── useTheme.ts          # Hook to read/set theme
│   └── animations/
│       ├── variants.ts          # Framer Motion variants (fadeIn, fadeInUp, scaleIn, stagger...)
│       └── gsap.ts                # GSAP + ScrollTrigger helpers (fadeInOnScroll, staggerFadeInOnScroll)
│
├── hooks/
│   └── useReducedMotion.ts    # WCAG 2.3.3 — respects OS "reduce motion"
│
├── components/
│   ├── ui/                    # Low-level primitives (shadcn-style) — one concern each
│   │   ├── button.tsx  input.tsx  textarea.tsx  label.tsx  select.tsx
│   │   ├── badge.tsx  avatar.tsx  card.tsx
│   │   ├── dialog.tsx (Modal)  sheet.tsx (side panel)  drawer.tsx (mobile bottom sheet)
│   │   ├── tooltip.tsx  dropdown-menu.tsx  alert.tsx  sonner.tsx (Toast)
│   │   ├── skeleton.tsx  spinner.tsx  separator.tsx  typography.tsx
│   │
│   └── common/                 # Composed, app-specific, but still page-agnostic
│       ├── Container.tsx          # max-width + padding wrapper
│       ├── SectionTitle.tsx         # eyebrow + heading + description
│       ├── PageHeader.tsx             # title + description + actions banner
│       ├── EmptyState.tsx               # "nothing here yet" pattern
│       ├── Icon.tsx                       # consistent Lucide sizing wrapper
│       └── ThemeToggle.tsx                  # Light/Dark/System switcher control
│
└── app/App.tsx                # Wires ThemeProvider → QueryProvider → TooltipProvider → Router + Toaster
```

## 2. Why these architectural decisions

### 2.1 Tailwind v4 tokens, not a JS theme file
Tailwind v4 reads design tokens from a CSS `@theme` block and generates real utility classes from them (`bg-primary-600`, `shadow-floating`, `font-display` all exist because we declared the underlying `--color-primary-600`, `--shadow-floating`, `--font-display` variables). This means tokens and utilities can never drift out of sync — there's only one file to edit.

### 2.2 Brand colors aliased to Tailwind's own palette
Every hex you gave (`#0F766E`, `#0891B2`, `#F59E0B`, `#16A34A`, `#DC2626`) is, digit-for-digit, an existing shade in Tailwind's default palette (teal-700, cyan-600, amber-500, green-600, red-600). Instead of hand-authoring new 50–950 ramps and manually checking each shade's contrast, `tokens.css` aliases `--color-primary-*` etc. directly to Tailwind's teal/cyan/amber/green/red scales. Same brand, zero-maintenance ramps, and every step is already accessibility-vetted.

### 2.3 Semantic tokens, not raw color usage in components
No component ever writes `bg-teal-700`. They write `bg-primary`. `bg-primary` resolves to `--color-primary`, which is `var(--color-primary-700)` in light mode and `var(--color-primary-500)` in dark mode (re-declared once, inside `.dark { }` in `base.css`). Flipping the whole app's theme is one class toggle on `<html>` — no component code changes between themes, ever.

### 2.4 Three-font system
- **Fraunces** (display serif) — headings only (`font-display`), used sparingly for the "premium travel" editorial feel.
- **Plus Jakarta Sans** (UI sans) — body copy, labels, buttons, everything else.
- **JetBrains Mono** — prices, booking codes, dates, tabular data; monospace figures keep numbers aligned in tables/receipts.

All three are self-hosted via `@fontsource` (not Google Fonts CDN) — no external request, no third-party tracking, predictable `font-display: swap` behavior. Only the Latin + Latin-Extended subsets are imported (see `index.css`), cutting the font CSS payload roughly in half versus the full unicode range.

### 2.5 Custom ThemeProvider instead of a library
The job is: persist one string in `localStorage`, toggle a `.dark` class, and follow the OS preference when set to "System." That's the entire `ThemeProvider.tsx`. A dependency would cost more than it saves. A tiny inline script in `index.html` applies the theme class before React mounts, so there's no flash-of-wrong-theme on load.

### 2.6 Radix UI primitives under shadcn-style wrappers
Dialog, Select, Tooltip, DropdownMenu, Avatar, Separator, Label all wrap `@radix-ui/react-*` primitives. Radix supplies correct focus trapping, keyboard navigation, and ARIA wiring — re-implementing that correctly by hand is a common source of accessibility bugs. `vaul` powers `Drawer` (mobile bottom-sheet drag interaction) and `sonner` powers the toast system, for the same reason: these are hard to get right and already solved well.

### 2.7 Accessibility is structural, not an afterthought
- Every interactive primitive keeps a visible `:focus-visible` ring (WCAG 2.4.7).
- `useReducedMotion()` + a global `prefers-reduced-motion` CSS block respect the OS animation preference (WCAG 2.3.3) — check this hook before playing any Framer Motion/GSAP animation once pages start using them.
- Form primitives (`Input`, `Textarea`, `Select`) support `aria-invalid` styling out of the box.
- `Spinner` and `Toaster` announce to screen readers via `role="status"` / sonner's built-in live region.

### 2.8 Animation utilities are prepared, not applied
Per this phase's scope, `lib/animations/variants.ts` (Framer Motion) and `lib/animations/gsap.ts` (GSAP + ScrollTrigger) export ready-to-use variants/helpers, but nothing in the app calls them yet. When pages are built, import what you need:
```tsx
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
<motion.div variants={staggerContainer} initial="hidden" animate="visible">
  <motion.div variants={fadeInUp}>...</motion.div>
</motion.div>
```

## 3. How to scale this later

- **New component?** Ask: is it a generic, reusable-anywhere primitive (→ `components/ui/`) or does it compose primitives for a specific but still page-agnostic pattern (→ `components/common/`)? Feature-specific UI (a `TourCard`, a `BookingForm`) belongs inside `features/<feature-name>/components/`, not here — keeps the design system generic.
- **New brand color?** Add it once in `styles/tokens.css` under the semantic block, following the existing `--color-<name>` / `--color-<name>-foreground` pair pattern — every primitive that accepts a `variant` prop can then add that name to its `cva` variants.
- **New spacing need?** Don't invent new tokens — Tailwind's default 4px scale (`p-1` through `p-32`+) is intentionally left as-is; consistency comes from *using* the scale, not from adding more of it.
- **Dark mode for a new semantic token?** Declare the light value in `tokens.css`'s `@theme` block, then the dark override in `base.css`'s `.dark { }` block, using the identical variable name.
- **New icon usage?** Use `<Icon icon={IconName} size="sm|md|lg|xs" />` from `components/common/Icon.tsx` instead of sizing Lucide icons ad hoc, so icon weight stays visually consistent app-wide.

## 4. What was intentionally NOT built (per scope)
No pages, no Navbar, no Footer, no Hero, no Tour Cards, no Authentication UI. This phase is the reusable foundation those will be built from next.
