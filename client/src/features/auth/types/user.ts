import type { Role } from '@/features/auth/types/role';

/**
 * The authenticated user shape the frontend expects back from the
 * future `GET /api/v1/auth/me` endpoint. Intentionally excludes
 * anything sensitive (password hash, refresh token, ...) — the backend
 * should never send those to the client in the first place.
 */
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  avatarUrl?: string;
  isEmailVerified: boolean;
  createdAt: string; // ISO
}

/**
 * Only the ACCESS token is ever visible to frontend code, and only
 * in-memory (see services/token-manager.ts) — never localStorage, never
 * a cookie the frontend sets itself. The refresh token never appears in
 * this type at all: it lives exclusively in a secure, httpOnly cookie
 * the browser sends automatically and JavaScript can never read.
 */
export interface AccessTokenPayload {
  accessToken: string;
  /** Epoch ms the access token expires — drives proactive silent refresh. */
  expiresAt: number;
}

export interface LoginResult {
  user: AuthUser;
  tokens: AccessTokenPayload;
}

export interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginInput {
  /** Accepts either an email or a phone number — the backend decides which. */
  identifier: string;
  password: string;
  rememberMe: boolean;
}
