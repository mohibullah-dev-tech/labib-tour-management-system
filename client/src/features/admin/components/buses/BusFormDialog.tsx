import { useEffect, useState } from 'react';
import type { BusAdmin, BusStatus } from '@/features/admin/types';
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

export interface BusFormValues {
  busNumber: string;
  busType: string;
  acType: 'AC' | 'Non-AC';
  seatCapacity: number;
  driverName: string;
  driverPhone: string;
  helperName: string;
  status: BusStatus;
}

export interface BusFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingBus: BusAdmin | null;
  onSave: (values: BusFormValues) => void;
}

const EMPTY_VALUES: BusFormValues = {
  busNumber: '',
  busType: 'Coaster',
  acType: 'AC',
  seatCapacity: 45,
  driverName: '',
  driverPhone: '',
  helperName: '',
  status: 'active',
};

function BusFormDialog({ open, onOpenChange, editingBus, onSave }: BusFormDialogProps) {
  const [values, setValues] = useState<BusFormValues>(EMPTY_VALUES);

  useEffect(() => {
    if (editingBus) {
      setValues({ ...editingBus });
    } else if (open) {
      setValues(EMPTY_VALUES);
    }
  }, [editingBus, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingBus ? 'Edit Bus' : 'Create Bus'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bus-number">Bus Number</Label>
            <Input
              id="bus-number"
              value={values.busNumber}
              onChange={(e) => setValues((v) => ({ ...v, busNumber: e.target.value }))}
              placeholder="e.g. Hanif-01"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bus-type">Bus Type</Label>
              <Input
                id="bus-type"
                value={values.busType}
                onChange={(e) => setValues((v) => ({ ...v, busType: e.target.value }))}
                placeholder="Coaster / Coach"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bus-ac">AC / Non-AC</Label>
              <Select
                value={values.acType}
                onValueChange={(v) => setValues((s) => ({ ...s, acType: v as 'AC' | 'Non-AC' }))}
              >
                <SelectTrigger id="bus-ac">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AC">AC</SelectItem>
                  <SelectItem value="Non-AC">Non-AC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bus-capacity">Seat Capacity</Label>
              <Input
                id="bus-capacity"
                type="number"
                min={1}
                value={values.seatCapacity}
                onChange={(e) => setValues((v) => ({ ...v, seatCapacity: Number(e.target.value) }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bus-status">Status</Label>
              <Select
                value={values.status}
                onValueChange={(v) => setValues((s) => ({ ...s, status: v as BusStatus }))}
              >
                <SelectTrigger id="bus-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bus-driver">Driver Name</Label>
            <Input
              id="bus-driver"
              value={values.driverName}
              onChange={(e) => setValues((v) => ({ ...v, driverName: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bus-driver-phone">Driver Phone</Label>
            <Input
              id="bus-driver-phone"
              type="tel"
              value={values.driverPhone}
              onChange={(e) => setValues((v) => ({ ...v, driverPhone: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bus-helper">Helper Name</Label>
            <Input
              id="bus-helper"
              value={values.helperName}
              onChange={(e) => setValues((v) => ({ ...v, helperName: e.target.value }))}
            />
          </div>

          <p className="border-border bg-muted/40 text-muted-foreground rounded-md border border-dashed p-3 text-xs">
            Seat Layout uses the standard 45-seat A–J + K arrangement (see the Booking module's Seat
            Map) — a dedicated custom-layout editor is a future increment.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!values.busNumber || !values.driverName}
            onClick={() => {
              onSave(values);
              onOpenChange(false);
            }}
          >
            {editingBus ? 'Save Changes' : 'Create Bus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { BusFormDialog };
