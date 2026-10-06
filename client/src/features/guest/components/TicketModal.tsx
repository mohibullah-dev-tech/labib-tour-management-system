import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { DigitalTicket } from '@/features/guest/components/DigitalTicket';
import type { GuestBooking } from '@/features/guest/types';

interface TicketModalProps {
  booking: GuestBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketModal({ booking, open, onOpenChange }: TicketModalProps) {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="sr-only">
          <DialogTitle>Digital Ticket - {booking.id}</DialogTitle>
          <DialogDescription>
            Your e-ticket and boarding pass for {booking.destination}
          </DialogDescription>
        </DialogHeader>

        <DigitalTicket booking={booking} />
      </DialogContent>
    </Dialog>
  );
}
