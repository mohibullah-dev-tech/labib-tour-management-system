import { CreditCard, Download, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentSummary } from '@/features/guest/components/PaymentSummary';
import { formatCurrency } from '@/lib/format';
import type { GuestPayment, GuestBooking } from '@/features/guest/types';

interface PaymentsViewProps {
  payments: GuestPayment[];
  bookings: GuestBooking[];
}

export function PaymentsView({ payments, bookings }: PaymentsViewProps) {
  const handleDownloadReceipt = (payment: GuestPayment) => {
    toast.success('Downloading payment receipt...', {
      description: `Receipt for ${payment.transactionId} (${payment.destination}) is being downloaded.`,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Financial Summary Cards */}
      <PaymentSummary payments={payments} bookings={bookings} />

      {/* Transactions History Table */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-3">
          <div className="text-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <CreditCard className="size-4" />
            <span>Transaction Ledger</span>
          </div>
          <CardTitle className="text-xl">Payment History</CardTitle>
          <CardDescription className="text-xs">
            All advance deposits, full tour payments, and bank transactions verified by LTMS
            accounts.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 sm:p-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-border bg-muted/40 text-muted-foreground border-b text-[11px] font-semibold tracking-wider uppercase">
                <tr>
                  <th className="p-4">Booking Ref</th>
                  <th className="p-4">Tour Destination</th>
                  <th className="p-4">Payment Date</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {payments.map((p) => {
                  const formattedDate = new Date(p.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="text-foreground p-4 font-mono font-semibold">{p.bookingId}</td>
                      <td className="text-foreground p-4 font-medium">{p.destination}</td>
                      <td className="text-muted-foreground p-4">{formattedDate}</td>
                      <td className="p-4">
                        <Badge variant="secondary" className="text-[10px] font-medium">
                          {p.method}
                        </Badge>
                      </td>
                      <td className="text-muted-foreground p-4 font-mono text-[11px]">
                        {p.transactionId}
                      </td>
                      <td className="p-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" />
                          <span>Success</span>
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground size-8"
                          title="Download Receipt"
                          onClick={() => handleDownloadReceipt(p)}
                        >
                          <Download className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
