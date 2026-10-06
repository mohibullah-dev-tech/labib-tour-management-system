import { CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import type { GuestPayment, GuestBooking } from '@/features/guest/types';

interface PaymentSummaryProps {
  payments: GuestPayment[];
  bookings: GuestBooking[];
}

export function PaymentSummary({ payments, bookings }: PaymentSummaryProps) {
  const totalPaid = payments
    .filter((p) => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalDue = bookings
    .filter((b) => b.bookingStatus !== 'cancelled')
    .reduce((sum, b) => sum + b.dueAmount, 0);

  const totalBookingsValue = bookings
    .filter((b) => b.bookingStatus !== 'cancelled')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Total Paid Card */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <span className="text-muted-foreground block text-xs font-medium tracking-wider uppercase">
              Total Paid
            </span>
            <span className="font-display mt-1 block text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalPaid)}
            </span>
            <span className="text-muted-foreground mt-0.5 block text-[11px]">
              Across {payments.length} verified transactions
            </span>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Wallet className="size-6" />
          </div>
        </CardContent>
      </Card>

      {/* Total Due Card */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <span className="text-muted-foreground block text-xs font-medium tracking-wider uppercase">
              Pending Due
            </span>
            <span
              className={`font-display mt-1 block text-2xl font-bold tracking-tight ${
                totalDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
              }`}
            >
              {formatCurrency(totalDue)}
            </span>
            <span className="text-muted-foreground mt-0.5 block text-[11px]">
              {totalDue > 0 ? 'Payable before departure' : 'All bookings clear'}
            </span>
          </div>
          <div
            className={`flex size-11 items-center justify-center rounded-xl ${
              totalDue > 0
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-primary/10 text-primary'
            }`}
          >
            <AlertCircle className="size-6" />
          </div>
        </CardContent>
      </Card>

      {/* Total Lifetime Value */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <span className="text-muted-foreground block text-xs font-medium tracking-wider uppercase">
              Total Booking Value
            </span>
            <span className="font-display text-foreground mt-1 block text-2xl font-bold tracking-tight">
              {formatCurrency(totalBookingsValue)}
            </span>
            <span className="text-muted-foreground mt-0.5 block text-[11px]">
              For {bookings.length} registered tour packages
            </span>
          </div>
          <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl">
            <CreditCard className="size-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
