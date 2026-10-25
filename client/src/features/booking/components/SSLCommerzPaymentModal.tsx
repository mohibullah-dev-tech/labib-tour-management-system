import { useState } from 'react';
import { CreditCard, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { formatBDT } from '@/lib/format';
import { paymentService } from '@/features/booking/services/payment.service';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/lib/axios';

export interface SSLCommerzPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingCode: string;
  totalAmount: number;
  minimumAdvance?: number;
  receivedAmount?: number;
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
}

export function SSLCommerzPaymentModal({
  open,
  onOpenChange,
  bookingCode,
  totalAmount,
  minimumAdvance = Math.ceil(totalAmount * 0.3),
  receivedAmount = 0,
  guestName,
  guestPhone,
  guestEmail,
}: SSLCommerzPaymentModalProps) {
  const dueAmount = Math.max(0, totalAmount - receivedAmount);
  const remainingAdvance = Math.max(0, minimumAdvance - receivedAmount);

  const [paymentOption, setPaymentOption] = useState<'advance' | 'full'>(
    remainingAdvance > 0 ? 'advance' : 'full',
  );
  const [isInitiating, setIsInitiating] = useState(false);

  const payableAmount =
    paymentOption === 'advance' ? (remainingAdvance > 0 ? remainingAdvance : dueAmount) : dueAmount;

  const handlePay = async () => {
    setIsInitiating(true);
    try {
      const result = await paymentService.initiateSSLCommerzPayment({
        bookingId: bookingCode,
        amount: payableAmount,
        paymentType: paymentOption,
        cusName: guestName,
        cusPhone: guestPhone,
        cusEmail: guestEmail,
      });

      if (result?.gatewayUrl) {
        toast.info('Redirecting to SSLCommerz secure checkout...');
        window.location.href = result.gatewayUrl;
      } else {
        toast.error('Unable to establish payment session. Please try again.');
      }
    } catch (err: unknown) {
      toast.error(extractApiErrorMessage(err, 'Payment initiation failed.'));
    } finally {
      setIsInitiating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <CreditCard className="size-5" />
            <DialogTitle>Pay Online via SSLCommerz</DialogTitle>
          </div>
          <DialogDescription>
            Secure instant payment with bKash, Nagad, Rocket, Cards & Internet Banking.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Booking Summary Box */}
          <div className="bg-muted/30 flex flex-col gap-1.5 rounded-lg border p-3 text-sm">
            <div className="text-muted-foreground flex justify-between">
              <span>Booking Reference:</span>
              <span className="text-foreground font-semibold">{bookingCode}</span>
            </div>
            <div className="text-muted-foreground flex justify-between">
              <span>Total Package Cost:</span>
              <span className="text-foreground font-medium">{formatBDT(totalAmount)}</span>
            </div>
            {receivedAmount > 0 && (
              <div className="text-muted-foreground flex justify-between">
                <span>Already Paid:</span>
                <span className="font-medium text-emerald-600">{formatBDT(receivedAmount)}</span>
              </div>
            )}
            <div className="text-foreground flex justify-between border-t pt-1.5 font-medium">
              <span>Total Due:</span>
              <span className="font-bold text-teal-600">{formatBDT(dueAmount)}</span>
            </div>
          </div>

          {/* Payment Type Selection */}
          <div className="flex flex-col gap-2">
            <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Choose Payment Amount
            </Label>
            <div className="flex flex-col gap-2">
              {remainingAdvance > 0 && (
                <button
                  type="button"
                  onClick={() => setPaymentOption('advance')}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                    paymentOption === 'advance'
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
                      : 'hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-4 items-center justify-center rounded-full border ${
                        paymentOption === 'advance'
                          ? 'border-teal-600 bg-teal-600 text-white'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {paymentOption === 'advance' && (
                        <div className="size-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-foreground font-medium">Minimum Advance (30%)</p>
                      <p className="text-muted-foreground text-xs">
                        Confirms seat reservation immediately
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-teal-700 dark:text-teal-400">
                    {formatBDT(remainingAdvance)}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setPaymentOption('full')}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                  paymentOption === 'full'
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
                    : 'hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-4 items-center justify-center rounded-full border ${
                      paymentOption === 'full'
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {paymentOption === 'full' && <div className="size-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Full Payment (100%)</p>
                    <p className="text-muted-foreground text-xs">Clears all dues for this trip</p>
                  </div>
                </div>
                <span className="font-bold text-teal-700 dark:text-teal-400">
                  {formatBDT(dueAmount)}
                </span>
              </button>
            </div>
          </div>

          {/* Supported Methods Badge List */}
          <div className="bg-muted/40 text-muted-foreground flex flex-col gap-1.5 rounded-md p-2.5 text-xs">
            <div className="text-foreground flex items-center gap-1 font-medium">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>Supported Payment Channels (SSLCommerz)</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="bg-background rounded border px-1.5 py-0.5 text-[11px] font-semibold text-pink-600">
                bKash
              </span>
              <span className="bg-background rounded border px-1.5 py-0.5 text-[11px] font-semibold text-orange-600">
                Nagad
              </span>
              <span className="bg-background rounded border px-1.5 py-0.5 text-[11px] font-semibold text-purple-600">
                Rocket
              </span>
              <span className="bg-background rounded border px-1.5 py-0.5 text-[11px] font-semibold text-blue-600">
                Visa / Mastercard
              </span>
              <span className="bg-background rounded border px-1.5 py-0.5 text-[11px]">
                Internet Banking
              </span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            className="w-full gap-2 bg-teal-600 py-5 font-semibold text-white hover:bg-teal-700"
            disabled={isInitiating || payableAmount <= 0}
            onClick={handlePay}
          >
            {isInitiating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            Proceed to Pay {formatBDT(payableAmount)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
