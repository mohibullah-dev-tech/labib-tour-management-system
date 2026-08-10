import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_EVENTS } from '@/features/admin/data/events';
import { TOUR_TEMPLATES } from '@/features/admin/data/templates';
import { ADMIN_BUSES } from '@/features/admin/data/buses';
import { ADMIN_HOSTS } from '@/features/admin/data/hosts';
import type { TourEventAdmin, AdminEventStatus } from '@/features/admin/types';
import { AdminPageHeader } from '@/features/admin/components/layout/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/shared/AdminToolbar';
import { DataTable, type DataTableColumn } from '@/features/admin/components/shared/DataTable';
import { StatusBadge } from '@/features/admin/components/shared/StatusBadge';
import { ConfirmDialog } from '@/features/admin/components/shared/ConfirmDialog';
import {
  EventFormDialog,
  type EventFormValues,
} from '@/features/admin/components/events/EventFormDialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/lib/format';

const STATUS_VARIANT: Record<
  AdminEventStatus,
  'success' | 'muted' | 'warning' | 'default' | 'destructive'
> = {
  draft: 'muted',
  'booking-open': 'success',
  'booking-closed': 'warning',
  completed: 'default',
  cancelled: 'destructive',
};

export function AdminEventsPage() {
  const [events, setEvents] = useState<TourEventAdmin[]>(ADMIN_EVENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminEventStatus | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TourEventAdmin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TourEventAdmin | null>(null);

  const filtered = useMemo(
    () =>
      events.filter((e) => {
        if (statusFilter !== 'all' && e.status !== statusFilter) return false;
        if (
          search &&
          !e.templateName.toLowerCase().includes(search.toLowerCase()) &&
          !e.destination.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [events, search, statusFilter],
  );

  const handleSave = (values: EventFormValues) => {
    const template = TOUR_TEMPLATES.find((t) => t.id === values.templateId);
    const bus = ADMIN_BUSES.find((b) => b.id === values.busId);
    const host = ADMIN_HOSTS.find((h) => h.id === values.hostId);
    if (!template || !bus || !host) return;

    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === editingEvent.id
            ? {
                ...e,
                ...values,
                templateName: template.name,
                destination: template.destination,
                busName: bus.busNumber,
                hostName: host.name,
              }
            : e,
        ),
      );
      toast.success('Event updated');
    } else {
      const newEvent: TourEventAdmin = {
        id: `aevt-${Date.now()}`,
        ...values,
        templateName: template.name,
        destination: template.destination,
        busName: bus.busNumber,
        hostName: host.name,
        bookedSeats: 0,
      };
      setEvents((prev) => [newEvent, ...prev]);
      toast.success('Event created');
    }
    setEditingEvent(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    toast.success('Event deleted');
    setDeleteTarget(null);
  };

  const columns: DataTableColumn<TourEventAdmin>[] = [
    {
      key: 'event',
      header: 'Event',
      render: (e) => (
        <div>
          <p className="text-foreground font-medium">{e.templateName}</p>
          <p className="text-muted-foreground text-xs">{e.destination}</p>
        </div>
      ),
    },
    { key: 'departure', header: 'Departure', render: (e) => formatDate(e.departureDate) },
    { key: 'bus', header: 'Bus', render: (e) => e.busName, hideOnMobile: true },
    { key: 'host', header: 'Host', render: (e) => e.hostName, hideOnMobile: true },
    {
      key: 'capacity',
      header: 'Seats',
      render: (e) => `${e.bookedSeats} / ${e.capacity}`,
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (e) => (
        <StatusBadge label={e.status.replace('-', ' ')} variant={STATUS_VARIANT[e.status]} />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (e) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${e.templateName}`}
            onClick={() => {
              setEditingEvent(e);
              setFormOpen(true);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${e.templateName}`}
            onClick={() => setDeleteTarget(e)}
          >
            <Trash2 className="text-destructive size-4" />
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Tour Events"
        description="Scheduled departures created from a Tour Template — bus, host, capacity, and booking window."
        actions={
          <Button
            className="gap-2"
            onClick={() => {
              setEditingEvent(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            New Event
          </Button>
        }
      />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search events..."
      >
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as AdminEventStatus | 'all')}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="booking-open">Booking Open</SelectItem>
            <SelectItem value="booking-closed">Booking Closed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </AdminToolbar>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(e) => e.id}
        emptyTitle="No events found"
      />

      <EventFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingEvent={editingEvent}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this event?"
        description={`"${deleteTarget?.templateName}" on ${deleteTarget ? formatDate(deleteTarget.departureDate) : ''} will be permanently removed.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
