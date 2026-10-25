import { useEffect, useMemo, useState } from 'react';
import { Eye, Edit3, X, DollarSign, PlusCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_BOOKINGS } from '@/features/admin/data/bookings';
import type { BookingAdmin, AdminBookingStatus, AdminPaymentStatus } from '@/features/admin/types';
import { AdminPageHeader } from '@/features/admin/components/layout/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/shared/AdminToolbar';
import { DataTable, type DataTableColumn } from '@/features/admin/components/shared/DataTable';
import { StatusBadge } from '@/features/admin/components/shared/StatusBadge';
import { ConfirmDialog } from '@/features/admin/components/shared/ConfirmDialog';
import { BookingDetailDialog } from '@/features/admin/components/bookings/BookingDetailDialog';
import { NewOfflineBookingDialog } from '@/features/admin/components/bookings/NewOfflineBookingDialog';
import {
  EditBookingDialog,
  type BookingToEdit,
} from '@/features/admin/components/bookings/EditBookingDialog';
import { AddPaymentDialog } from '@/features/admin/components/bookings/AddPaymentDialog';
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
import { apiClient } from '@/lib/axios';

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

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingAdmin[]>(ADMIN_BOOKINGS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<AdminBookingStatus | 'all'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<AdminPaymentStatus | 'all'>('all');

  // Modals State
  const [detailBooking, setDetailBooking] = useState<BookingAdmin | null>(null);
  const [editTarget, setEditTarget] = useState<BookingToEdit | null>(null);
  const [paymentTarget, setPaymentTarget] = useState<BookingAdmin | null>(null);
  const [cancelTarget, setCancelTarget] = useState<BookingAdmin | null>(null);
  const [showNewOffline, setShowNewOffline] = useState(false);

  useEffect(() => {
    void fetchLiveBookings();
  }, []);

  const fetchLiveBookings = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{ success: boolean; data: Array<Record<string, unknown>> }>(
        '/admin/bookings',
      );
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const mapped: BookingAdmin[] = (res.data.data as Array<Record<string, unknown>>).map(
          (b: Record<string, unknown>) => ({
            id: String(b._id),
            bookingCode: String(b.bookingCode || ''),
            guestName:
              (b.guestDetails as Array<{ name?: string }>)?.[0]?.name ||
              (b.customerId as { name?: string })?.name ||
              'Guest Traveler',
            guestPhone:
              (b.guestDetails as Array<{ phone?: string }>)?.[0]?.phone ||
              (b.customerId as { phone?: string })?.phone ||
              'N/A',
            guestEmail:
              (b.guestDetails as Array<{ email?: string }>)?.[0]?.email ||
              (b.customerId as { email?: string })?.email,
            eventId: String((b.eventId as { _id?: string })?._id || b.eventId || 'evt-demo'),
            eventName:
              (b.tourTemplateId as { title?: string })?.title ||
              (b.eventId as { eventCode?: string })?.eventCode ||
              'Tour Trip',
            packageName: `${String(b.bookingType || 'STANDARD').toUpperCase()} Package`,
            seatIds: (b.seatNumbers as string[]) || [],
            totalAmountBDT: Number(b.totalAmount || 0) || 0,
            receivedAmountBDT: Number(b.receivedAmount || 0) || 0,
            bookingStatus:
              b.bookingStatus === 'confirmed'
                ? 'approved'
                : (b.bookingStatus as AdminBookingStatus),
            paymentStatus: (b.paymentStatus as AdminPaymentStatus) || 'unpaid',
            createdAt: String(b.createdAt || new Date().toISOString()),
            pickupPoint: b.pickupPoint as string | undefined,
            specialNotes: b.specialNotes as string | undefined,
          }),
        );
        setBookings(mapped);
      }
    } catch {
      // Keep existing data on error
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(
    () =>
      bookings.filter((b) => {
        if (bookingStatusFilter !== 'all' && b.bookingStatus !== bookingStatusFilter) return false;
        if (paymentStatusFilter !== 'all' && b.paymentStatus !== paymentStatusFilter) return false;
        if (
          search &&
          !b.guestName.toLowerCase().includes(search.toLowerCase()) &&
          !String(b.bookingCode || '')
            .toLowerCase()
            .includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [bookings, search, bookingStatusFilter, paymentStatusFilter],
  );

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      await apiClient.patch(`/admin/bookings/${cancelTarget.id}`, {
        bookingStatus: 'cancelled',
      });
      toast.success(`${cancelTarget.bookingCode} cancelled successfully`);
      void fetchLiveBookings();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        'Failed to cancel booking.';
      toast.error(msg);
    } finally {
      setCancelTarget(null);
    }
  };

  const columns: DataTableColumn<BookingAdmin>[] = [
    {
      key: 'booking',
      header: 'Booking',
      render: (b) => (
        <div>
          <p className="text-foreground font-semibold">{String(b.bookingCode || '')}</p>
          <p className="text-muted-foreground text-xs">
            {b.guestName} ({b.guestPhone})
          </p>
        </div>
      ),
    },
    { key: 'event', header: 'Event', render: (b) => b.eventName, hideOnMobile: true },
    {
      key: 'seats',
      header: 'Seats',
      render: (b) => (
        <span className="bg-muted rounded px-2 py-0.5 font-mono text-xs font-semibold">
          {b.seatIds.join(', ')}
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (b) => {
        const due = Math.max(0, b.totalAmountBDT - b.receivedAmountBDT);
        return (
          <div className="text-xs">
            <p className="text-foreground font-medium">{formatBDT(b.totalAmountBDT)}</p>
            <p className={due > 0 ? 'font-semibold text-amber-600' : 'text-emerald-600'}>
              {due > 0 ? `Due ${formatBDT(due)}` : 'Fully Paid'}
            </p>
          </div>
        );
      },
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
            <TooltipContent>View details & download ticket/receipt</TooltipContent>
          </Tooltip>

          {/* Edit / Customize Booking */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Customize"
                onClick={() =>
                  setEditTarget({
                    id: b.id,
                    bookingCode: String(b.bookingCode || ''),
                    guestName: b.guestName,
                    guestPhone: b.guestPhone,
                    guestEmail: b.guestEmail,
                    seatNumbers: b.seatIds,
                    bookingStatus: b.bookingStatus,
                    pickupPoint: b.pickupPoint as string | undefined,
                    specialNotes: b.specialNotes as string | undefined,
                  })
                }
              >
                <Edit3 className="size-4 text-teal-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Customize / Reallocate Seats</TooltipContent>
          </Tooltip>

          {/* Add Payment */}
          {b.paymentStatus !== 'paid' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Record payment"
                  onClick={() => setPaymentTarget(b)}
                >
                  <DollarSign className="size-4 text-emerald-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Record Cash/Bank Payment</TooltipContent>
            </Tooltip>
          )}

          {/* Cancel Booking */}
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
        description="Search, customize seats, record offline payments, and manage reservations."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={fetchLiveBookings}
              disabled={loading}
            >
              <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-teal-600 font-medium text-white hover:bg-teal-700"
              onClick={() => setShowNewOffline(true)}
            >
              <PlusCircle className="size-4" />+ New Offline Booking
            </Button>
          </div>
        }
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

      {/* Details & PDF Download Dialog */}
      <BookingDetailDialog
        booking={detailBooking}
        onOpenChange={(open) => !open && setDetailBooking(null)}
      />

      {/* New Offline Booking Dialog */}
      <NewOfflineBookingDialog
        open={showNewOffline}
        onOpenChange={setShowNewOffline}
        onBookingCreated={fetchLiveBookings}
      />

      {/* Edit / Customize Dialog */}
      <EditBookingDialog
        booking={editTarget}
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onBookingUpdated={fetchLiveBookings}
      />

      {/* Add Payment Dialog */}
      <AddPaymentDialog
        booking={paymentTarget}
        open={!!paymentTarget}
        onOpenChange={(open) => !open && setPaymentTarget(null)}
        onPaymentRecorded={fetchLiveBookings}
      />

      {/* Cancel Confirmation */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => !open && setCancelTarget(null)}
        title="Cancel this booking?"
        description={`${cancelTarget?.bookingCode} for ${cancelTarget?.guestName} will be cancelled and the seats will be released.`}
        confirmLabel="Cancel Booking"
        variant="destructive"
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}
