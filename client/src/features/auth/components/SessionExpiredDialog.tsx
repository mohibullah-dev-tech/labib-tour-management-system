import { AlertCircle, LogIn } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AUTH_ROUTES } from '@/features/auth/constants/auth-routes';

export interface SessionExpiredDialogProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Session Expired State Dialog.
 *
 * Triggered automatically when:
 * 1. An access token expires and automatic refresh token rotation fails or is rejected.
 * 2. Backend invalidates the HTTP-only refresh cookie (e.g. security revocation or timeout).
 *
 * This provides high-clarity UX preventing unexpected data loss and redirecting users
 * back to /login with their attempted path preserved.
 *
 * Uses `window.location` so it can safely mount in global providers outside RouterProvider.
 */
export function SessionExpiredDialog({ open, onOpenChange }: SessionExpiredDialogProps) {
  const handleLoginRedirect = () => {
    onOpenChange?.(false);
    const returnPath = window.location.pathname;
    const target =
      returnPath && returnPath !== AUTH_ROUTES.login
        ? `${AUTH_ROUTES.login}?from=${encodeURIComponent(returnPath)}`
        : AUTH_ROUTES.login;
    window.location.assign(target);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="gap-2">
          <div className="bg-danger-50 text-danger-600 dark:bg-danger-950 flex size-12 items-center justify-center rounded-full">
            <AlertCircle className="size-6" aria-hidden="true" />
          </div>
          <DialogTitle className="text-xl">Session Expired</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Your login session has expired due to inactivity or token revocation. Please log in
            again to continue your session.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 sm:justify-end">
          <Button onClick={handleLoginRedirect} className="w-full gap-2 sm:w-auto">
            <LogIn className="size-4" />
            Log In Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
