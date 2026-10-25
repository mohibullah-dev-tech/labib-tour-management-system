import { useState, useEffect } from 'react';
import { Edit3, Loader2 } from 'lucide-react';
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

export interface BookingToEdit {
  id: string;
  bookingCode: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  seatNumbers: string[];
  bookingStatus: 'pending' | 'approved' | 'confirmed' | 'completed' | 'cancelled';
  pickupPoint?: string;
  specialNotes?: string;
}

export interface EditBookingDialogProps {
  booking: BookingToEdit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingUpdated: () => void;
}

export function EditBookingDialog({
  booking,
  open,
  onOpenChange,
  onBookingUpdated,
}: EditBookingDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [seatNumbersStr, setSeatNumbersStr] = useState('');
  const [bookingStatus, setBookingStatus] = useState<string>('confirmed');
  const [pickupPoint, setPickupPoint] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  useEffect(() => {
    if (booking) {
      setGuestName(booking.guestName || '');
      setGuestPhone(booking.guestPhone || '');
      setGuestEmail(booking.guestEmail || '');
      setSeatNumbersStr(booking.seatNumbers ? booking.seatNumbers.join(', ') : '');
      const rawStatus = booking.bookingStatus === 'approved' ? 'confirmed' : booking.bookingStatus;
      setBookingStatus(rawStatus || 'confirmed');
      setPickupPoint(booking.pickupPoint || '');
      setSpecialNotes(booking.specialNotes || '');
    }
  }, [booking]);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const seatNumbers = seatNumbersStr
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (seatNumbers.length === 0) {
      toast.error('At least one seat number is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.patch(`/admin/bookings/${booking.id}`, {
        guestName: guestName.trim() || undefined,
        guestPhone: guestPhone.trim() || undefined,
        guestEmail: guestEmail.trim() || undefined,
        seatNumbers,
        bookingStatus,
        pickupPoint: pickupPoint.trim() || undefined,
        specialNotes: specialNotes.trim() || undefined,
      });

      toast.success(`Booking ${booking.bookingCode} updated successfully!`);
      onBookingUpdated();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to update booking.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
            <Edit3 className="size-5" />
            <DialogTitle>Customize / Edit Booking: {booking.bookingCode}</DialogTitle>
          </div>
          <DialogDescription>
            Change seat allocations, passenger contact details, or booking status.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2 text-sm">
          {/* Seats Allocation */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-seats">Allocated Seat Numbers * (comma separated)</Label>
            <Input
              id="edit-seats"
              value={seatNumbersStr}
              onChange={(e) => setSeatNumbersStr(e.target.value)}
              placeholder="e.g. A1, A2"
              required
            />
            <p className="text-muted-foreground text-xs">
              Editing seats will immediately release unassigned seats and allocate new ones.
            </p>
          </div>

          {/* Booking Status */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status-select">Booking Status</Label>
            <Select value={bookingStatus} onValueChange={setBookingStatus}>
              <SelectTrigger id="status-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Guest Information */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-name">Customer Name</Label>
              <Input
                id="edit-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="edit-pickup">Pickup Point</Label>
              <Input
                id="edit-pickup"
                value={pickupPoint}
                onChange={(e) => setPickupPoint(e.target.value)}
              />
            </div>
          </div>

          {/* Special Notes */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea
              id="edit-notes"
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
                <Edit3 className="size-4" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
