import { Role } from '@/features/auth/types/role';
import type { AuthUser, LoginInput, LoginResult, RegisterInput } from '@/features/auth/types/user';
import { setAccessToken, clearAccessToken } from '@/features/auth/services/token-manager';

/**
 * ============================================================
 * MOCK ADAPTER — NOT PRODUCTION AUTHENTICATION
 * ============================================================
 * Every function in this file has the exact signature a real
 * `apiClient`-backed implementation will have (same params, same
 * return type, same thrown-error shape). Today, each one simulates
 * network latency and returns/validates against an in-memory demo
 * user list instead of calling the backend. Connecting the real
 * backend later means rewriting ONLY the bodies of these functions —
 * every call site (TanStack Query hooks, AuthProvider, forms) stays
 * identical. Search this file for "TODO(backend)" for the exact
 * swap-in points.
 *
 * No real JWTs are created or parsed here — `accessToken` below is a
 * random opaque string, not a decodable token, since the brief
 * explicitly asks for no fake JWT decoding.
 */

/**
 * Standard backend API authentication endpoint paths.
 * Configured relative to `env.apiBaseUrl`.
 */
export const AUTH_ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  me: '/auth/me',
  forgotPassword: '/auth/forgot-password',
  verifyResetCode: '/auth/verify-reset-code',
  resetPassword: '/auth/reset-password',
  verifyEmail: '/auth/verify-email',
} as const;

const MOCK_NETWORK_DELAY_MS = 600;

interface MockUserRecord extends AuthUser {
  password: string;
}

/** Demo accounts — one per role, for exercising the role-based UI without a backend. Password for all: "password123". */
const MOCK_USERS: MockUserRecord[] = [
  {
    id: 'u-guest-1',
    fullName: 'Farhana Akter',
    email: 'guest@labibtours.com',
    phone: '+8801611000001',
    role: Role.Guest,
    isEmailVerified: true,
    createdAt: '2026-01-10T00:00:00Z',
    password: 'password123',
  },
  {
    id: 'u-host-1',
    fullName: 'Rahim Uddin',
    email: 'host@labibtours.com',
    phone: '+8801711000010',
    role: Role.Host,
    isEmailVerified: true,
    createdAt: '2025-11-01T00:00:00Z',
    password: 'password123',
  },
  {
    id: 'u-admin-1',
    fullName: 'Admin User',
    email: 'admin@labibtours.com',
    phone: '+8801700000000',
    role: Role.Admin,
    isEmailVerified: true,
    createdAt: '2025-06-01T00:00:00Z',
    password: 'password123',
  },
  {
    id: 'u-superadmin-1',
    fullName: 'Labib Hasan',
    email: 'superadmin@labibtours.com',
    phone: '+8801700000001',
    role: Role.SuperAdmin,
    isEmailVerified: true,
    createdAt: '2025-01-01T00:00:00Z',
    password: 'password123',
  },
];

function delay(ms = MOCK_NETWORK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPublicUser(record: MockUserRecord): AuthUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructuring is how `password` gets excluded from the returned object
  const { password: _password, ...publicUser } = record;
  return publicUser;
}

function issueMockAccessToken(user: AuthUser) {
  const token = {
    accessToken: `mock.${user.id}.${Math.random().toString(36).slice(2)}`,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes, matching the server's real JWT_ACCESS_EXPIRES_IN default
  };
  setAccessToken(token);
  return token;
}

/**
 * ============================================================
 * DEMO-ONLY SCAFFOLDING — read this before touching mockSessionUserId
 * ============================================================
 * In production, the browser silently attaches the httpOnly refresh
 * cookie on every request — JavaScript never reads or stores anything
 * to know a session exists; the backend alone decides that. There is no
 * frontend-visible equivalent to persist.
 *
 * This mock has no backend, so nothing simulates that cookie across a
 * real page reload. To make "Session Restoration" actually testable in
 * a running browser (per the brief's Testing Checklist), we persist
 * ONLY a non-sensitive user id marker — never a token, never a password
 * — in sessionStorage (cleared when the tab closes, unlike
 * localStorage). Delete this block entirely once a real backend +
 * httpOnly cookie exists; it has no equivalent in the production design.
 */
