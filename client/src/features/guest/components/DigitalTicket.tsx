import { useRef, useState } from 'react';
import {
  Compass,
  Download,
  Printer,
  Share2,
  MapPin,
  Bus,
  User,
  Phone,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format';
import type { GuestBooking } from '@/features/guest/types';
import { ticketService } from '@/features/booking/services/ticket.service';

interface DigitalTicketProps {
  booking: GuestBooking;
  className?: string;
  showActions?: boolean;
}

export function DigitalTicket({ booking, className, showActions = true }: DigitalTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const formattedDeparture = new Date(booking.departureDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      if (booking.bookingStatus === 'confirmed' || booking.bookingStatus === 'completed') {
        await ticketService.downloadTicketPdf(booking.id, booking.id);
      } else {
        await ticketService.downloadReceiptPdf(booking.id, booking.id);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `LTMS Tour Ticket: ${booking.destination}`,
      text: `My confirmed ticket for ${booking.tourName} (${booking.destination}) with Labib Tour & Travel Group. Seat: ${booking.seatNumbers.join(', ')}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        // User dismissed share dialog
      }
    } else {
      await navigator.clipboard.writeText(
        `LTMS Ticket #${booking.id} - ${booking.tourName} | Departure: ${formattedDeparture} | Seats: ${booking.seatNumbers.join(', ')}`,
      );
      toast.success('Ticket details copied to clipboard!');
    }
  };

  return (
    <div className={`flex flex-col gap-4 ${className || ''}`}>
      {/* Ticket Body with perforated border & cutout styling */}
      <div
        ref={ticketRef}
        className="border-border bg-card text-card-foreground relative overflow-hidden rounded-2xl border shadow-xl print:border-black print:shadow-none"
      >
        {/* Top Header Banner */}
        <div className="bg-primary text-primary-foreground px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-xs">
                <Compass className="size-5 text-white" />
              </div>
              <div>
                <h3 className="font-display text-base leading-none font-bold tracking-tight text-white">
                  Labib Tour & Travel Group
                </h3>
                <p className="text-primary-100 mt-0.5 text-[11px] opacity-90">
                  Official Passenger Boarding Pass &amp; E-Ticket
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 font-mono text-xs font-semibold tracking-wider text-white backdrop-blur-xs">
                {booking.id}
              </span>
            </div>
          </div>
        </div>

        {/* Main Ticket Grid */}
        <div className="p-6">
          {/* Destination Header */}
          <div className="border-border/80 border-b pb-4">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Tour Destination
                </span>
                <h2 className="font-display text-foreground text-2xl font-bold tracking-tight">
                  {booking.destination}
                </h2>
                <p className="text-muted-foreground mt-0.5 text-xs">{booking.tourName}</p>
              </div>

              <div className="flex items-center gap-1.5 self-start rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 sm:self-auto dark:text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                <span>Confirmed Passenger</span>
              </div>
            </div>
          </div>

          {/* Details 2-Column Grid */}
          <div className="border-border/80 grid grid-cols-2 gap-4 border-b py-5 sm:grid-cols-4 sm:gap-6">
            <div>
              <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                Departure Date
              </span>
              <p className="text-foreground mt-1 text-sm font-semibold sm:text-base">
                {formattedDeparture}
              </p>
              <p className="text-muted-foreground text-xs">{booking.departureTime}</p>
            </div>

            <div>
              <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                Assigned Seats
              </span>
              <p className="text-primary mt-1 font-mono text-lg font-bold sm:text-xl">
                {booking.seatNumbers.join(', ')}
              </p>
              <p className="text-muted-foreground text-xs">{booking.guestCount} Passenger(s)</p>
            </div>

            <div>
              <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                Package Tier
              </span>
              <p className="text-foreground mt-1 text-sm font-semibold capitalize sm:text-base">
                {booking.packageName}
              </p>
              <p className="text-muted-foreground text-xs">{booking.duration}</p>
            </div>

            <div>
              <span className="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">
                Bus Details
              </span>
              <p className="text-foreground mt-1 flex items-center gap-1 text-sm font-semibold sm:text-base">
                <Bus className="text-primary size-3.5" />
                <span>{booking.busInfo.acType} Coach</span>
              </p>
              <p className="text-muted-foreground font-mono text-xs">{booking.busInfo.busNumber}</p>
            </div>
          </div>

          {/* Passenger & Logistics Row */}
          <div className="grid grid-cols-1 gap-4 py-5 sm:grid-cols-3 sm:gap-6">
            <div>
              <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium tracking-wider uppercase">
                <User className="text-muted-foreground size-3" />
                <span>Lead Guest</span>
              </span>
              <p className="text-foreground mt-1 text-sm font-semibold">
                {booking.guestInfo.fullName}
              </p>
              <p className="text-muted-foreground text-xs">{booking.guestInfo.phone}</p>
            </div>

            <div>
              <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium tracking-wider uppercase">
                <MapPin className="text-muted-foreground size-3" />
                <span>Pickup &amp; Reporting</span>
              </span>
              <p className="text-foreground mt-1 text-sm font-semibold">
                {booking.guestInfo.pickupLocation}
              </p>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Report by: {booking.reportingTime}
              </p>
            </div>

            <div>
              <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-medium tracking-wider uppercase">
                <Phone className="text-muted-foreground size-3" />
                <span>Assigned Tour Host</span>
              </span>
              <p className="text-foreground mt-1 text-sm font-semibold">{booking.hostInfo.name}</p>
              <a
                href={booking.hostInfo.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-xs font-medium hover:underline"
              >
                {booking.hostInfo.phone} (WhatsApp)
              </a>
            </div>
          </div>
        </div>

        {/* Perforated Divider with cutouts */}
        <div className="relative flex items-center justify-between px-2">
          <div className="bg-background border-border -ml-4 size-4 rounded-full border" />
          <div className="border-border/80 mx-2 flex-1 border-b-2 border-dashed" />
          <div className="bg-background border-border -mr-4 size-4 rounded-full border" />
        </div>

        {/* Footer with QR Code Placeholder & Verification Note */}
        <div className="bg-muted/40 flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
          <div className="flex items-center gap-4">
            {/* Styled QR Code SVG Placeholder */}
            <div className="border-border/80 flex size-20 shrink-0 items-center justify-center rounded-xl border bg-white p-2 shadow-xs">
              <svg
                viewBox="0 0 100 100"
                className="size-full text-neutral-900"
                fill="currentColor"
                aria-label="Ticket verification QR Code"
              >
                {/* Visual QR Code Pattern */}
                <rect x="5" y="5" width="25" height="25" rx="3" fill="#000" />
                <rect x="9" y="9" width="17" height="17" rx="2" fill="#fff" />
                <rect x="13" y="13" width="9" height="9" fill="#000" />

                <rect x="70" y="5" width="25" height="25" rx="3" fill="#000" />
                <rect x="74" y="9" width="17" height="17" rx="2" fill="#fff" />
                <rect x="78" y="13" width="9" height="9" fill="#000" />

                <rect x="5" y="70" width="25" height="25" rx="3" fill="#000" />
                <rect x="9" y="74" width="17" height="17" rx="2" fill="#fff" />
                <rect x="13" y="78" width="9" height="9" fill="#000" />

                <rect x="36" y="10" width="8" height="8" fill="#000" />
                <rect x="50" y="10" width="12" height="6" fill="#000" />
                <rect x="36" y="24" width="24" height="6" fill="#000" />
                <rect x="40" y="36" width="20" height="20" rx="4" fill="hsl(var(--primary))" />
                <circle cx="50" cy="46" r="4" fill="#fff" />
                <rect x="10" y="40" width="18" height="6" fill="#000" />
                <rect x="10" y="52" width="22" height="8" fill="#000" />
                <rect x="70" y="40" width="18" height="6" fill="#000" />
                <rect x="70" y="52" width="24" height="8" fill="#000" />
                <rect x="36" y="68" width="16" height="6" fill="#000" />
                <rect x="58" y="68" width="14" height="8" fill="#000" />
                <rect x="36" y="82" width="36" height="8" fill="#000" />
                <rect x="78" y="82" width="14" height="8" fill="#000" />
              </svg>
            </div>

            <div className="text-left">
              <p className="text-foreground text-xs font-semibold">Scan at Boarding Gate</p>
              <p className="text-muted-foreground mt-0.5 max-w-xs text-[11px]">
                Present this digital QR code on your mobile device or printed copy to your tour host
                at the meeting point.
              </p>
              <p className="text-muted-foreground mt-1 font-mono text-[10px]">
                Issued for {booking.guestInfo.fullName} &bull; Total{' '}
                {formatCurrency(booking.totalAmount)}
              </p>
            </div>
          </div>

          <div className="text-muted-foreground text-right text-[11px]">
            <p className="text-foreground font-semibold">24/7 Dispatch Hotline</p>
            <p className="mt-0.5 font-mono">+880 1700-000000</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-end gap-2.5 print:hidden">
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
            <Share2 className="size-4" />
            <span>Share Ticket</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="size-4" />
            <span>Print Ticket</span>
          </Button>

          <Button
            size="sm"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="gap-1.5"
          >
            {isDownloading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            <span>
              {booking.bookingStatus === 'confirmed' || booking.bookingStatus === 'completed'
                ? 'Download Ticket PDF'
                : 'Download Receipt'}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
