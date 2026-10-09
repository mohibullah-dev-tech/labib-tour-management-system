import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { CheckCircle2, QrCode, Download, LayoutDashboard, Loader2, Receipt } from 'lucide-react';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import { fadeInUp } from '@/lib/animations/variants';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ticketService } from '@/features/booking/services/ticket.service';

/**
 * Step 7 — confirmation screen with official PDF ticket and receipt download.
 */
function BookingSuccessStep() {
  const { draft, reset } = useBooking();
  const reducedMotion = useReducedMotion();
  const [downloadingTicket, setDownloadingTicket] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  if (!draft.event || !draft.bookingId) return null;

  const handleDownloadTicket = async () => {
    if (!draft.bookingId) return;
    setDownloadingTicket(true);
    try {
      await ticketService.downloadTicketPdf(draft.bookingId);
    } finally {
      setDownloadingTicket(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!draft.bookingId) return;
    setDownloadingReceipt(true);
    try {
      await ticketService.downloadReceiptPdf(draft.bookingId);
    } finally {
      setDownloadingReceipt(false);
    }
  };

  return (
    <motion.div
      initial={reducedMotion ? false : 'hidden'}
      animate="visible"
      variants={fadeInUp}
      className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center"
    >
      <div className="bg-success-50 text-success-600 dark:bg-success-950 flex size-16 items-center justify-center rounded-full">
        <CheckCircle2 className="size-9" aria-hidden="true" />
      </div>

      <div>
        <h2 className="font-display text-foreground text-2xl font-semibold">Booking Confirmed!</h2>
        <p className="text-muted-foreground mt-1">
          Your seat{draft.selectedSeatIds.length > 1 ? 's are' : ' is'} reserved for{' '}
          {draft.event.tourName} on {formatDate(draft.event.departureDate)}.
        </p>
      </div>

      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-4 pt-6">
          <div>
            <p className="text-muted-foreground text-xs">Booking ID</p>
            <p className="font-display text-primary text-xl font-semibold tracking-wide">
              {draft.bookingId}
            </p>
          </div>

          {/* QR code placeholder — will encode a real verification URL once the backend issues one. */}
          <div className="border-border bg-muted/40 flex size-32 items-center justify-center rounded-lg border-2 border-dashed">
            <QrCode className="text-muted-foreground size-12" aria-hidden="true" />
          </div>
          <p className="text-muted-foreground text-xs">Show this QR code at pickup</p>
        </CardContent>
      </Card>

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          disabled={downloadingTicket || downloadingReceipt}
          onClick={handleDownloadTicket}
        >
          {downloadingTicket ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Download Ticket PDF
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2"
          disabled={downloadingTicket || downloadingReceipt}
          onClick={handleDownloadReceipt}
        >
          {downloadingReceipt ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Receipt className="size-4" />
          )}
          Download Receipt
        </Button>
        <Button className="flex-1 gap-2" asChild onClick={reset}>
          <Link to="/guest">
            <LayoutDashboard className="size-4" />
            My Bookings
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}

export { BookingSuccessStep };
