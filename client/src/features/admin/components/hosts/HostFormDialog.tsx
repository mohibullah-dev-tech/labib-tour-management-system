import { useEffect, useState } from 'react';
import type { HostAdmin, HostAvailability } from '@/features/admin/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface HostFormValues {
  name: string;
  photo: string;
  phone: string;
  whatsapp: string;
  experienceYears: number;
  availability: HostAvailability;
  bio: string;
}

export interface HostFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingHost: HostAdmin | null;
  onSave: (values: HostFormValues) => void;
}

const EMPTY_VALUES: HostFormValues = {
  name: '',
  photo: '',
  phone: '',
  whatsapp: '',
  experienceYears: 1,
  availability: 'available',
  bio: '',
};

function HostFormDialog({ open, onOpenChange, editingHost, onSave }: HostFormDialogProps) {
  const [values, setValues] = useState<HostFormValues>(EMPTY_VALUES);

  useEffect(() => {
    if (editingHost) {
      setValues({
        name: editingHost.name,
        photo: editingHost.photo,
        phone: editingHost.phone,
        whatsapp: editingHost.whatsapp,
        experienceYears: editingHost.experienceYears,
        availability: editingHost.availability,
        bio: '',
      });
    } else if (open) {
      setValues(EMPTY_VALUES);
    }
  }, [editingHost, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingHost ? 'Edit Host' : 'Create Host'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="host-name">Full Name</Label>
            <Input
              id="host-name"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="host-photo">Photo URL</Label>
            <Input
              id="host-photo"
              value={values.photo}
              onChange={(e) => setValues((v) => ({ ...v, photo: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="host-phone">Phone</Label>
              <Input
                id="host-phone"
                type="tel"
                value={values.phone}
                onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="host-whatsapp">WhatsApp Link</Label>
              <Input
                id="host-whatsapp"
                value={values.whatsapp}
                onChange={(e) => setValues((v) => ({ ...v, whatsapp: e.target.value }))}
                placeholder="https://wa.me/..."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="host-exp">Experience (Years)</Label>
              <Input
                id="host-exp"
                type="number"
                min={0}
                value={values.experienceYears}
                onChange={(e) =>
                  setValues((v) => ({ ...v, experienceYears: Number(e.target.value) }))
                }
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="host-avail">Availability</Label>
              <Select
                value={values.availability}
                onValueChange={(v) =>
                  setValues((s) => ({ ...s, availability: v as HostAvailability }))
                }
              >
                <SelectTrigger id="host-avail">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="host-bio">Short Bio</Label>
            <Textarea
              id="host-bio"
              value={values.bio}
              onChange={(e) => setValues((v) => ({ ...v, bio: e.target.value }))}
              placeholder="A short intro guests will see on the Tour Details page"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!values.name || !values.phone}
            onClick={() => {
              onSave(values);
              onOpenChange(false);
            }}
          >
            {editingHost ? 'Save Changes' : 'Create Host'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { HostFormDialog };
