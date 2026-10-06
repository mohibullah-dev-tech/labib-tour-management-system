/**
 * Location Permission & Error Notification Banner
 * Labib Tour Management System (LTMS) — Phase 11
 */

import { AlertTriangle, Settings, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LocationErrorState } from '../types/location.types';

interface LocationPermissionNoticeProps {
  error: LocationErrorState | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function LocationPermissionNotice({
  error,
  onRetry,
  onDismiss,
}: LocationPermissionNoticeProps) {
  if (!error) return null;

  return (
    <div
      role="alert"
      className="bg-destructive/10 border-destructive/20 text-destructive flex flex-col items-start justify-between gap-3 rounded-2xl border p-4 text-xs sm:flex-row sm:items-center dark:text-rose-300"
    >
      <div className="flex items-start gap-3">
        <div className="bg-destructive/20 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl">
          <AlertTriangle className="size-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold">GPS / Location Alert</h4>
          <p className="text-destructive/90 mt-0.5 leading-relaxed dark:text-rose-200">
            {error.userFriendlyMessage}
          </p>
          {error.code === 'PERMISSION_DENIED' && (
            <p className="mt-1 flex items-center gap-1 text-[11px] opacity-80">
              <Settings className="size-3" />
              <span>
                Tap your browser address bar icon &gt; Permissions &gt; Set Location to
                &ldquo;Allow&rdquo;.
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            className="border-destructive/30 hover:bg-destructive/10 text-destructive h-8 gap-1.5 text-xs font-semibold dark:text-rose-200"
            onClick={onRetry}
          >
            <RefreshCw className="size-3" />
            <span>Try Again</span>
          </Button>
        )}
        {onDismiss && (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive/70 hover:text-destructive size-8 p-0"
            onClick={onDismiss}
            aria-label="Dismiss alert"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
