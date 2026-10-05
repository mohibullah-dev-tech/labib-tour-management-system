import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authService } from '@/features/auth/services/auth.service';
import { getAccessToken } from '@/features/auth/services/token-manager';
import { registerAuthInterceptorHandlers } from '@/lib/axios';
import { authQueryKeys, useCurrentUserQuery } from '@/features/auth/hooks/useCurrentUserQuery';
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
} from '@/features/auth/hooks/useAuthMutations';
import { SessionExpiredDialog } from '@/features/auth/components/SessionExpiredDialog';
import type { AuthContextValue } from '@/features/auth/types/auth-state';
import type { AuthUser, LoginInput, RegisterInput } from '@/features/auth/types/user';

// eslint-disable-next-line react-refresh/only-export-components -- context must live next to its Provider
export const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Orchestration layer over TanStack Query — deliberately thin. The
 * actual user data lives in the `currentUser` query cache
 * (useCurrentUserQuery); this provider's own React state is limited to
 * `isRestoring` (true only while the app is figuring out, on first
 * load, whether a session exists at all). This matches the brief's
 * explicit instruction: "Keep server state in TanStack Query. Keep
 * minimal client authentication/UI state in the appropriate
 * store/context."
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { data: user = null } = useCurrentUserQuery();
  const [isRestoring, setIsRestoring] = useState(true);
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  const refreshSession = useCallback(async (): Promise<AuthUser | null> => {
    const restoredUser = await authService.refreshToken();
    queryClient.setQueryData(authQueryKeys.currentUser, restoredUser);
    return restoredUser;
  }, [queryClient]);

  // Keep a stable reference for the Axios interceptor (registered once, outside React's render cycle).
  const refreshSessionRef = useRef(refreshSession);
  refreshSessionRef.current = refreshSession;

  // --- Session restoration on app load -------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refreshSessionRef.current();
      if (!cancelled) setIsRestoring(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Wire the Axios 401/refresh architecture to this provider ------
  useEffect(() => {
    registerAuthInterceptorHandlers({
      refresh: async () => {
        const restoredUser = await refreshSessionRef.current();
        return restoredUser ? getAccessToken() : null;
      },
      onSessionExpired: () => {
        queryClient.setQueryData(authQueryKeys.currentUser, null);
        setSessionExpiredOpen(true);
        toast.error('Your session has expired. Please log in again.');
      },
    });
  }, [queryClient]);

  const login = useCallback(
    async (input: LoginInput): Promise<AuthUser> => {
      const result = await loginMutation.mutateAsync(input);
      return result.user;
    },
    [loginMutation],
  );

  const register = useCallback(
    async (input: RegisterInput): Promise<AuthUser> => {
      return registerMutation.mutateAsync(input);
    },
    [registerMutation],
  );

  const logout = useCallback(async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const updateUser = useCallback(
    (patch: Partial<AuthUser>) => {
      queryClient.setQueryData<AuthUser | null>(authQueryKeys.currentUser, (prev) =>
        prev ? { ...prev, ...patch } : prev,
      );
    },
    [queryClient],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: !!user,
      isLoading: isRestoring,
      login,
      logout,
      register,
      refreshSession,
      updateUser,
    }),
    [user, isRestoring, login, logout, register, refreshSession, updateUser],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionExpiredDialog open={sessionExpiredOpen} onOpenChange={setSessionExpiredOpen} />
    </AuthContext.Provider>
  );
}
