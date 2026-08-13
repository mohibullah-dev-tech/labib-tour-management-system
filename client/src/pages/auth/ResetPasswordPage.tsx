import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/schemas/reset-password.schema';
import { useResetPasswordMutation } from '@/features/auth/hooks/useAuthMutations';
import { AUTH_ROUTES } from '@/features/auth/constants/auth-routes';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { PasswordInput } from '@/features/auth/components/PasswordInput';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * The link-based counterpart to ForgotPasswordPage's code-based flow —
 * reached via `/reset-password?token=...&email=...` from a password
 * reset email. The token itself is the verification (no separate code
 * step), so this page goes straight to "choose a new password."
 */
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const identifier = searchParams.get('email') ?? '';
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const resetPasswordMutation = useResetPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  if (!token) {
    return (
      <AuthCard title="Invalid Reset Link">
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            This password reset link is missing or invalid. Request a new one from the Forgot
            Password page.
          </AlertDescription>
        </Alert>
        <Button asChild className="w-full">
          <Link to={AUTH_ROUTES.forgotPassword}>Request New Link</Link>
        </Button>
      </AuthCard>
    );
  }

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      // TODO(backend): the real endpoint validates `token` server-side — this mock only uses `identifier`.
      await resetPasswordMutation.mutateAsync({ identifier, newPassword: values.password });
      toast.success('Password reset successfully. Please log in.');
      navigate(AUTH_ROUTES.login, { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  return (
    <AuthCard title="Set a New Password" description="Choose a new password for your account.">
      {serverError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rp-password">New Password</Label>
          <PasswordInput id="rp-password" invalid={!!errors.password} {...register('password')} />
          {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="rp-confirm">Confirm New Password</Label>
          <PasswordInput
            id="rp-confirm"
            invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          Reset Password
        </Button>
      </form>
    </AuthCard>
  );
}
