import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2 } from 'lucide-react';
import {
  forgotPasswordSchema,
  verifyCodeSchema,
  type ForgotPasswordFormValues,
  type VerifyCodeFormValues,
} from '@/features/auth/schemas/forgot-password.schema';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/schemas/reset-password.schema';
import {
  useForgotPasswordMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
} from '@/features/auth/hooks/useAuthMutations';
import { AUTH_ROUTES } from '@/features/auth/constants/auth-routes';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { PasswordInput } from '@/features/auth/components/PasswordInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Step = 'identifier' | 'verify' | 'new-password' | 'success';

/**
 * Forgot Password -> Email/Phone -> Verification -> New Password ->
 * Success, exactly as the brief lays it out. One page, internal step
 * state — matches the Booking module's precedent for a linear wizard
 * that doesn't need each step to be independently deep-linkable.
 */
export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const forgotPasswordMutation = useForgotPasswordMutation();
  const verifyCodeMutation = useVerifyResetCodeMutation();
  const resetPasswordMutation = useResetPasswordMutation();

  const identifierForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: '' },
  });
  const codeForm = useForm<VerifyCodeFormValues>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: '' },
  });
  const passwordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const handleIdentifierSubmit = async (values: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      await forgotPasswordMutation.mutateAsync(values.identifier);
      setIdentifier(values.identifier);
      setStep('verify');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  const handleCodeSubmit = async (values: VerifyCodeFormValues) => {
    setServerError(null);
    try {
      await verifyCodeMutation.mutateAsync({ identifier, code: values.code });
      setStep('new-password');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Invalid code.');
    }
  };

  const handlePasswordSubmit = async (values: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      await resetPasswordMutation.mutateAsync({ identifier, newPassword: values.password });
      setStep('success');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  if (step === 'success') {
    return (
      <AuthCard title="Password Reset" description="">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="bg-success-50 text-success-600 dark:bg-success-950 flex size-14 items-center justify-center rounded-full">
            <CheckCircle2 className="size-7" aria-hidden="true" />
          </div>
          <p className="text-muted-foreground text-sm">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <Button asChild className="mt-2 w-full">
            <Link to={AUTH_ROUTES.login}>Back to Login</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot Password"
      description={
        step === 'identifier'
          ? "Enter your email or phone number and we'll send you a verification code."
          : step === 'verify'
            ? `Enter the code sent to ${identifier}.`
            : 'Choose a new password for your account.'
      }
      footer={
        <Link to={AUTH_ROUTES.login} className="text-primary font-medium hover:underline">
          Back to Login
        </Link>
      }
    >
      {serverError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {step === 'identifier' && (
        <form
          onSubmit={identifierForm.handleSubmit(handleIdentifierSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fp-identifier">Email or Phone</Label>
            <Input
              id="fp-identifier"
              invalid={!!identifierForm.formState.errors.identifier}
              {...identifierForm.register('identifier')}
            />
            {identifierForm.formState.errors.identifier && (
              <p className="text-destructive text-xs">
                {identifierForm.formState.errors.identifier.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            isLoading={identifierForm.formState.isSubmitting}
          >
            Send Code
          </Button>
        </form>
      )}

      {step === 'verify' && (
        <form
          onSubmit={codeForm.handleSubmit(handleCodeSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fp-code">Verification Code</Label>
            <Input
              id="fp-code"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              invalid={!!codeForm.formState.errors.code}
              {...codeForm.register('code')}
            />
            {codeForm.formState.errors.code && (
              <p className="text-destructive text-xs">{codeForm.formState.errors.code.message}</p>
            )}
            <p className="text-muted-foreground text-xs">Demo code: 123456</p>
          </div>
          <Button type="submit" className="w-full" isLoading={codeForm.formState.isSubmitting}>
            Verify Code
          </Button>
        </form>
      )}

      {step === 'new-password' && (
        <form
          onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
          noValidate
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fp-password">New Password</Label>
            <PasswordInput
              id="fp-password"
              invalid={!!passwordForm.formState.errors.password}
              {...passwordForm.register('password')}
            />
            {passwordForm.formState.errors.password && (
              <p className="text-destructive text-xs">
                {passwordForm.formState.errors.password.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fp-confirm">Confirm New Password</Label>
            <PasswordInput
              id="fp-confirm"
              invalid={!!passwordForm.formState.errors.confirmPassword}
              {...passwordForm.register('confirmPassword')}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-destructive text-xs">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" isLoading={passwordForm.formState.isSubmitting}>
            Reset Password
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
