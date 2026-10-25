import { useState, useEffect } from 'react';
import { PlusCircle, Loader2, UserCheck, DollarSign, AlertCircle, Armchair } from 'lucide-react';
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
import { apiClient, extractApiErrorMessage } from '@/lib/axios';
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

interface EventSeatStatus {
  seatNumber: string;
  status: 'available' | 'locked' | 'booked' | 'reserved' | 'blocked';
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
  const [seatNumbersStr, setSeatNumbersStr] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [pickupPoint, setPickupPoint] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Initial Payment
  const [collectedAmount, setCollectedAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'mobile_banking'>('cash');
  const [transactionId, setTransactionId] = useState('');

  // Live Seat Availability State
  const [seats, setSeats] = useState<EventSeatStatus[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);

  useEffect(() => {
    if (open) {
      void fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && eventId) {
      void fetchSeats(eventId);
    }
  }, [open, eventId]);

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
      setEvents([
        {
          _id: 'evt-coxsbazar-sep',
          eventCode: 'DEMO-COXS-01',
          tourTemplateId: { title: "Cox's Bazar Beach Tour" },
        },
      ]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchSeats = async (targetEventId: string) => {
    setLoadingSeats(true);
    try {
      const res = await apiClient.get<{
        success: boolean;
        data: EventSeatStatus[];
      }>(`/events/${targetEventId}/seats`);
      const seatList = res.data?.data || [];
      setSeats(seatList);

      // If seatNumbersStr is empty, suggest the first available seat
      setSeatNumbersStr((current) => {
        if (current.trim()) return current;
        const firstAvail = seatList.find((s) => s.status === 'available');
        return firstAvail ? firstAvail.seatNumber : '';
      });
    } catch {
      setSeats([]);
    } finally {
      setLoadingSeats(false);
    }
  };

  // Selected seat list from input string
  const selectedSeatList = seatNumbersStr
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  // Unavailable seats map
  const bookedSeatSet = new Set(
    seats.filter((s) => s.status !== 'available').map((s) => s.seatNumber.toUpperCase()),
  );

  const conflictedSeats = selectedSeatList.filter((s) => bookedSeatSet.has(s));
  const availableSeats = seats.filter((s) => s.status === 'available');

  const toggleSeatSelection = (seatCode: string) => {
    const code = seatCode.toUpperCase();
    if (selectedSeatList.includes(code)) {
      const updated = selectedSeatList.filter((s) => s !== code);
      setSeatNumbersStr(updated.join(', '));
    } else {
      const updated = [...selectedSeatList, code];
      setSeatNumbersStr(updated.join(', '));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) {
      toast.error('Customer name and phone number are required.');
      return;
    }

    if (selectedSeatList.length === 0) {
      toast.error('Please enter at least one seat number (e.g. A2, A3).');
      return;
    }

    if (conflictedSeats.length > 0) {
      toast.error(
        `Seat(s) ${conflictedSeats.join(', ')} are already booked or reserved! Please choose available seats.`,
      );
      return;
    }

    const initialAmount = Number.parseFloat(collectedAmount) || 0;

    setIsSubmitting(true);
    try {
      await apiClient.post('/admin/bookings/offline', {
        eventId,
        bookingType,
        seatNumbers: selectedSeatList,
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
      setSeatNumbersStr('');
    } catch (err: unknown) {
      toast.error(extractApiErrorMessage(err, 'Failed to create offline booking.'));
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

          {/* Seat Numbers & Realtime Availability */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="seats-input">Seat Numbers * (comma separated)</Label>
              {loadingSeats ? (
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Loader2 className="size-3 animate-spin" /> Checking seats...
                </span>
              ) : seats.length > 0 ? (
                <span className="text-muted-foreground text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {availableSeats.length} available
                  </span>
                  {' · '}
                  <span className="text-rose-500">{bookedSeatSet.size} booked</span>
                </span>
              ) : null}
            </div>

            <Input
              id="seats-input"
              placeholder="e.g. A2, A3, B1"
              value={seatNumbersStr}
              onChange={(e) => setSeatNumbersStr(e.target.value)}
              className={conflictedSeats.length > 0 ? 'border-rose-500 ring-rose-500' : ''}
              required
            />

            {/* Conflict Warning */}
            {conflictedSeats.length > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle className="size-4 shrink-0 text-rose-600" />
                <span>
                  <strong>Seat Conflict:</strong> Seat(s){' '}
                  <span className="font-bold underline">{conflictedSeats.join(', ')}</span> are
                  already booked/reserved! Please remove them and pick from the available seats.
                </span>
              </div>
            )}

            {/* Quick seat pick chips */}
            {availableSeats.length > 0 && (
              <div className="bg-muted/30 flex flex-col gap-1.5 rounded-lg border p-2.5">
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-medium">
                    <Armchair className="size-3.5 text-teal-600" /> Click to select available seats:
                  </span>
                  <span>{selectedSeatList.length} seat(s) selected</span>
                </div>
                <div className="flex max-h-24 flex-wrap gap-1.5 overflow-y-auto pt-1">
                  {availableSeats.slice(0, 24).map((s) => {
                    const isSelected = selectedSeatList.includes(s.seatNumber.toUpperCase());
                    return (
                      <button
                        key={s.seatNumber}
                        type="button"
                        onClick={() => toggleSeatSelection(s.seatNumber)}
                        className={`rounded px-2 py-0.5 text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-400'
                            : 'bg-background border text-slate-700 hover:border-teal-500 hover:text-teal-600 dark:text-slate-300'
                        }`}
                      >
                        {s.seatNumber}
                      </button>
                    );
                  })}
                  {availableSeats.length > 24 && (
                    <span className="text-muted-foreground self-center px-1 text-[11px]">
                      +{availableSeats.length - 24} more available
                    </span>
                  )}
                </div>
              </div>
            )}

            <p className="text-muted-foreground text-xs">
              One guest ticket will be created per seat selected.
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
              disabled={isSubmitting || conflictedSeats.length > 0}
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
