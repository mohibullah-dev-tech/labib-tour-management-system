import type { AccessTokenPayload } from '@/features/auth/types/user';

/**
 * The ONLY place the access token is held on the frontend — a plain
 * module-level variable, never localStorage/sessionStorage. This is
 * deliberate:
 *
 * - It's cleared automatically on a full page reload, which is exactly
 *   why `refreshSession()` (see hooks/AuthProvider.tsx) exists — it
 *   silently re-establishes the access token on app load using the
 *   refresh token, which the browser sends automatically because it
 *   lives in a secure, httpOnly cookie the backend sets. JavaScript
 *   never touches the refresh token at all, by design.
 * - Storing the access token in localStorage would make it readable by
 *   any injected script (XSS), permanently, until manually cleared. An
 *   in-memory value disappears the moment the tab closes or reloads.
 *
 * This module is intentionally framework-agnostic (no React) so the
 * Axios interceptors (lib/axios.ts) can read/write it without importing
 * React context — avoids a circular dependency between the HTTP layer
 * and the component tree.
 */
let currentToken: AccessTokenPayload | null = null;

export function getAccessToken(): string | null {
  return currentToken?.accessToken ?? null;
}

export function isAccessTokenExpired(): boolean {
  if (!currentToken) return true;
  return Date.now() >= currentToken.expiresAt;
}

export function hasValidAccessToken(): boolean {
  return !!currentToken && !isAccessTokenExpired();
}

export function getTokenExpiresAt(): number | null {
  return currentToken?.expiresAt ?? null;
}

export function setAccessToken(token: AccessTokenPayload): void {
  currentToken = token;
}

export function clearAccessToken(): void {
  currentToken = null;
}
