import {
  Phone,
  MessageCircle,
  MessageSquare,
  MapPin,
  User,
  ShieldAlert,
  CreditCard,
  Ticket,
  CheckCircle2,
  UserX,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckInBadge } from './CheckInBadge';
import { formatCurrency } from '@/lib/format';
import type { HostGuest, CheckInStatus } from '@/features/host/types';

interface GuestDetailsModalProps {
  guest: HostGuest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateCheckIn: (guestId: string, status: CheckInStatus) => void;
  onOpenMessage?: (guest: HostGuest) => void;
}

export function GuestDetailsModal({
  guest,
  open,
  onOpenChange,
  onUpdateCheckIn,
  onOpenMessage,
}: GuestDetailsModalProps) {
  if (!guest) return null;

  const rawPhone = guest.phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${rawPhone.startsWith('88') ? rawPhone : `88${rawPhone}`}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg gap-5 overflow-y-auto p-5 sm:p-6">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-primary font-mono text-xs font-semibold tracking-wider uppercase">
              {guest.bookingId}
            </span>
            <CheckInBadge status={guest.checkInStatus} />
          </div>
          <DialogTitle className="font-display mt-1 text-xl sm:text-2xl">
            {guest.fullName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Assigned seats:{' '}
            <strong className="text-foreground">{guest.seatNumbers.join(', ')}</strong> (
            {guest.personCount} passenger{guest.personCount > 1 ? 's' : ''})
          </DialogDescription>
        </DialogHeader>

        {/* Quick Communication Bar */}
        <div className="grid grid-cols-3 gap-2 py-1">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-primary/20 hover:bg-primary/5 hover:text-primary h-9 w-full gap-1.5 text-xs"
          >
            <a href={`tel:${guest.phone}`}>
              <Phone className="text-primary size-3.5" />
              <span>Call</span>
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 w-full gap-1.5 border-emerald-500/30 text-xs text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          </Button>

          {onOpenMessage && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-full gap-1.5 text-xs"
              onClick={() => {
                onOpenChange(false);
                onOpenMessage(guest);
              }}
            >
              <MessageSquare className="size-3.5" />
              <span>Chat</span>
            </Button>
          )}
        </div>

        {/* Detail Breakdown Cards */}
        <div className="flex flex-col gap-3.5 text-xs">
          {/* Passenger & Pickup */}
          <div className="border-border bg-card flex flex-col gap-2.5 rounded-xl border p-3.5">
            <div className="flex items-start gap-2">
              <User className="text-primary mt-0.5 size-3.5 shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[11px]">Primary Contact</span>
                <span className="text-foreground font-medium">{guest.phone}</span>
                {guest.email && (
                  <span className="text-muted-foreground block text-[11px]">{guest.email}</span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="text-primary mt-0.5 size-3.5 shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[11px]">Pickup Location</span>
                <span className="text-foreground font-semibold">{guest.pickupPoint}</span>
                <span className="text-muted-foreground mt-0.5 block text-[11px]">
                  {guest.address}
                </span>
              </div>
            </div>
          </div>

          {/* Package & Payment */}
          <div className="border-border bg-card grid grid-cols-2 gap-3 rounded-xl border p-3.5">
            <div className="flex items-start gap-2">
              <Ticket className="text-primary mt-0.5 size-3.5 shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[11px]">Tour Package</span>
                <span className="text-foreground font-medium">{guest.packageName}</span>
                <span className="text-muted-foreground block font-mono text-[10px] uppercase">
                  Tier: {guest.packageTier}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CreditCard className="text-primary mt-0.5 size-3.5 shrink-0" />
              <div>
                <span className="text-muted-foreground block text-[11px]">Payment Status</span>
                <span className="text-foreground font-semibold capitalize">
                  {guest.paymentStatus}
                </span>
                {guest.dueAmount > 0 ? (
                  <span className="block text-[11px] font-bold text-rose-600 dark:text-rose-400">
                    Due: {formatCurrency(guest.dueAmount)}
                  </span>
                ) : (
                  <span className="block text-[11px] text-emerald-600 dark:text-emerald-400">
                    Full Paid ({formatCurrency(guest.totalAmount)})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Emergency & Special Notes */}
          <div className="border-border bg-card flex flex-col gap-2.5 rounded-xl border p-3.5">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
              <div>
                <span className="text-muted-foreground block text-[11px]">Emergency Contact</span>
                <span className="text-foreground font-medium">{guest.emergencyContact}</span>
              </div>
            </div>

            {guest.specialNotes && (
              <div className="text-foreground rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-xs">
                <span className="mb-0.5 block text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  Special Passenger Notes:
                </span>
                <p className="text-[11px] leading-relaxed">{guest.specialNotes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Check-In Controls */}
        <DialogFooter className="border-border flex flex-col items-stretch justify-between gap-2 border-t pt-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={guest.checkInStatus === 'checked-in' ? 'default' : 'outline'}
              size="sm"
              className={`gap-1.5 ${guest.checkInStatus === 'checked-in' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              onClick={() => onUpdateCheckIn(guest.id, 'checked-in')}
            >
              <CheckCircle2 className="size-3.5" />
              <span>{guest.checkInStatus === 'checked-in' ? 'Checked-In' : 'Mark Checked-In'}</span>
            </Button>

            <Button
              type="button"
              variant={guest.checkInStatus === 'absent' ? 'destructive' : 'outline'}
              size="sm"
              className="gap-1.5"
              onClick={() => onUpdateCheckIn(guest.id, 'absent')}
            >
              <UserX className="size-3.5" />
              <span>{guest.checkInStatus === 'absent' ? 'Flagged Absent' : 'Mark Absent'}</span>
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
