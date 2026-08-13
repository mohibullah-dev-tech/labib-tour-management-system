import type { AuthUser, LoginInput, RegisterInput } from '@/features/auth/types/user';
import type { Role } from '@/features/auth/types/role';

/**
 * The exact shape the brief asks for: user, role, isAuthenticated,
 * isLoading, login(), logout(), register(), refreshSession(),
 * updateUser(). This is what `useAuth()` returns — a thin orchestration
 * layer over TanStack Query mutations/queries (see hooks/), not a
 * duplicate store holding server data. `isLoading` here specifically
 * means "session restoration in progress" (the app doesn't yet know if
 * the visitor is logged in) — individual actions (login, register, ...)
 * expose their own loading state via the mutation objects returned from
 * useLogin()/useRegister()/etc., not through this flag.
 */
export interface AuthContextValue {
  user: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  /** True only during initial session restoration on app load. */
  isLoading: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  refreshSession: () => Promise<AuthUser | null>;
  updateUser: (patch: Partial<AuthUser>) => void;
}
