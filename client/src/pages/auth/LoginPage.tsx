import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME_PATH } from '@/features/auth/constants/permissions';
import { AUTH_ROUTES } from '@/features/auth/constants/auth-routes';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { PasswordInput } from '@/features/auth/components/PasswordInput';
import { SocialLoginButton } from '@/features/auth/components/SocialLoginButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Demo credentials note: this phase has no backend, so authService uses
 * an in-memory demo account list (see services/auth.service.ts) — one
 * account per role, password "password123" for all — purely so the
 * role-based routing/RoleGuard behavior is actually testable end to end.
 */
const DEMO_ACCOUNTS = [
  { label: 'Guest', email: 'guest@labibtours.com' },
  { label: 'Host', email: 'host@labibtours.com' },
  { label: 'Admin', email: 'admin@labibtours.com' },
  { label: 'Super Admin', email: 'superadmin@labibtours.com' },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '', rememberMe: false },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.fullName.split(' ')[0]}!`);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? ROLE_HOME_PATH[user.role], { replace: true });
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <AuthCard
      title="Welcome Back"
      description="Log in to manage your bookings and profile."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to={AUTH_ROUTES.register} className="text-primary font-medium hover:underline">
            Register
          </Link>
        </>
      }
    >
      {serverError && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {isSubmitSuccessful && !serverError && (
        <Alert variant="success" role="status">
          <AlertDescription>Login successful — redirecting...</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-identifier">Email or Phone</Label>
          <Input
            id="login-identifier"
            autoComplete="username"
            invalid={!!errors.identifier}
            aria-describedby={errors.identifier ? 'login-identifier-error' : undefined}
            {...register('identifier')}
          />
          {errors.identifier && (
            <p id="login-identifier-error" className="text-destructive text-xs">
              {errors.identifier.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="login-password">Password</Label>
            <Link
              to={AUTH_ROUTES.forgotPassword}
              className="text-primary text-xs font-medium hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            invalid={!!errors.password}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            {...register('password')}
          />
          {errors.password && (
            <p id="login-password-error" className="text-destructive text-xs">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="login-remember"
            onCheckedChange={(checked) => setValue('rememberMe', checked === true)}
          />
          <Label
            htmlFor="login-remember"
            className="text-muted-foreground cursor-pointer text-sm font-normal"
          >
            Remember me
          </Label>
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <SocialLoginButton />

      <div className="border-border bg-muted/40 text-muted-foreground rounded-md border border-dashed p-3 text-xs">
        <p className="text-foreground mb-1 font-medium">Demo accounts (password: password123)</p>
        <div className="flex flex-wrap gap-1.5">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              onClick={() => setValue('identifier', acc.email)}
              className="border-border bg-background hover:border-primary hover:text-primary rounded-full border px-2 py-0.5"
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>
    </AuthCard>
  );
}
