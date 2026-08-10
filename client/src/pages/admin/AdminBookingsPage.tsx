import { useMemo, useState } from 'react';
import { Eye, Check, X, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_BOOKINGS } from '@/features/admin/data/bookings';
import type { BookingAdmin, AdminBookingStatus, AdminPaymentStatus } from '@/features/admin/types';
import { AdminPageHeader } from '@/features/admin/components/layout/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/shared/AdminToolbar';
import { DataTable, type DataTableColumn } from '@/features/admin/components/shared/DataTable';
import { StatusBadge } from '@/features/admin/components/shared/StatusBadge';
import { ConfirmDialog } from '@/features/admin/components/shared/ConfirmDialog';
import { BookingDetailDialog } from '@/features/admin/components/bookings/BookingDetailDialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatBDT } from '@/lib/format';

const BOOKING_STATUS_VARIANT: Record<
  AdminBookingStatus,
  'warning' | 'success' | 'destructive' | 'default'
> = {
  pending: 'warning',
  approved: 'success',
  cancelled: 'destructive',
  completed: 'default',
};

const PAYMENT_STATUS_VARIANT: Record<AdminPaymentStatus, 'destructive' | 'warning' | 'success'> = {
  unpaid: 'destructive',
  partial: 'warning',
  paid: 'success',
};

/**
 * Search, Filter, Approve, Cancel, Mark Paid, Print Ticket, Download
 * PDF, Guest Details — every action from the brief's Booking Management
 * list. Approve/Cancel/Mark Paid mutate local state + a toast (no
 * backend); Print/Download are placeholders inside BookingDetailDialog.
 */
export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingAdmin[]>(ADMIN_BOOKINGS);
  const [search, setSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<AdminBookingStatus | 'all'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<AdminPaymentStatus | 'all'>('all');
  const [detailBooking, setDetailBooking] = useState<BookingAdmin | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingAdmin | null>(null);

  const filtered = useMemo(
    () =>
      bookings.filter((b) => {
        if (bookingStatusFilter !== 'all' && b.bookingStatus !== bookingStatusFilter) return false;
        if (paymentStatusFilter !== 'all' && b.paymentStatus !== paymentStatusFilter) return false;
        if (
          search &&
          !b.guestName.toLowerCase().includes(search.toLowerCase()) &&
          !b.bookingCode.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [bookings, search, bookingStatusFilter, paymentStatusFilter],
  );

  const updateBooking = (id: string, patch: Partial<BookingAdmin>) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const handleApprove = (booking: BookingAdmin) => {
    updateBooking(booking.id, { bookingStatus: 'approved' });
    toast.success(`${booking.bookingCode} approved`);
  };

  const handleMarkPaid = (booking: BookingAdmin) => {
    updateBooking(booking.id, { paymentStatus: 'paid', receivedAmountBDT: booking.totalAmountBDT });
    toast.success(`${booking.bookingCode} marked as paid`);
  };

  const handleCancel = () => {
    if (!cancelTarget) return;
    updateBooking(cancelTarget.id, { bookingStatus: 'cancelled' });
    toast.success(`${cancelTarget.bookingCode} cancelled`);
    setCancelTarget(null);
  };

  const columns: DataTableColumn<BookingAdmin>[] = [
    {
      key: 'booking',
      header: 'Booking',
      render: (b) => (
        <div>
          <p className="text-foreground font-medium">{b.bookingCode}</p>
          <p className="text-muted-foreground text-xs">{b.guestName}</p>
        </div>
      ),
    },
    { key: 'event', header: 'Event', render: (b) => b.eventName, hideOnMobile: true },
    { key: 'seats', header: 'Seats', render: (b) => b.seatIds.join(', '), hideOnMobile: true },
    {
      key: 'amount',
      header: 'Amount',
      render: (b) => (
        <div className="text-xs">
          <p className="text-foreground font-medium">{formatBDT(b.totalAmountBDT)}</p>
          <p className="text-muted-foreground">
            Due {formatBDT(b.totalAmountBDT - b.receivedAmountBDT)}
          </p>
        </div>
      ),
    },
    {
      key: 'booking-status',
      header: 'Status',
      render: (b) => (
        <StatusBadge label={b.bookingStatus} variant={BOOKING_STATUS_VARIANT[b.bookingStatus]} />
      ),
    },
    {
      key: 'payment-status',
      header: 'Payment',
      render: (b) => (
        <StatusBadge label={b.paymentStatus} variant={PAYMENT_STATUS_VARIANT[b.paymentStatus]} />
      ),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: '',
      render: (b) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="View details"
                onClick={() => setDetailBooking(b)}
              >
                <Eye className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View details</TooltipContent>
          </Tooltip>
          {b.bookingStatus === 'pending' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Approve"
                  onClick={() => handleApprove(b)}
                >
                  <Check className="text-success-600 size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Approve booking</TooltipContent>
            </Tooltip>
          )}
          {b.paymentStatus !== 'paid' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Mark paid"
                  onClick={() => handleMarkPaid(b)}
                >
                  <Wallet className="text-primary size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Mark paid</TooltipContent>
            </Tooltip>
          )}
          {b.bookingStatus !== 'cancelled' && b.bookingStatus !== 'completed' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Cancel"
                  onClick={() => setCancelTarget(b)}
                >
                  <X className="text-destructive size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cancel booking</TooltipContent>
            </Tooltip>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Bookings"
        description="Search, approve, cancel, and track payment for every booking."
      />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by guest or booking code..."
      >
        <Select
          value={bookingStatusFilter}
          onValueChange={(v) => setBookingStatusFilter(v as AdminBookingStatus | 'all')}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={paymentStatusFilter}
          onValueChange={(v) => setPaymentStatusFilter(v as AdminPaymentStatus | 'all')}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All payments</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </AdminToolbar>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(b) => b.id}
        emptyTitle="No bookings found"
      />

      <BookingDetailDialog
        booking={detailBooking}
        onOpenChange={(open) => !open && setDetailBooking(null)}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel this booking?"
        description={`${cancelTarget?.bookingCode} for ${cancelTarget?.guestName} will be marked as cancelled.`}
        confirmLabel="Cancel Booking"
        variant="destructive"
        onConfirm={handleCancel}
      />
    </div>
  );
}
