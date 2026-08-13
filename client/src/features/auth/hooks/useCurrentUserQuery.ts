import { useQuery } from '@tanstack/react-query';
import { authService } from '@/features/auth/services/auth.service';

/** Shared query key — mutations invalidate this exact key on login/logout/updateUser instead of guessing a string. */
export const authQueryKeys = {
  currentUser: ['auth', 'current-user'] as const,
};

/**
 * The ONE place `getCurrentUser()` is called as a query. AuthProvider
 * reads from this same query (via the query client) rather than
 * duplicating user data into a second, parallel piece of state — this
 * is what "avoid duplicate current-user requests" and "keep server
 * state in TanStack Query" mean in practice for this module.
 */
export function useCurrentUserQuery() {
  return useQuery({
    queryKey: authQueryKeys.currentUser,
    queryFn: authService.getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false, // a failed/null current-user check should not silently retry — the UI needs to know immediately
  });
}
