/**
 * Explicit Host Location Sharing Permission Dialog
 * Labib Tour Management System (LTMS) — Phase 11
 *
 * Enforces the strict privacy rule: Never silently broadcast coordinates.
 * Host must explicitly confirm sharing before browser geolocation is queried.
 */

import { Navigation, ShieldCheck, Users, Lock, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface StartLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmStartSharing: () => void;
  tourName: string;
  destination: string;
  busNumber: string;
  guestCount: number;
}

export function StartLocationDialog({
  open,
  onOpenChange,
  onConfirmStartSharing,
  tourName,
  destination,
  busNumber,
  guestCount,
}: StartLocationDialogProps) {
  const handleConfirm = () => {
    onOpenChange(false);
    onConfirmStartSharing();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-5 p-6">
        <DialogHeader>
          <div className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Navigation className="size-6 animate-pulse" />
          </div>
          <DialogTitle className="font-display text-xl font-bold">
            Start Live Location Sharing?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs leading-relaxed">
            Your live location will be shared with guests of this tour and authorized administrators
            while the tour is active.
          </DialogDescription>
        </DialogHeader>

        {/* Tour & Fleet Details Card */}
        <div className="bg-muted/40 border-border flex flex-col gap-2 rounded-xl border p-3.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tour Destination:</span>
            <span className="text-foreground font-bold">{destination}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Assigned Bus:</span>
            <span className="text-primary font-mono font-bold">{busNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Passenger Audience:</span>
            <span className="text-foreground font-bold">{guestCount} Booked Travelers</span>
          </div>
        </div>

        {/* Privacy Safeguards Breakdown */}
        <div className="text-muted-foreground space-y-2.5 text-xs">
          <div className="flex items-start gap-2.5">
            <Users className="text-primary mt-0.5 size-4 shrink-0" />
            <span>
              <strong>Event-Scoped Audience:</strong> Only travelers with confirmed tickets for{' '}
              <em>{tourName}</em> can view your location.
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <Lock className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              <strong>Strict Privacy:</strong> Personal device data is never accessed. Only vehicle
              highway coordinates, speed, and heading are shared.
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Full Control:</strong> You can pause or stop location sharing at any time
              using the one-tap [Stop Sharing] button.
            </span>
          </div>
        </div>

        <DialogFooter className="border-border flex-col gap-2 border-t pt-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full text-xs sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            className="w-full gap-2 bg-emerald-600 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 sm:w-auto"
            onClick={handleConfirm}
          >
            <ShieldCheck className="size-4" />
            <span>Start Live Location</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
