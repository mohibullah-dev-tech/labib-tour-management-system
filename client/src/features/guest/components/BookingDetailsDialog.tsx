import {
  MapPin,
  Bus,
  User,
  Phone,
  Calendar,
  CreditCard,
  Ticket,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from '@/features/guest/components/BookingStatusBadge';
import { formatCurrency } from '@/lib/format';
import type { GuestBooking } from '@/features/guest/types';

interface BookingDetailsDialogProps {
  booking: GuestBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewTicket?: (booking: GuestBooking) => void;
  onCancelRequest?: (booking: GuestBooking) => void;
}

export function BookingDetailsDialog({
  booking,
  open,
  onOpenChange,
  onViewTicket,
  onCancelRequest,
}: BookingDetailsDialogProps) {
  if (!booking) return null;

  const formattedDeparture = new Date(booking.departureDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedReturn = new Date(booking.returnDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl gap-6 overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-primary font-mono text-xs font-semibold uppercase">
              Booking Ref: {booking.id}
            </span>
            <div className="flex items-center gap-2">
              <BookingStatusBadge status={booking.bookingStatus} />
              <PaymentStatusBadge status={booking.paymentStatus} />
            </div>
          </div>
          <DialogTitle className="font-display mt-1 text-xl sm:text-2xl">
            {booking.tourName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
            Detailed booking summary, passenger details, bus allocation, and payment breakdown.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* Section 1: Tour Information */}
          <div className="border-border bg-card rounded-xl border p-4">
            <h4 className="text-muted-foreground mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
              <Calendar className="text-primary size-3.5" />
              <span>Tour Information</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 sm:gap-4 sm:text-sm">
              <div>
                <span className="text-muted-foreground block text-[11px]">Destination</span>
                <span className="text-foreground font-medium">{booking.destination}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Departure Date</span>
                <span className="text-foreground font-medium">{formattedDeparture}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Return Date</span>
                <span className="text-foreground font-medium">{formattedReturn}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Duration / Package</span>
                <span className="text-foreground font-medium">
                  {booking.duration} ({booking.packageName})
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Guest Information */}
          <div className="border-border bg-card rounded-xl border p-4">
            <h4 className="text-muted-foreground mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
              <User className="text-primary size-3.5" />
              <span>Guest Information</span>
            </h4>
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 sm:gap-4 sm:text-sm">
              <div>
                <span className="text-muted-foreground block text-[11px]">Lead Passenger</span>
                <span className="text-foreground font-medium">{booking.guestInfo.fullName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Contact Phone</span>
                <span className="text-foreground font-medium">{booking.guestInfo.phone}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Passenger Address</span>
                <span className="text-foreground font-medium">{booking.guestInfo.address}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Pickup Location</span>
                <span className="text-foreground flex items-center gap-1 font-medium">
                  <MapPin className="text-primary size-3 shrink-0" />
                  <span>{booking.guestInfo.pickupLocation}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Bus & Host Allocation */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Bus Info */}
            <div className="border-border bg-card rounded-xl border p-4">
              <h4 className="text-muted-foreground mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                <Bus className="text-primary size-3.5" />
                <span>Bus Allocation</span>
              </h4>
              <div className="flex flex-col gap-2 text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    Bus Name &amp; Type
                  </span>
                  <span className="text-foreground font-medium">
                    {booking.busInfo.name} ({booking.busInfo.acType})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">License Number</span>
                  <span className="text-foreground font-mono text-xs font-medium">
                    {booking.busInfo.busNumber}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Assigned Seats</span>
                  <span className="text-primary font-mono text-base font-bold">
                    {booking.seatNumbers.join(', ')} ({booking.guestCount} Guest)
                  </span>
                </div>
              </div>
            </div>

            {/* Host Info */}
            <div className="border-border bg-card rounded-xl border p-4">
              <h4 className="text-muted-foreground mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                <Phone className="text-primary size-3.5" />
                <span>Host Information</span>
              </h4>
              <div className="flex flex-col gap-2 text-xs sm:text-sm">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Tour Host Name</span>
                  <span className="text-foreground font-medium">{booking.hostInfo.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Host Phone</span>
                  <span className="text-foreground font-medium">{booking.hostInfo.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Direct WhatsApp</span>
                  <a
                    href={booking.hostInfo.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary mt-0.5 inline-flex items-center gap-1 text-xs font-medium hover:underline"
                  >
                    Chat on WhatsApp &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Payment Summary */}
          <div className="border-border bg-muted/30 rounded-xl border p-4">
            <h4 className="text-muted-foreground mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
              <CreditCard className="text-primary size-3.5" />
              <span>Payment Summary</span>
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-card border-border rounded-lg border p-2.5">
                <span className="text-muted-foreground block text-[11px]">Total Amount</span>
                <span className="text-foreground text-sm font-semibold sm:text-base">
                  {formatCurrency(booking.totalAmount)}
                </span>
              </div>
              <div className="bg-card border-border rounded-lg border p-2.5">
                <span className="text-muted-foreground block text-[11px]">Received</span>
                <span className="text-sm font-semibold text-emerald-600 sm:text-base dark:text-emerald-400">
                  {formatCurrency(booking.receivedAmount)}
                </span>
              </div>
              <div className="bg-card border-border rounded-lg border p-2.5">
                <span className="text-muted-foreground block text-[11px]">Due Balance</span>
                <span
                  className={`text-sm font-semibold sm:text-base ${
                    booking.dueAmount > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  {formatCurrency(booking.dueAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-border flex flex-wrap items-center justify-between gap-2 border-t pt-4">
          <div>
            {booking.bookingStatus === 'confirmed' && onCancelRequest && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 gap-1.5"
                onClick={() => {
                  onOpenChange(false);
                  onCancelRequest(booking);
                }}
              >
                <AlertTriangle className="size-3.5" />
                <span>Request Cancellation</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {onViewTicket && booking.bookingStatus !== 'cancelled' && (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  onOpenChange(false);
                  onViewTicket(booking);
                }}
              >
                <Ticket className="size-3.5" />
                <span>View E-Ticket</span>
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
