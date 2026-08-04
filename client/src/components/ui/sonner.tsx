import { Toaster as Sonner, type ToasterProps } from 'sonner';
import { useTheme } from '@/lib/theme/useTheme';

/**
 * Global toast portal, mounted once in App.tsx. Uses `sonner` (not a
 * hand-rolled toast system) because getting stacking, swipe-to-dismiss,
 * and screen-reader announcements right is genuinely hard to reproduce
 * — sonner already handles it correctly and themes via CSS variables,
 * so it drops straight into our token system.
 */
function Toaster(props: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast rounded-lg border border-border bg-card text-card-foreground shadow-lg',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
