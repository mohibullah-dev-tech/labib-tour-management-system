import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export interface AuthSkeletonProps {
  /** Optional layout hint: 'login' | 'register' | 'card' */
  variant?: 'login' | 'register' | 'card';
}

/**
 * Authentication Skeleton — displayed while authentication pages or components
 * are being lazy-loaded or verifying initial session state.
 *
 * Designed to mirror the exact geometry of AuthCard to prevent Cumulative Layout Shift (CLS).
 */
export function AuthSkeleton({ variant = 'card' }: AuthSkeletonProps) {
  const isRegister = variant === 'register';

  return (
    <Card
      className="w-full max-w-md shadow-lg"
      role="status"
      aria-label="Loading authentication content"
    >
      <CardHeader className="gap-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-72" />
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Input field 1 */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Input field 2 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            {!isRegister && <Skeleton className="h-3 w-28" />}
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {isRegister && (
          <>
            {/* Input field 3 */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            {/* Input field 4 */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </>
        )}

        {/* Checkbox / Remember me placeholder */}
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded-sm" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Primary submit button */}
        <Skeleton className="h-10 w-full rounded-md" />

        {/* Social login separator and button */}
        {!isRegister && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-3 w-6" />
              <Skeleton className="h-px flex-1" />
            </div>
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        )}

        {/* Footer link skeleton */}
        <Skeleton className="mx-auto mt-2 h-4 w-48" />
      </CardContent>
    </Card>
  );
}