const MOCK_SESSION_STORAGE_KEY = '__mock_auth_session_user_id';

function readMockSession(): string | null {
  return sessionStorage.getItem(MOCK_SESSION_STORAGE_KEY);
}
function writeMockSession(userId: string | null): void {
  if (userId) sessionStorage.setItem(MOCK_SESSION_STORAGE_KEY, userId);
  else sessionStorage.removeItem(MOCK_SESSION_STORAGE_KEY);
}

let mockSessionUserId: string | null = readMockSession();

export const authService = {
  async login(input: LoginInput): Promise<LoginResult> {
    await delay();
    // TODO(backend): POST /api/v1/auth/login — server sets the refresh
    // token as an httpOnly cookie in the response and returns { user, accessToken, expiresIn }.
    const record = MOCK_USERS.find(
      (u) => u.email === input.identifier || u.phone === input.identifier,
    );
    if (!record || record.password !== input.password) {
      throw new Error('Invalid email/phone or password.');
    }
    const user = toPublicUser(record);
    const tokens = issueMockAccessToken(user);
    mockSessionUserId = user.id;
    writeMockSession(user.id);
    return { user, tokens };
  },

  async register(input: RegisterInput): Promise<AuthUser> {
    await delay();
    // TODO(backend): POST /api/v1/auth/register
    if (MOCK_USERS.some((u) => u.email === input.email)) {
      throw new Error('An account with this email already exists.');
    }
    const newRecord: MockUserRecord = {
      id: `u-${Date.now()}`,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      role: Role.Guest,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      password: input.password,
    };
    MOCK_USERS.push(newRecord);
    const user = toPublicUser(newRecord);
    issueMockAccessToken(user);
    mockSessionUserId = user.id;
    writeMockSession(user.id);
    return user;
  },

  async logout(): Promise<void> {
    await delay(200);
    // TODO(backend): POST /api/v1/auth/logout — server clears the httpOnly refresh cookie server-side.
    mockSessionUserId = null;
    writeMockSession(null);
    clearAccessToken();
  },

  /**
   * Restores a session on app load using the (mock) refresh token.
   * In production this calls `POST /api/v1/auth/refresh` with no body —
   * the browser attaches the httpOnly cookie automatically — and the
   * server responds with a fresh access token if the cookie is valid.
   */
  async refreshToken(): Promise<AuthUser | null> {
    await delay(300);
    // TODO(backend): POST /api/v1/auth/refresh
    if (!mockSessionUserId) return null;
    const record = MOCK_USERS.find((u) => u.id === mockSessionUserId);
    if (!record) return null;
    const user = toPublicUser(record);
    issueMockAccessToken(user);
    return user;
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    await delay(200);
    // TODO(backend): GET /api/v1/auth/me (Authorization: Bearer <accessToken>)
    if (!mockSessionUserId) return null;
    const record = MOCK_USERS.find((u) => u.id === mockSessionUserId);
    return record ? toPublicUser(record) : null;
  },

  async forgotPassword(identifier: string): Promise<void> {
    await delay();
    // TODO(backend): POST /api/v1/auth/forgot-password — always resolves
    // without revealing whether the account exists, to avoid user enumeration.
    void identifier;
  },

  async verifyResetCode(identifier: string, code: string): Promise<void> {
    await delay();
    // TODO(backend): POST /api/v1/auth/verify-reset-code
    if (code !== '123456') {
      throw new Error('Invalid or expired code. (Demo code: 123456)');
    }
    void identifier;
  },

  async resetPassword(identifier: string, newPassword: string): Promise<void> {
    await delay();
    // TODO(backend): POST /api/v1/auth/reset-password
    const record = MOCK_USERS.find((u) => u.email === identifier || u.phone === identifier);
    if (record) record.password = newPassword;
  },

  async verifyEmail(token: string): Promise<void> {
    await delay();
    // TODO(backend): POST /api/v1/auth/verify-email
    if (!token) throw new Error('Missing or invalid verification token.');
    if (mockSessionUserId) {
      const record = MOCK_USERS.find((u) => u.id === mockSessionUserId);
      if (record) record.isEmailVerified = true;
    }
  },
};
