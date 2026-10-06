import { MapPin, Calendar, Bus, Ticket, Phone, Eye, MoreHorizontal, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from '@/features/guest/components/BookingStatusBadge';
import { formatCurrency } from '@/lib/format';
import type { GuestBooking } from '@/features/guest/types';

interface BookingCardProps {
  booking: GuestBooking;
  onViewDetails: (booking: GuestBooking) => void;
  onViewTicket: (booking: GuestBooking) => void;
  onContactHost?: (booking: GuestBooking) => void;
  onCancelRequest?: (booking: GuestBooking) => void;
}

export function BookingCard({
  booking,
  onViewDetails,
  onViewTicket,
  onCancelRequest,
}: BookingCardProps) {
  const formattedDate = new Date(booking.departureDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card className="border-border bg-card overflow-hidden shadow-xs transition-all hover:shadow-md">
      <div className="bg-muted relative h-32 w-full overflow-hidden">
        <img
          src={booking.coverImage}
          alt={booking.destination}
          className="size-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <BookingStatusBadge status={booking.bookingStatus} />
        </div>
        <div className="absolute top-2.5 right-2.5">
          <PaymentStatusBadge status={booking.paymentStatus} />
        </div>
        <div className="absolute right-2.5 bottom-2.5 left-2.5 text-white">
          <span className="block font-mono text-[10px] tracking-wider text-white/80 uppercase">
            {booking.id}
          </span>
          <h3 className="font-display truncate text-base leading-tight font-bold tracking-tight">
            {booking.destination}
          </h3>
        </div>
      </div>

      <CardContent className="flex flex-col gap-3 p-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-muted-foreground flex items-center gap-1.5">
            <Calendar className="text-primary size-3.5 shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5">
            <Bus className="text-primary size-3.5 shrink-0" />
            <span className="truncate font-mono font-medium">
              Seat {booking.seatNumbers.join(', ')}
            </span>
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5">
            <MapPin className="text-primary size-3.5 shrink-0" />
            <span className="truncate">{booking.packageName}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-1.5">
            <span className="text-foreground font-medium">
              {formatCurrency(booking.totalAmount)}
            </span>
            {booking.dueAmount > 0 && (
              <span className="text-[10px] font-semibold text-rose-600">
                (Due: {formatCurrency(booking.dueAmount)})
              </span>
            )}
          </div>
        </div>

        <div className="border-border flex items-center justify-between gap-2 border-t pt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1 text-xs"
            onClick={() => onViewDetails(booking)}
          >
            <Eye className="size-3.5" />
            <span>Details</span>
          </Button>

          {booking.bookingStatus !== 'cancelled' && (
            <Button
              size="sm"
              className="flex-1 gap-1 text-xs"
              onClick={() => onViewTicket(booking)}
            >
              <Ticket className="size-3.5" />
              <span>Ticket</span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Booking options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <a
                  href={booking.hostInfo.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Phone className="size-4" />
                  <span>Contact Host</span>
                </a>
              </DropdownMenuItem>

              {booking.bookingStatus === 'confirmed' && onCancelRequest && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive flex cursor-pointer items-center gap-2"
                  onClick={() => onCancelRequest(booking)}
                >
                  <XCircle className="size-4" />
                  <span>Cancel Request</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
