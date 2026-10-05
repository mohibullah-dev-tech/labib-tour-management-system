import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { registerSchema, type RegisterFormValues } from '@/features/auth/schemas/register.schema';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AUTH_ROUTES } from '@/features/auth/constants/auth-routes';
import { AuthCard } from '@/features/auth/components/AuthCard';
import { PasswordInput } from '@/features/auth/components/PasswordInput';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      const user = await registerUser(values);
      toast.success(`Welcome to LTMS, ${user.fullName.split(' ')[0]}! Please verify your email.`);
      navigate(AUTH_ROUTES.verifyEmail, { replace: true });
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
      );
    }
  };

  return (
    <AuthCard
      title="Create an Account"
      description="Book tours, track your trips, and manage everything in one place."
      footer={
        <>
          Already have an account?{' '}
          <Link to={AUTH_ROUTES.login} className="text-primary font-medium hover:underline">
            Login
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
          <AlertDescription>Account created! Redirecting to email verification...</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-name">Full Name</Label>
          <Input
            id="reg-name"
            autoComplete="name"
            invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'reg-name-error' : undefined}
            {...register('fullName')}
          />
          {errors.fullName && (
            <p id="reg-name-error" className="text-destructive text-xs">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-email">Email</Label>
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            invalid={!!errors.email}
            aria-describedby={errors.email ? 'reg-email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="reg-email-error" className="text-destructive text-xs">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-phone">Phone</Label>
          <Input
            id="reg-phone"
            type="tel"
            autoComplete="tel"
            invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'reg-phone-error' : undefined}
            {...register('phone')}
          />
          {errors.phone && (
            <p id="reg-phone-error" className="text-destructive text-xs">
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-password">Password</Label>
          <PasswordInput
            id="reg-password"
            autoComplete="new-password"
            invalid={!!errors.password}
            aria-describedby={errors.password ? 'reg-password-error' : undefined}
            {...register('password')}
          />
          {errors.password && (
            <p id="reg-password-error" className="text-destructive text-xs">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="reg-confirm-password">Confirm Password</Label>
          <PasswordInput
            id="reg-confirm-password"
            autoComplete="new-password"
            invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'reg-confirm-error' : undefined}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p id="reg-confirm-error" className="text-destructive text-xs">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-2">
            <Checkbox
              id="reg-terms"
              className="mt-0.5"
              onCheckedChange={(checked) => setValue('acceptTerms', checked === true)}
              aria-describedby={errors.acceptTerms ? 'reg-terms-error' : undefined}
            />
            <Label
              htmlFor="reg-terms"
              className="text-muted-foreground cursor-pointer text-sm leading-snug font-normal"
            >
              I agree to the{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Terms &amp; Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>
          {errors.acceptTerms && (
            <p id="reg-terms-error" className="text-destructive text-xs">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Register'}
        </Button>
      </form>
    </AuthCard>
  );
}
