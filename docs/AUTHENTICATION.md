# LTMS Authentication & Authorization — Frontend Architecture

Status: complete frontend architecture for authentication and role-based access control, built entirely against a clearly-marked **mock adapter** (`features/auth/services/auth.service.ts`). No backend, no real JWT creation/decoding, no database. Every piece is shaped so a real backend can be connected by rewriting only the mock adapter's internals — no component, hook, or route needs to change.

---

## 1. Files Created

```
client/src/features/auth/
├── types/
│   ├── role.ts                    # Role const + type, ALL_ROLES, ROLE_LABELS, isRole()
│   ├── user.ts                      # AuthUser, AccessTokenPayload, LoginInput/Result, RegisterInput
│   └── auth-state.ts                  # AuthContextValue — the shape useAuth() returns
├── constants/
│   ├── permissions.ts              # ROLE_FEATURE_ACCESS, ROLE_HOME_PATH, ROUTE_ROLE_REQUIREMENTS
│   └── auth-routes.ts                # AUTH_ROUTES path constants
├── schemas/
│   ├── login.schema.ts             # Zod: identifier, password, rememberMe
│   ├── register.schema.ts            # Zod: fullName, email, phone, password+confirm, acceptTerms
│   ├── forgot-password.schema.ts       # Zod: identifier; verify-code schema
│   └── reset-password.schema.ts          # Zod: password+confirm
├── services/
│   ├── token-manager.ts            # in-memory access token store (get/set/clear/isExpired)
│   └── auth.service.ts               # MOCK adapter — login/register/logout/refreshToken/
│                                        getCurrentUser/forgotPassword/verifyResetCode/
│                                        resetPassword/verifyEmail
├── hooks/
│   ├── useCurrentUserQuery.ts      # the one TanStack Query for user data + authQueryKeys
│   ├── useAuthMutations.ts           # useLogin/useRegister/useLogout/useForgotPassword/
│                                        useVerifyResetCode/useResetPassword/useVerifyEmail
│   └── useAuth.ts                      # context consumer hook
├── context/
│   └── AuthProvider.tsx            # orchestration layer — session restoration, exposes
│                                      user/role/isAuthenticated/isLoading/login/logout/
│                                      register/refreshSession/updateUser
└── components/
    ├── ProtectedRoute.tsx           # requires ANY authenticated user
    ├── RoleGuard.tsx                  # requires role in allowedRoles
    ├── GuestRoute.tsx                   # requires NO authenticated user
    ├── AuthLoadingScreen.tsx              # full-screen spinner during session restoration
    ├── AuthCard.tsx                         # shared card shell for every auth page
    ├── PasswordInput.tsx                      # password field with show/hide toggle
    ├── SocialLoginButton.tsx                    # "Continue with Google" placeholder
    ├── NetworkErrorState.tsx                      # connectivity-error display
    └── AuthenticatedPlaceholder.tsx                 # shared body for the 4 demo protected pages

client/src/pages/auth/
├── LoginPage.tsx
├── RegisterPage.tsx
├── ForgotPasswordPage.tsx        # code-based flow: identifier -> code -> new password -> success
├── ResetPasswordPage.tsx           # link-based flow: /reset-password?token=...
└── VerifyEmailPage.tsx               # "check your inbox" state + ?token= auto-verify state

client/src/pages/protected/
├── DashboardPage.tsx    (any authenticated role)
├── ProfilePage.tsx        (any authenticated role)
├── MyBookingsPage.tsx       (any authenticated role)
└── HostPage.tsx                (Host, Admin, SuperAdmin)

client/src/pages/UnauthorizedPage.tsx   # RoleGuard's redirect target
client/src/components/layout/AuthLayout.tsx  # sibling layout, no public Navbar/Footer
client/src/components/ui/checkbox.tsx        # new — Radix Checkbox (Remember Me, Terms)
```

## 2. Files Modified

- **`client/src/lib/axios.ts`** — this was the planned integration point: the design-system phase's original file literally had a comment reading "Auth refresh-token interceptor will be added in the Authentication phase." Rewritten with the request interceptor (attaches the in-memory access token) and the response interceptor (401 handling, single-flight token refresh with a request queue, session-expiry callback) — see §5.
- **`client/src/app/App.tsx`** — added `<AuthProvider>`, nested inside `QueryProvider` (needs the query client) and wrapping `RouterProvider` (routing itself depends on auth state via the guards).
- **`client/src/app/router/index.tsx`** — restructured to add the `AuthLayout` branch (`/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`), `/unauthorized`, `<ProtectedRoute>`/`<RoleGuard>` wrapping `/dashboard`, `/profile`, `/bookings`, `/host`, and — closing a gap the Admin Dashboard phase explicitly deferred — `<ProtectedRoute>` + `<RoleGuard allowedRoles={[Admin, SuperAdmin]}>` now wraps `/admin/*`.
- **`Navbar.tsx` / `MobileNav.tsx`** — the existing Login/Register buttons (previously non-functional placeholders) now link to `/login`/`/register`; both render an authenticated account menu (avatar dropdown / dashboard+logout) instead when `isAuthenticated`.

