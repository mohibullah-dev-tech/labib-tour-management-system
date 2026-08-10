import type { GuestAdmin } from '@/features/admin/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export interface GuestProfileDialogProps {
  guest: GuestAdmin | null;
  onOpenChange: (open: boolean) => void;
}

/** Travel History / Upcoming Tours are summarized as counts here (aggregate fields on GuestAdmin) — a full per-tour history table is a natural next increment once bookings are joined to guests server-side. */
function GuestProfileDialog({ guest, onOpenChange }: GuestProfileDialogProps) {
  if (!guest) return null;

  return (
    <Dialog open={!!guest} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{guest.name}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-3">
          <Badge variant="secondary">{guest.totalToursCompleted} tours completed</Badge>
          <Badge variant={guest.upcomingTourCount > 0 ? 'default' : 'muted'}>
            {guest.upcomingTourCount} upcoming
          </Badge>
        </div>

        <Separator />

        <dl className="flex flex-col gap-2 text-sm">
          <Row label="Phone" value={guest.phone} />
          <Row label="Email" value={guest.email} />
        </dl>

        <Separator />

        <dl className="flex flex-col gap-2 text-sm">
          <Row label="Emergency Contact" value={guest.emergencyContactName} />
          <Row label="Emergency Phone" value={guest.emergencyContactPhone} />
        </dl>

        <p className="border-border bg-muted/40 text-muted-foreground rounded-md border border-dashed p-3 text-xs">
          A detailed per-tour travel history will appear here once bookings are linked to guest
          profiles server-side.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground font-medium">{value}</dd>
    </div>
  );
}

export { GuestProfileDialog };
