import { useState } from 'react';
import { Search, Eye, Ticket, Phone, AlertTriangle, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BookingStatusBadge,
  PaymentStatusBadge,
} from '@/features/guest/components/BookingStatusBadge';
import { BookingCard } from '@/features/guest/components/BookingCard';
import { formatCurrency } from '@/lib/format';
import type { GuestBooking, BookingStatus } from '@/features/guest/types';

interface BookingsViewProps {
  bookings: GuestBooking[];
  onViewDetails: (booking: GuestBooking) => void;
  onViewTicket: (booking: GuestBooking) => void;
  onCancelRequest: (booking: GuestBooking) => void;
}

export function BookingsView({
  bookings,
  onViewDetails,
  onViewTicket,
  onCancelRequest,
}: BookingsViewProps) {
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');
  const [search, setSearch] = useState('');

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = filter === 'all' || b.bookingStatus === filter;
    const matchesSearch =
      b.destination.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.tourName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Filters and Search Bar */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="flex flex-col items-center justify-between gap-3 p-4 sm:flex-row">
          <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1 sm:w-auto sm:pb-0">
            {(['all', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'default' : 'outline'}
                size="sm"
                className="h-8 rounded-full px-3 text-xs capitalize"
                onClick={() => setFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destination or ID..."
              className="h-9 pl-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Bookings Display: Desktop Table & Mobile Cards */}
      {filteredBookings.length === 0 ? (
        <Card className="border-border bg-card border-dashed p-12 text-center">
          <Filter className="text-muted-foreground/30 mx-auto mb-3 size-10" />
          <h3 className="font-display text-base font-semibold">No Bookings Found</h3>
          <p className="text-muted-foreground mx-auto mt-1 mb-4 max-w-sm text-xs">
            No bookings match the selected status filter or search query.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFilter('all');
              setSearch('');
            }}
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <>
          {/* Desktop Table View (Hidden below laptop breakpoint) */}
          <div className="laptop:block border-border bg-card hidden overflow-hidden rounded-2xl border shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-border bg-muted/40 text-muted-foreground border-b text-[11px] font-semibold tracking-wider uppercase">
                  <tr>
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Destination</th>
                    <th className="p-4">Event Date</th>
                    <th className="p-4">Package</th>
                    <th className="p-4">Seat / Guests</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Paid</th>
                    <th className="p-4">Due</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-border divide-y">
                  {filteredBookings.map((b) => {
                    const departureDateStr = new Date(b.departureDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    });

                    return (
                      <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                        <td className="text-foreground p-4 font-mono font-semibold">{b.id}</td>
                        <td className="text-foreground p-4 font-medium">
                          <div>
                            <span className="block font-semibold">{b.destination}</span>
                            <span className="text-muted-foreground text-[11px]">{b.tourName}</span>
                          </div>
                        </td>
                        <td className="text-muted-foreground p-4">{departureDateStr}</td>
                        <td className="p-4 capitalize">
                          <span className="text-foreground font-medium">{b.packageName}</span>
                          <span className="text-muted-foreground block text-[11px]">
                            {b.duration}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-primary font-mono font-bold">
                            {b.seatNumbers.join(', ')}
                          </span>
                          <span className="text-muted-foreground block text-[11px]">
                            {b.guestCount} Guest(s)
                          </span>
                        </td>
                        <td className="text-foreground p-4 font-semibold">
                          {formatCurrency(b.totalAmount)}
                        </td>
                        <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(b.receivedAmount)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`font-semibold ${
                              b.dueAmount > 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatCurrency(b.dueAmount)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col items-start gap-1">
                            <BookingStatusBadge status={b.bookingStatus} />
                            <PaymentStatusBadge status={b.paymentStatus} />
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-foreground size-8"
                              title="View Details"
                              onClick={() => onViewDetails(b)}
                            >
                              <Eye className="size-4" />
                            </Button>

                            {b.bookingStatus !== 'cancelled' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-primary hover:text-primary-600 size-8"
                                title="Download Ticket"
                                onClick={() => onViewTicket(b)}
                              >
                                <Ticket className="size-4" />
                              </Button>
                            )}

                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              title="Contact Host"
                            >
                              <a
                                href={b.hostInfo.whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Phone className="size-4 text-emerald-600" />
                              </a>
                            </Button>

                            {b.bookingStatus === 'confirmed' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10 size-8"
                                title="Cancel Request"
                                onClick={() => onCancelRequest(b)}
                              >
                                <AlertTriangle className="size-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile & Tablet Card View (Hidden on laptop/desktop) */}
          <div className="laptop:hidden grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredBookings.map((b) => (
              <BookingCard
                key={b.id}
                booking={b}
                onViewDetails={onViewDetails}
                onViewTicket={onViewTicket}
                onCancelRequest={onCancelRequest}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
