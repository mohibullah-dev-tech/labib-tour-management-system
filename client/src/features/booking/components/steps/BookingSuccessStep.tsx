import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import {
  CheckCircle2,
  QrCode,
  Download,
  LayoutDashboard,
  Loader2,
  Receipt,
  CreditCard,
} from 'lucide-react';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import { fadeInUp } from '@/lib/animations/variants';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ticketService } from '@/features/booking/services/ticket.service';
import { SSLCommerzPaymentModal } from '@/features/booking/components/SSLCommerzPaymentModal';

/**
 * Step 7 — confirmation screen with official PDF ticket and receipt download.
 */
function BookingSuccessStep() {
  const { draft, reset } = useBooking();
  const reducedMotion = useReducedMotion();
  const [downloadingTicket, setDownloadingTicket] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

      {/* SSLCommerz Online Payment Banner */}
      <div className="w-full rounded-xl border border-teal-500/30 bg-teal-50/50 p-4 text-left dark:bg-teal-950/20">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 animate-pulse rounded-full bg-amber-500" />
              <p className="text-foreground text-sm font-semibold">Online Payment Pending</p>
            </div>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Pay via bKash, Nagad, Rocket, Visa/Mastercard to instantly confirm your seat.
            </p>
          </div>
          <Button
            className="shrink-0 gap-2 bg-teal-600 font-medium text-white hover:bg-teal-700"
            onClick={() => setShowPaymentModal(true)}
          >
            <CreditCard className="size-4" />
            Pay with SSLCommerz
          </Button>
        </div>
      </div>

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

      <SSLCommerzPaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        bookingCode={draft.bookingId}
        totalAmount={
          (draft.packageOption?.pricePerPersonBDT || 6500) * (draft.selectedSeatIds?.length || 1)
        }
        minimumAdvance={Math.ceil(
          ((draft.packageOption?.pricePerPersonBDT || 6500) *
            (draft.selectedSeatIds?.length || 1) *
            30) /
            100,
        )}
        guestName={draft.guestForm.fullName}
        guestPhone={draft.guestForm.phone}
        guestEmail={draft.guestForm.email}
      />
    </motion.div>
  );
}

export { BookingSuccessStep };
