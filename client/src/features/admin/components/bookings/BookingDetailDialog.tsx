import type { ReactNode } from 'react';
import { Printer, Download, Phone } from 'lucide-react';
import { toast } from 'sonner';
import type { BookingAdmin } from '@/features/admin/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatBDT, formatDate } from '@/lib/format';

export interface BookingDetailDialogProps {
  booking: BookingAdmin | null;
  onOpenChange: (open: boolean) => void;
}

/** Read-only guest/booking detail view, plus Print Ticket / Download PDF — both placeholders per the brief, wired to a toast so the interaction feels complete. */
function BookingDetailDialog({ booking, onOpenChange }: BookingDetailDialogProps) {
  if (!booking) return null;

  return (
    <Dialog open={!!booking} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{booking.bookingCode}</DialogTitle>
        </DialogHeader>

        <dl className="flex flex-col gap-2 text-sm">
          <Row label="Guest" value={booking.guestName} />
          <Row
            label="Phone"
            value={
              <a
                href={`tel:${booking.guestPhone}`}
                className="text-primary flex items-center gap-1 hover:underline"
              >
                <Phone className="size-3.5" />
                {booking.guestPhone}
              </a>
            }
          />
          <Row label="Event" value={booking.eventName} />
          <Row label="Seats" value={booking.seatIds.join(', ')} />
          <Row label="Package" value={booking.packageName} />
        </dl>

        <Separator />

        <dl className="flex flex-col gap-2 text-sm">
          <Row label="Total Amount" value={formatBDT(booking.totalAmountBDT)} />
          <Row label="Received" value={formatBDT(booking.receivedAmountBDT)} />
          <Row label="Due" value={formatBDT(booking.totalAmountBDT - booking.receivedAmountBDT)} />
          <Row label="Booked On" value={formatDate(booking.createdAt)} />
        </dl>

        <DialogFooter>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() =>
              toast.info('Ticket printing will be available once PDF generation is connected.')
            }
          >
            <Printer className="size-4" />
            Print Ticket
          </Button>
          <Button
            className="gap-2"
            onClick={() =>
              toast.info('PDF download will be available once the backend is connected.')
            }
          >
            <Download className="size-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground font-medium">{value}</dd>
    </div>
  );
}

export { BookingDetailDialog };
