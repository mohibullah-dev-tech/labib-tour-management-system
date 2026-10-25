import { useState } from 'react';
import { DollarSign, Loader2, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatBDT } from '@/lib/format';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';

export interface BookingToPay {
  id: string;
  bookingCode: string;
  guestName: string;
  totalAmountBDT: number;
  receivedAmountBDT: number;
}

export interface AddPaymentDialogProps {
  booking: BookingToPay | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentRecorded: () => void;
}

export function AddPaymentDialog({
  booking,
  open,
  onOpenChange,
  onPaymentRecorded,
}: AddPaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dueAmount = booking ? Math.max(0, booking.totalAmountBDT - booking.receivedAmountBDT) : 0;

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'bank' | 'mobile_banking'>('cash');
  const [transactionId, setTransactionId] = useState('');
  const [note, setNote] = useState('');

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payNum = Number.parseFloat(amount);
    if (!payNum || payNum <= 0) {
      toast.error('Please enter a valid positive payment amount.');
      return;
    }
    if (payNum > dueAmount) {
      toast.error(`Payment cannot exceed the due amount (${formatBDT(dueAmount)}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(`/admin/bookings/${booking.id}/payments`, {
        amount: payNum,
        method,
        transactionId: transactionId.trim() || undefined,
        note: note.trim() || undefined,
      });

      toast.success(`Payment of ${formatBDT(payNum)} recorded for ${booking.bookingCode}!`);
      onPaymentRecorded();
      onOpenChange(false);
      setAmount('');
      setTransactionId('');
      setNote('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to record payment.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="size-5" />
            <DialogTitle>Record Payment: {booking.bookingCode}</DialogTitle>
          </div>
          <DialogDescription>
            Record an offline payment (Cash, Bank, or Mobile Banking) to update dues and confirm
            this booking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2 text-sm">
          {/* Summary Box */}
          <div className="bg-muted/40 flex flex-col gap-1.5 rounded-lg border p-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Guest:</span>
              <span className="text-foreground font-semibold">{booking.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Cost:</span>
              <span className="text-foreground font-medium">
                {formatBDT(booking.totalAmountBDT)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Already Paid:</span>
              <span className="font-medium text-emerald-600">
                {formatBDT(booking.receivedAmountBDT)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-1.5 font-bold">
              <span>Remaining Due:</span>
              <span className="text-teal-600">{formatBDT(dueAmount)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="pay-in">Payment Amount (BDT) *</Label>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs text-teal-600"
                onClick={() => setAmount(String(dueAmount))}
              >
                Pay Full Due ({formatBDT(dueAmount)})
              </Button>
            </div>
            <Input
              id="pay-in"
              type="number"
              step="any"
              min="1"
              max={dueAmount}
              placeholder={`e.g. ${dueAmount}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="method-sel">Payment Method *</Label>
            <Select
              value={method}
              onValueChange={(v) => setMethod(v as 'cash' | 'bank' | 'mobile_banking')}
            >
              <SelectTrigger id="method-sel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash in Office / Hand</SelectItem>
                <SelectItem value="mobile_banking">
                  Mobile Banking (bKash / Nagad / Rocket)
                </SelectItem>
                <SelectItem value="bank">Bank Deposit / Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="trx-id">Transaction ID / Slip #</Label>
            <Input
              id="trx-id"
              placeholder="e.g. 9X7AB2C or Cash Receipt #104"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pay-note">Note (Optional)</Label>
            <Input
              id="pay-note"
              placeholder="e.g. 50% advance received at office counter"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 border-t pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gap-2 bg-emerald-600 font-medium text-white hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Confirm Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
