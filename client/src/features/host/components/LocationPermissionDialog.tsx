import { Navigation, ShieldCheck, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LocationPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmStartSharing: () => void;
  tourName: string;
  guestCount: number;
}

export function LocationPermissionDialog({
  open,
  onOpenChange,
  onConfirmStartSharing,
  tourName,
  guestCount,
}: LocationPermissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-5 p-6">
        <DialogHeader className="text-center sm:text-left">
          <div className="bg-primary/10 text-primary mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl sm:mx-0">
            <Navigation className="size-6 animate-pulse" />
          </div>
          <DialogTitle className="font-display text-xl">
            Share your live location with guests?
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm">
            Guests of <strong className="text-foreground">{tourName}</strong> ({guestCount}{' '}
            travelers) will be able to track your real-time vehicle progress, highway milestones,
            and estimated arrival time.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-muted/40 border-border flex flex-col gap-2.5 rounded-xl border p-3.5 text-xs">
          <div className="text-foreground flex items-center gap-2 font-medium">
            <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
            <span>Host Privacy &amp; Consent Principles</span>
          </div>
          <ul className="text-muted-foreground list-disc space-y-1.5 pl-6 text-[11px] leading-relaxed">
            <li>Tracking is only active while you explicitly keep location sharing ON.</li>
            <li>
              Coordinates are restricted strictly to booked passengers of this specific event.
            </li>
            <li>You can pause or stop location transmission at any moment with one click.</li>
          </ul>
        </div>

        <DialogFooter className="flex flex-col-reverse items-stretch justify-end gap-2 pt-2 sm:flex-row sm:items-center">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Not Now
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-primary hover:bg-primary-600 gap-2"
            onClick={() => {
              onOpenChange(false);
              onConfirmStartSharing();
            }}
          >
            <MapPin className="size-4" />
            <span>Start Sharing</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
