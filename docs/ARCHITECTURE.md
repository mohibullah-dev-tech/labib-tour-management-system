# LTMS — Architecture Decisions

This document records the reasoning behind foundational choices made during project setup. Update it as new architectural decisions are made in future phases.

## 1. Monorepo with npm workspaces (not Turborepo/Nx yet)

`client` and `server` live in one repo under npm `workspaces`. This gives shared tooling (root ESLint/Prettier/Husky), one `npm install`, and atomic commits across frontend+backend changes — without the operational overhead of Turborepo/Nx, which isn't justified at this project's current size. If build caching or a third package (e.g. a shared `types` package) becomes necessary, Turborepo can be layered in later without restructuring.

## 2. Feature-based structure over layer-based

Both `client/src/features/*` and `server/src/modules/*` are reserved for feature-based code (e.g. `features/booking`, `modules/tours`), each owning its own components/routes/services/schemas. This scales better than grouping strictly by technical layer (`controllers/`, `services/`, `models/` at the top level) because a change to "bookings" touches one folder, not five.

## 3. Express app/server split

`server/src/app.ts` builds the Express `Application` (middleware, routes). `server/src/server.ts` owns process lifecycle (DB/Redis connect, HTTP+Socket.IO server, graceful shutdown). This lets `app.ts` be imported directly in integration tests via `supertest` without opening a real port or socket connection.

## 4. Centralized env validation (Zod on server, fail-fast on client)

All required environment variables are parsed through a Zod schema once at startup (`server/src/config/env.ts`). Missing/malformed config crashes the process immediately with a clear message — not three requests later with a null-pointer-style bug. The client mirrors this with a lightweight `getEnvVar` helper.

## 5. Global error handler + `ApiError`

Route/controller code should `throw` or call `next(err)` and never format error responses inline. `ApiError` distinguishes operational errors (safe to show the client — 400/401/404/409) from unexpected/programmer errors (logged with stack trace, generic 500 returned in production). This keeps the response contract consistent for the frontend.

## 6. Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`)

v4 configures theme tokens via `@theme` inside CSS rather than a JS config file, and integrates through `@tailwindcss/vite` instead of PostCSS. Design tokens are defined as CSS variables in `index.css` so shadcn/ui components (added in the UI phase) consume the exact same variables — one source of truth for color/radius/spacing.

## 7. Path aliases (`@/*`) on both sides

- **Client**: resolved natively by Vite + `tsconfig.app.json` — zero extra tooling.
- **Server**: resolved at dev time by `tsx` (reads `tsconfig.json` paths directly) and rewritten in compiled output by `tsc-alias` during `npm run build`, so `dist/` output has real relative paths Node can resolve — no runtime path-mapping package needed in production.

## 8. TanStack Query as the server-state layer

React state (`useState`/context) is reserved for UI/client state. All server data (tours, bookings, users) will go through TanStack Query — caching, refetching, and loading/error states are handled consistently instead of hand-rolled `useEffect` fetch logic per component.

## 9. Security middleware stack (server)

`helmet` (secure headers) → `cors` (locked to `CLIENT_URL`, credentials enabled for httpOnly refresh cookies) → body size limits (`10kb`) → `express-rate-limit` on all `/api` routes. Endpoint-specific stricter limiters (login, password reset) will be added in the Authentication phase.

## 10. What was intentionally deferred

Per this phase's scope, the following are **not** implemented yet and will be addressed in dedicated phases:
- Authentication (JWT issuing/refresh flow, password hashing usage, guards/middleware)
- Mongoose schemas/models and any business logic
- Real UI (shadcn components, layouts, pages beyond placeholders)
- Testing setup (Vitest/Jest + Supertest)
- CI/CD pipelines and deployment configs (Vercel/Railway/MongoDB Atlas/Redis Cloud specifics)
