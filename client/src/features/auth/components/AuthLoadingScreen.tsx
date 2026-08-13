import { Spinner } from '@/components/ui/spinner';

/** Full-screen loading state shown only while the app is restoring a session on first load (see AuthProvider's isRestoring). */
function AuthLoadingScreen() {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" label="Checking your session" />
      <p className="text-muted-foreground text-sm">Just a moment...</p>
    </div>
  );
}

export { AuthLoadingScreen };
