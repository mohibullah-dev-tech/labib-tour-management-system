import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { CheckCircle2, XCircle, Download, Receipt, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatBDT } from '@/lib/format';
import { ticketService } from '@/features/booking/services/ticket.service';

export function PaymentResultPage() {
  const [params] = useSearchParams();
  const status = params.get('status') || 'success';
  const bookingCode = params.get('bookingCode') || '';
  const tranId = params.get('tranId') || '';
  const amount = Number.parseFloat(params.get('amount') || '0');

  const [isDownloading, setIsDownloading] = useState(false);

  const isSuccess = status === 'success';

  return (
    <div className="bg-muted/20 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="flex flex-col items-center pt-8 pb-4">
          <div
            className={`mb-2 flex size-16 items-center justify-center rounded-full ${
              isSuccess
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
            }`}
          >
            {isSuccess ? <CheckCircle2 className="size-10" /> : <XCircle className="size-10" />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSuccess ? 'Payment Successful!' : 'Payment Failed / Cancelled'}
          </CardTitle>
          <p className="text-muted-foreground mt-1 text-sm">
            {isSuccess
              ? 'Your tour booking has been confirmed with your online payment.'
              : 'The payment transaction could not be completed.'}
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 pb-8">
          {bookingCode && (
            <div className="bg-muted/40 flex flex-col gap-2 rounded-lg border p-4 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="text-foreground font-bold">{bookingCode}</span>
              </div>
              {tranId && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="text-foreground font-mono text-xs font-semibold">{tranId}</span>
                </div>
              )}
              {amount > 0 && (
                <div className="flex justify-between border-t pt-2">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-bold text-emerald-600">{formatBDT(amount)}</span>
                </div>
              )}
            </div>
          )}

          {isSuccess ? (
            <div className="flex flex-col gap-2 pt-2">
              <Button
                className="w-full gap-2 bg-teal-600 text-white hover:bg-teal-700"
                disabled={isDownloading || !bookingCode}
                onClick={async () => {
                  setIsDownloading(true);
                  try {
                    await ticketService.downloadTicketPdf(bookingCode);
                  } finally {
                    setIsDownloading(false);
                  }
                }}
              >
                {isDownloading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Download Confirmed Ticket PDF
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2"
                disabled={isDownloading || !bookingCode}
                onClick={async () => {
                  setIsDownloading(true);
                  try {
                    await ticketService.downloadReceiptPdf(bookingCode);
                  } finally {
                    setIsDownloading(false);
                  }
                }}
              >
                <Receipt className="size-4" />
                Download Money Receipt
              </Button>

              <Button variant="ghost" asChild className="mt-2">
                <Link to="/guest">Go to My Bookings</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild className="w-full gap-2">
                <Link to="/booking">
                  <ArrowLeft className="size-4" />
                  Try Again / Choose Another Method
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