---

## 3. Authentication Architecture

### Token handling
- **Access token**: held in a single in-memory module-level variable (`services/token-manager.ts`) — never `localStorage`/`sessionStorage`. It disappears on every page reload by design.
- **Refresh token**: never touched by frontend JavaScript at all. The design assumes the backend sets it as a **secure, httpOnly cookie** (`apiClient` is already configured with `withCredentials: true` from the project-setup phase) — the browser attaches it automatically on every request to the API origin; no frontend code can read or store it, which is the entire point.
- **Session restoration**: on every app load, `AuthProvider` calls `refreshSession()` once (which calls `authService.refreshToken()` — in production, `POST /api/v1/auth/refresh` with an empty body, relying on the cookie). If it resolves to a user, the access token and `currentUser` query are populated silently; if not, the app renders as a logged-out visitor. `isLoading` in `useAuth()` is `true` only during this one-time check.

### The mock adapter (`auth.service.ts`)
Every exported function mirrors the exact signature its real, backend-calling counterpart will have. Each has a `// TODO(backend): <method> <path>` comment marking precisely what to replace. A small in-memory demo user list (one account per role, password `password123` for all) makes the whole flow — including role-based routing — testable today without a server. A `sessionStorage`-based marker (heavily commented, clearly labeled demo-only) stands in for "the httpOnly cookie is valid," purely so Session Restoration is testable across a real browser reload; it has no bearing on and no equivalent in the production design, and should be deleted once a real backend exists.

### State layering
Per the brief's explicit instruction ("keep server state in TanStack Query, minimal client state in context"):
- **Server state** (the `AuthUser` object) lives in one TanStack Query (`useCurrentUserQuery`, key `['auth', 'current-user']`). Every mutation (login/register/logout) writes directly into this query's cache via `setQueryData` on success — no separate refetch, avoiding the duplicate current-user request the brief calls out.
- **Client state** in `AuthProvider` is exactly one `useState` (`isRestoring`). Everything else it exposes (`user`, `role`, `isAuthenticated`) is derived, not stored.

---

## 4. Role/Permission Architecture

```ts
const Role = { Guest: 'guest', Host: 'host', Admin: 'admin', SuperAdmin: 'super_admin' } as const;
type Role = (typeof Role)[keyof typeof Role];
```
A `const` object, not a TS `enum` — produces plain strings at runtime (safe to log/serialize, no enum-specific tooling quirks) while `Role` the *type* still gives full compile-time safety. Every role comparison in the app imports `Role` and compares against it — never a raw string literal.

`ROLE_FEATURE_ACCESS` (constants/permissions.ts) encodes the brief's exact per-role feature lists (Guest: own-profile/own-bookings/reviews/tickets; Host: assigned-tours/assigned-guests/live-tracking/announcements; Admin: tours/events/buses/hosts/bookings/guests/reviews/reports/settings; SuperAdmin: everything/user-management/role-management/system-settings/audit-logs) — currently only *displayed* (see `AuthenticatedPlaceholder`), ready to gate real UI once those feature pages exist.

`ROLE_HOME_PATH` decides where each role lands post-login and where `GuestRoute` redirects an already-authenticated visitor away from `/login`.

---

## 5. Route Protection Flow

```
<ProtectedRoute>           requires: isAuthenticated
  -> redirects to /login (state: { from: currentPath }) if not

<RoleGuard allowedRoles>   requires: role in allowedRoles (nests inside ProtectedRoute)
  -> redirects to /unauthorized if not

<GuestRoute>                requires: !isAuthenticated
  -> redirects to ROLE_HOME_PATH[role] if already logged in
```

Applied in `app/router/index.tsx`:
- `/dashboard`, `/profile`, `/bookings` — `ProtectedRoute` only (any role).
- `/host` — `ProtectedRoute` + `RoleGuard([Host, Admin, SuperAdmin])`.
- `/admin/*` — `ProtectedRoute` + `RoleGuard([Admin, SuperAdmin])`.
- `/login`, `/register`, `/forgot-password` — `GuestRoute` (an already-logged-in visitor is redirected, not shown the form). `/reset-password` and `/verify-email` are deliberately **not** gated by `GuestRoute` — both are reached via emailed links that could be opened in a different browser/session than the one currently logged in.

**Login redirect-back**: `ProtectedRoute` attaches the page a visitor was trying to reach as router state (`{ from: location.pathname }`) when bouncing to `/login`; `LoginPage` reads it back and navigates there on success instead of always going to the role's default home.

### Axios 401 / automatic refresh flow
1. Request interceptor attaches `Authorization: Bearer <in-memory access token>` if one exists.
2. On a `401`, the response interceptor triggers exactly one refresh call, no matter how many requests failed at once — every other failing request queues behind it (a `resolve`/`reject` pair pushed into an array) instead of independently hammering the refresh endpoint.
3. If refresh succeeds: the queued requests retry with the new token; if it fails: the queue rejects, the access token is cleared, and a registered `onSessionExpired` callback (set by `AuthProvider`) clears the `currentUser` query and shows a toast — this is what powers the Session Expired state.
4. Requests to `/auth/*` endpoints and requests already marked `_retry` never re-trigger a refresh, avoiding infinite loops.

