import { useState, useEffect } from 'react';
import { PlusCircle, Loader2, UserCheck, DollarSign } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/axios';
import { toast } from 'sonner';

export interface NewOfflineBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingCreated: () => void;
}

interface TourEventItem {
  _id: string;
  eventCode: string;
  tourTemplateId?: { title?: string; destination?: string };
}

export function NewOfflineBookingDialog({
  open,
  onOpenChange,
  onBookingCreated,
}: NewOfflineBookingDialogProps) {
  const [events, setEvents] = useState<TourEventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [eventId, setEventId] = useState('');
  const [bookingType, setBookingType] = useState<'single' | 'couple' | 'premium' | 'vip'>('single');
  const [seatNumbersStr, setSeatNumbersStr] = useState('A1');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [pickupPoint, setPickupPoint] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Initial Payment
  const [collectedAmount, setCollectedAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'mobile_banking'>('cash');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (open) {
      void fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: TourEventItem[] | { items: TourEventItem[] };
      }>('/events');
      const items = Array.isArray(res.data.data)
        ? res.data.data
        : (res.data.data as { items?: TourEventItem[] })?.items || [];
      setEvents(items);
      if (items.length > 0 && !eventId) {
        setEventId(items[0]._id);
      }
    } catch {
      // fallback default
      setEvents([
        {
          _id: 'evt-coxsbazar-sep',
          eventCode: 'DEMO-COXS-01',
          tourTemplateId: { title: "Cox's Bazar Beach Tour" },
        },
        {
          _id: 'evt-sajek-sep',
          eventCode: 'DEMO-SAJEK-01',
          tourTemplateId: { title: 'Sajek Valley Tour' },
        },
      ]);
      setEventId('evt-coxsbazar-sep');
    } finally {
      setLoadingEvents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      toast.error('Customer name and phone number are required.');
      return;
    }

    const seatNumbers = seatNumbersStr
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (seatNumbers.length === 0) {
      toast.error('Please enter at least one seat number (e.g. A1, A2).');
      return;
    }

    const initialAmount = Number.parseFloat(collectedAmount) || 0;

    setIsSubmitting(true);
    try {
      await apiClient.post('/admin/bookings/offline', {
        eventId,
        bookingType,
        seatNumbers,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim() || undefined,
        pickupPoint: pickupPoint.trim() || undefined,
        specialNotes: specialNotes.trim() || undefined,
        initialPayment:
          initialAmount > 0
            ? {
                amount: initialAmount,
                method: paymentMethod,
                transactionId: transactionId.trim() || undefined,
                note: `Initial offline payment via ${paymentMethod}`,
              }
            : undefined,
      });

      toast.success('Offline booking created successfully!');
      onBookingCreated();
      onOpenChange(false);
      // Reset form
      setGuestName('');
      setGuestPhone('');
      setGuestEmail('');
      setCollectedAmount('0');
      setTransactionId('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to create offline booking.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <PlusCircle className="size-5" />
            <DialogTitle>New Offline / Walk-in Booking</DialogTitle>
          </div>
          <DialogDescription>
            Record direct phone, WhatsApp, or office walk-in reservations with cash or bank payment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2 text-sm">
          {/* Tour Event & Package */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="evt-select">Tour Event *</Label>
              <Select value={eventId} onValueChange={setEventId} disabled={loadingEvents}>
                <SelectTrigger id="evt-select">
                  <SelectValue placeholder={loadingEvents ? 'Loading tours...' : 'Select event'} />
                </SelectTrigger>
                <SelectContent>
                  {events.map((ev) => (
                    <SelectItem key={ev._id} value={ev._id}>
                      {ev.tourTemplateId?.title || ev.eventCode} ({ev.eventCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pkg-select">Package Tier</Label>
              <Select
                value={bookingType}
                onValueChange={(v) => setBookingType(v as 'single' | 'couple' | 'premium' | 'vip')}
              >
                <SelectTrigger id="pkg-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Package</SelectItem>
                  <SelectItem value="couple">Couple Package</SelectItem>
                  <SelectItem value="premium">Premium Package</SelectItem>
                  <SelectItem value="vip">VIP Package</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Seat Numbers */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="seats-input">Seat Numbers * (comma separated)</Label>
            <Input
              id="seats-input"
              placeholder="e.g. A1, A2, B1"
              value={seatNumbersStr}
              onChange={(e) => setSeatNumbersStr(e.target.value)}
              required
            />
            <p className="text-muted-foreground text-xs">
              Comma-separated seat codes. One guest slot will be allocated per seat.
            </p>
          </div>

          {/* Guest Information */}
          <div className="bg-muted/20 flex flex-col gap-3 rounded-lg border p-3.5">
            <div className="text-foreground flex items-center gap-1.5 font-semibold">
              <UserCheck className="size-4 text-teal-600" />
              <span>Customer / Guest Details</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="guest-name">Full Name *</Label>
                <Input
                  id="guest-name"
                  placeholder="e.g. Mohammad Rahim"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="guest-phone">Phone Number *</Label>
                <Input
                  id="guest-phone"
                  placeholder="e.g. 01712345678"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="guest-email">Email (Optional)</Label>
                <Input
                  id="guest-email"
                  type="email"
                  placeholder="guest@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="pickup-point">Pickup Point (Optional)</Label>
                <Input
                  id="pickup-point"
                  placeholder="e.g. Sayedabad Counter"
                  value={pickupPoint}
                  onChange={(e) => setPickupPoint(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Initial Payment Collection */}
          <div className="flex flex-col gap-3 rounded-lg border border-teal-200 bg-teal-50/40 p-3.5 dark:border-teal-900/60 dark:bg-teal-950/20">
            <div className="text-foreground flex items-center gap-1.5 font-semibold">
              <DollarSign className="size-4 text-emerald-600" />
              <span>Initial Payment Collection (Optional)</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="pay-amount">Amount Collected (BDT)</Label>
                <Input
                  id="pay-amount"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={collectedAmount}
                  onChange={(e) => setCollectedAmount(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="pay-method">Payment Method</Label>
                <Select
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as 'cash' | 'bank' | 'mobile_banking')}
                >
                  <SelectTrigger id="pay-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash in Hand</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="mobile_banking">Mobile Banking (bKash/Nagad)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="pay-trx">TrxID / Reference</Label>
                <Input
                  id="pay-trx"
                  placeholder="Receipt # or TrxID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Special Notes */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="notes">Notes / Special Instructions</Label>
            <Textarea
              id="notes"
              placeholder="e.g. Customer requested window seat, vegetarian meals..."
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
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
              className="gap-2 bg-teal-600 font-medium text-white hover:bg-teal-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <PlusCircle className="size-4" />
              )}
              Create Offline Booking
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
