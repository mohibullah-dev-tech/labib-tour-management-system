import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { ShieldCheck, CreditCard, Smartphone, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatBDT } from '@/lib/format';
import { paymentService } from '@/features/booking/services/payment.service';
import { toast } from 'sonner';

export function PaymentSimulationPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const bookingCode = params.get('bookingCode') || 'LTMS-DEMO';
  const tranId = params.get('tranId') || `SIM-${Date.now()}`;
  const amount = Number.parseFloat(params.get('amount') || '1950');

  const [selectedMethod, setSelectedMethod] = useState<'bKash' | 'Nagad' | 'Visa' | 'Mastercard'>(
    'bKash',
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulateSuccess = async () => {
    setIsProcessing(true);
    try {
      const res = await paymentService.simulatePayment({
        bookingCode,
        amount,
        method: selectedMethod,
        tranId,
      });
      toast.success('Payment simulated successfully!');
      if (res?.redirectUrl) {
        window.location.href = res.redirectUrl;
      } else {
        navigate(
          `/booking/payment-result?status=success&bookingCode=${bookingCode}&tranId=${tranId}&amount=${amount}`,
        );
      }
    } catch {
      toast.error('Simulation failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleSimulateCancel = () => {
    navigate(`/booking/payment-result?status=cancelled&bookingCode=${bookingCode}`);
  };

  return (
    <div className="bg-muted/20 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-teal-500/30 shadow-lg">
        <CardHeader className="rounded-t-lg bg-teal-600 pb-4 text-white">
          <div className="flex items-center justify-between">
            <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-semibold tracking-wider uppercase">
              SSLCommerz Sandbox Simulator
            </span>
            <ShieldCheck className="size-5" />
          </div>
          <CardTitle className="pt-2 text-xl">Labib Tour Payment Gateway</CardTitle>
          <CardDescription className="text-xs text-teal-100">
            Official SSLCommerz local test simulation environment.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 pt-5">
          <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Booking ID</p>
              <p className="text-foreground font-bold">{bookingCode}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs">Payable Amount</p>
              <p className="text-base font-bold text-teal-700 dark:text-teal-400">
                {formatBDT(amount)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-xs font-semibold uppercase">
              Select Test Payment Channel
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={selectedMethod === 'bKash' ? 'default' : 'outline'}
                className={`h-11 justify-start gap-2 ${
                  selectedMethod === 'bKash' ? 'bg-pink-600 text-white hover:bg-pink-700' : ''
                }`}
                onClick={() => setSelectedMethod('bKash')}
              >
                <Smartphone className="size-4" />
                bKash
              </Button>

              <Button
                type="button"
                variant={selectedMethod === 'Nagad' ? 'default' : 'outline'}
                className={`h-11 justify-start gap-2 ${
                  selectedMethod === 'Nagad' ? 'bg-orange-600 text-white hover:bg-orange-700' : ''
                }`}
                onClick={() => setSelectedMethod('Nagad')}
              >
                <Smartphone className="size-4" />
                Nagad
              </Button>

              <Button
                type="button"
                variant={selectedMethod === 'Visa' ? 'default' : 'outline'}
                className={`h-11 justify-start gap-2 ${
                  selectedMethod === 'Visa' ? 'bg-blue-600 text-white hover:bg-blue-700' : ''
                }`}
                onClick={() => setSelectedMethod('Visa')}
              >
                <CreditCard className="size-4" />
                Visa Card
              </Button>

              <Button
                type="button"
                variant={selectedMethod === 'Mastercard' ? 'default' : 'outline'}
                className={`h-11 justify-start gap-2 ${
                  selectedMethod === 'Mastercard'
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : ''
                }`}
                onClick={() => setSelectedMethod('Mastercard')}
              >
                <CreditCard className="size-4" />
                Mastercard
              </Button>
            </div>
          </div>

          <div className="rounded border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            Note: In production with live SSLCommerz Store ID, customers are automatically
            redirected to the official SSLCommerz hosted payment page.
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="gap-2 bg-emerald-600 py-5 font-semibold text-white hover:bg-emerald-700"
              disabled={isProcessing}
              onClick={handleSimulateSuccess}
            >
              {isProcessing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle className="size-4" />
              )}
              Confirm & Simulate Paid ({formatBDT(amount)})
            </Button>

            <Button
              variant="outline"
              className="text-destructive hover:bg-destructive/10 gap-2"
              disabled={isProcessing}
              onClick={handleSimulateCancel}
            >
              <XCircle className="size-4" />
              Cancel Payment Simulation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
