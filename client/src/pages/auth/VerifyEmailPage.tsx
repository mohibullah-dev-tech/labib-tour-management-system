import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CheckCircle2, MailCheck, XCircle } from 'lucide-react';
import { useVerifyEmailMutation } from '@/features/auth/hooks/useAuthMutations';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AUTH_ROUTES } from '@/features/auth/constants/auth-routes';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

/**
 * Two entry points into this one page:
 * 1. `/verify-email` (no token) — right after registration, showing
 *    "check your inbox" — matches RegisterPage's redirect.
 * 2. `/verify-email?token=...` — from the link in that email, which
 *    triggers verification automatically on mount.
 */
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { user } = useAuth();
  const verifyEmailMutation = useVerifyEmailMutation();
  const [hasAttempted, setHasAttempted] = useState(false);

  useEffect(() => {
    if (token && !hasAttempted) {
      setHasAttempted(true);
      verifyEmailMutation.mutate(token);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, hasAttempted]);

  if (!token) {
    return (
      <AuthCard title="Verify Your Email">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <div className="bg-primary-50 text-primary dark:bg-primary-950 flex size-14 items-center justify-center rounded-full">
            <MailCheck className="size-7" aria-hidden="true" />
          </div>
          <p className="text-muted-foreground text-sm">
            We&apos;ve sent a verification link to {user?.email ?? 'your email address'}. Click the
            link to activate your account.
          </p>
          <Button asChild variant="outline" className="mt-2 w-full">
            <Link to={AUTH_ROUTES.login}>Back to Login</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Verify Your Email">
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        {verifyEmailMutation.isPending && (
          <>
            <Spinner size="lg" label="Verifying" />
            <p className="text-muted-foreground text-sm">Verifying your email...</p>
          </>
        )}

        {verifyEmailMutation.isSuccess && (
          <>
            <div className="bg-success-50 text-success-600 dark:bg-success-950 flex size-14 items-center justify-center rounded-full">
              <CheckCircle2 className="size-7" aria-hidden="true" />
            </div>
            <p className="text-muted-foreground text-sm">
              Your email has been verified successfully.
            </p>
            <Button asChild className="mt-2 w-full">
              <Link to={AUTH_ROUTES.login}>Continue to Login</Link>
            </Button>
          </>
        )}

        {verifyEmailMutation.isError && (
          <>
            <div className="bg-danger-50 text-danger-600 dark:bg-danger-950 flex size-14 items-center justify-center rounded-full">
              <XCircle className="size-7" aria-hidden="true" />
            </div>
            <p className="text-muted-foreground text-sm">
              {verifyEmailMutation.error instanceof Error
                ? verifyEmailMutation.error.message
                : 'This verification link is invalid or has expired.'}
            </p>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link to={AUTH_ROUTES.login}>Back to Login</Link>
            </Button>
          </>
        )}
      </div>
    </AuthCard>
  );
}