---

## 6. Future Backend API Requirements

| Method & Path | Purpose | Notes |
|---|---|---|
| `POST /api/v1/auth/register` | Create account | Returns `{ user, accessToken, expiresIn }`; sets refresh cookie |
| `POST /api/v1/auth/login` | Authenticate | Same response shape; body `{ identifier, password }` |
| `POST /api/v1/auth/logout` | End session | Clears the refresh cookie server-side |
| `POST /api/v1/auth/refresh` | Silent token refresh | No body — relies on the httpOnly cookie; returns a new `accessToken` |
| `GET /api/v1/auth/me` | Current user | `Authorization: Bearer <accessToken>` |
| `POST /api/v1/auth/forgot-password` | Start reset | Body `{ identifier }`; must respond identically whether or not the account exists (no user enumeration) |
| `POST /api/v1/auth/verify-reset-code` | Verify OTP | Body `{ identifier, code }` |
| `POST /api/v1/auth/reset-password` | Set new password | Body `{ token or identifier, newPassword }` |
| `POST /api/v1/auth/verify-email` | Confirm email | Body `{ token }` from the emailed link |

All nine map 1:1 onto `authService`'s current functions — connecting the backend is rewriting those nine function bodies to call `apiClient` instead of the mock, with zero changes to any hook, page, or guard.

---

## 7. Security Considerations

- **Never store passwords** — the mock's in-memory demo list is scaffolding only; a real backend must hash (bcrypt/argon2) and never return password data in any response, which `AuthUser`'s type already reflects (no password field exists on it).
- **Never expose refresh tokens** — no frontend code, type, or state ever holds one; it lives exclusively in an httpOnly cookie the backend sets and the browser manages invisibly.
- **Access token stays in memory only** — deliberately not `localStorage`, to limit an XSS payload's window to the current tab session rather than a permanent, silently-persisted credential.
- **Frontend role checks are UX only, never the real boundary** — `ProtectedRoute`, `RoleGuard`, and `ROLE_FEATURE_ACCESS` all carry an explicit comment to this effect. Anyone can open devtools and see (or forge) the role value the frontend is checking; the backend must independently re-authorize every single request regardless of what the UI already decided to show.
- **No fake JWT decoding** — `AccessTokenPayload` carries an opaque string and a plain `expiresAt` timestamp the mock sets; nothing in this codebase parses a token's contents, since a real JWT's claims should never be trusted client-side for authorization decisions anyway (only for display, if at all).
- **No user enumeration via forgot-password** — the mock's `forgotPassword()` always resolves successfully regardless of whether the identifier matches an account, modeling the behavior a real endpoint must have.

---

## 8. Testing Checklist

- [ ] **Successful login** — log in with a demo account (e.g. `guest@labibtours.com` / `password123`), confirm redirect to `/dashboard` and the Navbar shows the account menu.
- [ ] **Invalid credentials** — wrong password shows the inline error alert on `/login`, form stays populated (except password).
- [ ] **Registration validation** — submit `/register` with a weak password, mismatched confirm-password, or terms unchecked; confirm each Zod error renders under its field.
- [ ] **Logout** — from the account dropdown or `AuthenticatedPlaceholder`; confirm the query cache clears (`queryClient.clear()`) and the Navbar reverts to Login/Register.
- [ ] **Session restoration** — log in, then hard-reload the page; confirm the `AuthLoadingScreen` appears briefly and the session restores (demo-only `sessionStorage` marker backs this — see §3). Close the tab (not just reload) and reopen: session should be gone, matching `sessionStorage`'s real clearing behavior.
- [ ] **Expired access token** — hard to trigger without a real backend; the interceptor logic (`lib/axios.ts`) can be unit-tested directly by mocking a 401 response and asserting exactly one refresh call fires for N concurrent failing requests.
- [ ] **Unauthorized route** — log in as `guest@labibtours.com`, navigate to `/admin`; confirm redirect to `/unauthorized`, not `/login` (the visitor IS authenticated).
- [ ] **Role-based route protection** — log in as each of the four demo accounts in turn and confirm: Guest can reach `/dashboard`/`/profile`/`/bookings` but not `/host` or `/admin`; Host can additionally reach `/host`; Admin/SuperAdmin can reach `/admin`.
- [ ] **Guest route redirect** — while logged in, manually navigate to `/login`; confirm immediate redirect to the role's home page instead of showing the form.
- [ ] **Forgot password flow** — `/forgot-password` -> any identifier -> code `123456` (demo code) -> new password -> success screen -> redirect to `/login`.
- [ ] **Reset password (link-based)** — visit `/reset-password` with no `?token=` param, confirm the "invalid link" state; visit with `?token=anything`, confirm the new-password form renders.
- [ ] **Verify email** — visit `/verify-email` with no token (post-registration state); visit with `?token=anything`, confirm the auto-verify spinner -> success state sequence.
