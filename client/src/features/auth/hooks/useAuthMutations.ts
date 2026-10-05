import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/features/auth/services/auth.service';
import { authQueryKeys } from '@/features/auth/hooks/useCurrentUserQuery';
import type { LoginInput, RegisterInput } from '@/features/auth/types/user';

/**
 * Thin useMutation wrappers around authService — each one's only extra
 * job is keeping the `currentUser` query in sync (setting it directly
 * from the mutation's result avoids an unnecessary refetch, per "avoid
 * duplicate current-user requests"). AuthProvider composes these into
 * the single `login()`/`register()`/`logout()` functions it exposes;
 * pages that want granular loading/error state (per the brief's Loading
 * State / Error State / Success State requirement) can also use these
 * hooks directly.
 */

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(authQueryKeys.currentUser, user);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKeys.currentUser, user);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.currentUser, null);
      // Clear everything else too — no stale, previously-authenticated data (bookings, profile, ...) should survive a logout.
      queryClient.clear();
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (identifier: string) => authService.forgotPassword(identifier),
  });
}

export function useVerifyResetCodeMutation() {
  return useMutation({
    mutationFn: ({ identifier, code }: { identifier: string; code: string }) =>
      authService.verifyResetCode(identifier, code),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ identifier, newPassword }: { identifier: string; newPassword: string }) =>
      authService.resetPassword(identifier, newPassword),
  });
}

export function useVerifyEmailMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser });
    },
  });
}

/**
 * Mutation hook for explicitly re-authenticating / refreshing session via cookie.
 */
export function useRefreshSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authService.refreshToken(),
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKeys.currentUser, user);
    },
    onError: () => {
      queryClient.setQueryData(authQueryKeys.currentUser, null);
    },
  });
}

// Friendly aliases matching TanStack Query convention & prompt specifications
export const useLogin = useLoginMutation;
export const useRegister = useRegisterMutation;
export const useLogout = useLogoutMutation;
export const useForgotPassword = useForgotPasswordMutation;
export const useVerifyResetCode = useVerifyResetCodeMutation;
export const useResetPassword = useResetPasswordMutation;
export const useVerifyEmail = useVerifyEmailMutation;
