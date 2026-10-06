import { useState } from 'react';
import { Search, Phone, Eye, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckInBadge } from '@/features/host/components/CheckInBadge';
import type { HostGuest, CheckInStatus } from '@/features/host/types';

interface GuestListViewProps {
  guests: HostGuest[];
  onSelectGuest: (guest: HostGuest) => void;
  onUpdateCheckIn: (guestId: string, status: CheckInStatus) => void;
}

export function GuestListView({ guests, onSelectGuest, onUpdateCheckIn }: GuestListViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CheckInStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'partial' | 'due'>('all');
  const [pickupFilter, setPickupFilter] = useState<string>('all');

  // Extract unique pickup locations for filtering
  const pickupLocations = Array.from(new Set(guests.map((g) => g.pickupPoint)));

  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.fullName.toLowerCase().includes(search.toLowerCase()) ||
      g.phone.includes(search) ||
      g.bookingId.toLowerCase().includes(search.toLowerCase()) ||
      g.seatNumbers.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      g.emergencyContact.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || g.checkInStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || g.paymentStatus === paymentFilter;
    const matchesPickup = pickupFilter === 'all' || g.pickupPoint === pickupFilter;

    return matchesSearch && matchesStatus && matchesPayment && matchesPickup;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* Header and Filter Controls */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-foreground text-base font-bold sm:text-lg">
                Passenger Manifest ({filteredGuests.length} of {guests.length})
              </h3>
              <p className="text-muted-foreground text-xs">
                Filtered view of booked travelers with contact info, seat allocations, and payment
                balances.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <Input
                placeholder="Search name, phone, seat, booking ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8 text-xs"
              />
            </div>
          </div>

          {/* Filter Pills / Dropdowns */}
          <div className="border-border grid grid-cols-2 gap-2 border-t pt-2 sm:grid-cols-4">
            {/* Check-In Status */}
            <div>
              <Select
                value={statusFilter}
                onValueChange={(val: 'all' | CheckInStatus) => setStatusFilter(val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Check-In Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Check-In Statuses</SelectItem>
                  <SelectItem value="checked-in">Checked In</SelectItem>
                  <SelectItem value="not-checked-in">Not Checked In</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status */}
            <div>
              <Select
                value={paymentFilter}
                onValueChange={(val: 'all' | 'paid' | 'partial' | 'due') => setPaymentFilter(val)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Full Paid</SelectItem>
                  <SelectItem value="partial">Partial Paid</SelectItem>
                  <SelectItem value="due">Due Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Pickup Point */}
            <div>
              <Select value={pickupFilter} onValueChange={(val: string) => setPickupFilter(val)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Pickup Point" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pickup Terminals</SelectItem>
                  {pickupLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc.split(',')[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters */}
            <div>
              {(statusFilter !== 'all' ||
                paymentFilter !== 'all' ||
                pickupFilter !== 'all' ||
                search) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-8 w-full text-xs"
                  onClick={() => {
                    setStatusFilter('all');
                    setPaymentFilter('all');
                    setPickupFilter('all');
                    setSearch('');
                  }}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop View: Comprehensive Data Table */}
      <div className="laptop:block border-border bg-card hidden overflow-hidden rounded-2xl border shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-border text-muted-foreground border-b text-[10px] font-bold tracking-wider uppercase">
              <tr>
                <th className="px-4 py-3.5">Seat(s)</th>
                <th className="px-4 py-3.5">Passenger Name</th>
                <th className="px-4 py-3.5">Phone / Contact</th>
                <th className="px-4 py-3.5">Booking Ref</th>
                <th className="px-4 py-3.5">Pickup Point</th>
                <th className="px-4 py-3.5">Package</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5">Check-In</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-border divide-y">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-muted-foreground py-12 text-center">
                    No passengers matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => (
                  <tr
                    key={guest.id}
                    className="hover:bg-muted/30 group cursor-pointer transition-colors"
                    onClick={() => onSelectGuest(guest)}
                  >
                    <td className="text-foreground px-4 py-3.5 font-mono font-bold">
                      <span className="bg-primary/10 text-primary border-primary/20 rounded-md border px-2 py-1">
                        {guest.seatNumbers.join(', ')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-foreground block font-bold">{guest.fullName}</span>
                      <span className="text-muted-foreground block text-[10px]">
                        {guest.personCount} Person{guest.personCount > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <a
                        href={`tel:${guest.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-foreground hover:text-primary flex items-center gap-1 font-medium transition-colors"
                      >
                        <Phone className="text-muted-foreground size-3" />
                        <span>{guest.phone}</span>
                      </a>
                    </td>
                    <td className="text-muted-foreground px-4 py-3.5 font-mono text-[11px]">
                      {guest.bookingId}
                    </td>
                    <td
                      className="text-muted-foreground max-w-[160px] truncate px-4 py-3.5"
                      title={guest.pickupPoint}
                    >
                      {guest.pickupPoint}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-foreground block font-medium">{guest.packageName}</span>
                      <span className="text-muted-foreground font-mono text-[10px] uppercase">
                        Tier: {guest.packageTier}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {guest.paymentStatus === 'paid' ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-700"
                        >
                          Paid
                        </Badge>
                      ) : guest.paymentStatus === 'partial' ? (
                        <Badge
                          variant="outline"
                          className="border-amber-500/40 bg-amber-500/10 text-[10px] text-amber-700"
                        >
                          Due ৳{guest.dueAmount}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-rose-500/40 bg-rose-500/10 text-[10px] text-rose-700"
                        >
                          Due ৳{guest.dueAmount}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <CheckInBadge status={guest.checkInStatus} size="sm" />
                    </td>
                    <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant={guest.checkInStatus === 'checked-in' ? 'default' : 'outline'}
                          className={`h-7 gap-1 px-2 text-[11px] ${
                            guest.checkInStatus === 'checked-in'
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : ''
                          }`}
                          onClick={() =>
                            onUpdateCheckIn(
                              guest.id,
                              guest.checkInStatus === 'checked-in'
                                ? 'not-checked-in'
                                : 'checked-in',
                            )
                          }
                        >
                          <CheckCircle2 className="size-3" />
                          <span>
                            {guest.checkInStatus === 'checked-in' ? 'Checked' : 'Check In'}
                          </span>
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground size-7"
                          onClick={() => onSelectGuest(guest)}
                          title="View guest details"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View: Touch-Friendly Passenger Cards */}
      <div className="laptop:hidden flex flex-col gap-3">
        {filteredGuests.length === 0 ? (
          <Card className="text-muted-foreground p-8 text-center text-xs">
            No passengers matching your criteria.
          </Card>
        ) : (
          filteredGuests.map((guest) => (
            <Card
              key={guest.id}
              className="border-border bg-card flex flex-col gap-3 p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="bg-primary/10 border-primary/20 flex size-9 shrink-0 flex-col items-center justify-center rounded-xl border">
                    <span className="text-primary text-[9px] leading-tight font-bold uppercase">
                      Seat
                    </span>
                    <span className="text-foreground font-mono text-xs font-black">
                      {guest.seatNumbers.join(',')}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-foreground text-sm font-bold">{guest.fullName}</h4>
                    <span className="text-muted-foreground block font-mono text-[10px]">
                      Ref: {guest.bookingId} • {guest.personCount} Person
                      {guest.personCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <CheckInBadge status={guest.checkInStatus} size="sm" />
              </div>

              {/* Contact & Pickup Details */}
              <div className="bg-muted/30 border-border grid grid-cols-2 gap-2 rounded-xl border p-2.5 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Phone Number</span>
                  <a
                    href={`tel:${guest.phone}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {guest.phone}
                  </a>
                </div>

                <div>
                  <span className="text-muted-foreground block text-[10px]">Payment</span>
                  <span
                    className={`font-semibold ${guest.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}
                  >
                    {guest.dueAmount > 0 ? `Due: ৳${guest.dueAmount}` : 'Full Paid'}
                  </span>
                </div>

                <div className="border-border col-span-2 border-t pt-1">
                  <span className="text-muted-foreground block text-[10px]">Pickup Station</span>
                  <span className="text-foreground font-medium">{guest.pickupPoint}</span>
                </div>
              </div>

              {/* Special Notes Preview if present */}
              {guest.specialNotes && (
                <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 text-[11px] text-amber-700 dark:text-amber-400">
                  <strong>Note:</strong> {guest.specialNotes}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  className={`h-8 flex-1 gap-1.5 text-xs ${
                    guest.checkInStatus === 'checked-in'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : ''
                  }`}
                  variant={guest.checkInStatus === 'checked-in' ? 'default' : 'outline'}
                  onClick={() =>
                    onUpdateCheckIn(
                      guest.id,
                      guest.checkInStatus === 'checked-in' ? 'not-checked-in' : 'checked-in',
                    )
                  }
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>{guest.checkInStatus === 'checked-in' ? 'Checked In' : 'Check In'}</span>
                </Button>

                <Button asChild variant="outline" size="sm" className="h-8 gap-1 text-xs">
                  <a href={`tel:${guest.phone}`}>
                    <Phone className="text-primary size-3" />
                    <span>Call</span>
                  </a>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => onSelectGuest(guest)}
                >
                  Details
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
