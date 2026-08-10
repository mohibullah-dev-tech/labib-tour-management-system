import { useEffect, useState } from 'react';
import type { TourEventAdmin, AdminEventStatus } from '@/features/admin/types';
import { TOUR_TEMPLATES } from '@/features/admin/data/templates';
import { ADMIN_BUSES } from '@/features/admin/data/buses';
import { ADMIN_HOSTS } from '@/features/admin/data/hosts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface EventFormValues {
  templateId: string;
  departureDate: string;
  busId: string;
  hostId: string;
  capacity: number;
  bookingOpensAt: string;
  bookingClosesAt: string;
  status: AdminEventStatus;
}

export interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingEvent: TourEventAdmin | null;
  onSave: (values: EventFormValues) => void;
}

const EMPTY_VALUES: EventFormValues = {
  templateId: '',
  departureDate: '',
  busId: '',
  hostId: '',
  capacity: 45,
  bookingOpensAt: '',
  bookingClosesAt: '',
  status: 'draft',
};

/** Create/Edit form for a Tour Event — created FROM a template, per the brief, with its own bus, host, and booking window. */
function EventFormDialog({ open, onOpenChange, editingEvent, onSave }: EventFormDialogProps) {
  const [values, setValues] = useState<EventFormValues>(EMPTY_VALUES);

  useEffect(() => {
    if (editingEvent) {
      setValues({
        templateId: editingEvent.templateId,
        departureDate: editingEvent.departureDate,
        busId: editingEvent.busId,
        hostId: editingEvent.hostId,
        capacity: editingEvent.capacity,
        bookingOpensAt: editingEvent.bookingOpensAt,
        bookingClosesAt: editingEvent.bookingClosesAt,
        status: editingEvent.status,
      });
    } else if (open) {
      setValues(EMPTY_VALUES);
    }
  }, [editingEvent, open]);

  const isValid = values.templateId && values.departureDate && values.busId && values.hostId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? 'Edit Tour Event' : 'Create Event from Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="evt-template">Tour Template</Label>
            <Select
              value={values.templateId}
              onValueChange={(v) => setValues((s) => ({ ...s, templateId: v }))}
            >
              <SelectTrigger id="evt-template">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {TOUR_TEMPLATES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="evt-departure">Departure Date</Label>
              <Input
                id="evt-departure"
                type="date"
                value={values.departureDate}
                onChange={(e) => setValues((s) => ({ ...s, departureDate: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="evt-capacity">Capacity</Label>
              <Input
                id="evt-capacity"
                type="number"
                min={1}
                value={values.capacity}
                onChange={(e) => setValues((s) => ({ ...s, capacity: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="evt-bus">Bus</Label>
              <Select
                value={values.busId}
                onValueChange={(v) => setValues((s) => ({ ...s, busId: v }))}
              >
                <SelectTrigger id="evt-bus">
                  <SelectValue placeholder="Select a bus" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_BUSES.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.busNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="evt-host">Host</Label>
              <Select
                value={values.hostId}
                onValueChange={(v) => setValues((s) => ({ ...s, hostId: v }))}
              >
                <SelectTrigger id="evt-host">
                  <SelectValue placeholder="Select a host" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_HOSTS.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="evt-opens">Booking Opens</Label>
              <Input
                id="evt-opens"
                type="date"
                value={values.bookingOpensAt}
                onChange={(e) => setValues((s) => ({ ...s, bookingOpensAt: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="evt-closes">Booking Closes</Label>
              <Input
                id="evt-closes"
                type="date"
                value={values.bookingClosesAt}
                onChange={(e) => setValues((s) => ({ ...s, bookingClosesAt: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="evt-status">Status</Label>
            <Select
              value={values.status}
              onValueChange={(v) => setValues((s) => ({ ...s, status: v as AdminEventStatus }))}
            >
              <SelectTrigger id="evt-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="booking-open">Booking Open</SelectItem>
                <SelectItem value="booking-closed">Booking Closed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!isValid}
            onClick={() => {
              onSave(values);
              onOpenChange(false);
            }}
          >
            {editingEvent ? 'Save Changes' : 'Create Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { EventFormDialog };
