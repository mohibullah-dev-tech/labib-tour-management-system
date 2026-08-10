import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_BUSES } from '@/features/admin/data/buses';
import type { BusAdmin, BusStatus } from '@/features/admin/types';
import { AdminPageHeader } from '@/features/admin/components/layout/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/shared/AdminToolbar';
import { DataTable, type DataTableColumn } from '@/features/admin/components/shared/DataTable';
import { StatusBadge } from '@/features/admin/components/shared/StatusBadge';
import { ConfirmDialog } from '@/features/admin/components/shared/ConfirmDialog';
import { BusFormDialog, type BusFormValues } from '@/features/admin/components/buses/BusFormDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const STATUS_VARIANT: Record<BusStatus, 'success' | 'warning' | 'muted'> = {
  active: 'success',
  maintenance: 'warning',
  inactive: 'muted',
};

export function AdminBusesPage() {
  const [buses, setBuses] = useState<BusAdmin[]>(ADMIN_BUSES);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingBus, setEditingBus] = useState<BusAdmin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BusAdmin | null>(null);

  const filtered = useMemo(
    () =>
      buses.filter(
        (b) =>
          !search ||
          b.busNumber.toLowerCase().includes(search.toLowerCase()) ||
          b.driverName.toLowerCase().includes(search.toLowerCase()),
      ),
    [buses, search],
  );

  const handleSave = (values: BusFormValues) => {
    if (editingBus) {
      setBuses((prev) => prev.map((b) => (b.id === editingBus.id ? { ...b, ...values } : b)));
      toast.success('Bus updated');
    } else {
      setBuses((prev) => [{ id: `abus-${Date.now()}`, ...values }, ...prev]);
      toast.success('Bus created');
    }
    setEditingBus(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setBuses((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    toast.success('Bus deleted');
    setDeleteTarget(null);
  };

  const columns: DataTableColumn<BusAdmin>[] = [
    {
      key: 'bus',
      header: 'Bus',
      render: (b) => (
        <div>
          <p className="text-foreground font-medium">{b.busNumber}</p>
          <p className="text-muted-foreground text-xs">{b.busType}</p>
        </div>
      ),
    },
    {
      key: 'ac',
      header: 'Type',
      render: (b) => (
        <Badge variant={b.acType === 'AC' ? 'default' : 'secondary'}>{b.acType}</Badge>
      ),
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (b) => `${b.seatCapacity} seats`,
      hideOnMobile: true,
    },
    {
      key: 'driver',
      header: 'Driver',
      render: (b) => `${b.driverName} (${b.driverPhone})`,
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (b) => <StatusBadge label={b.status} variant={STATUS_VARIANT[b.status]} />,
    },
    {
      key: 'actions',
      header: '',
      render: (b) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${b.busNumber}`}
            onClick={() => {
              setEditingBus(b);
              setFormOpen(true);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${b.busNumber}`}
            onClick={() => setDeleteTarget(b)}
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
        title="Buses"
        description="Fleet management — each event is assigned exactly one bus."
        actions={
          <Button
            className="gap-2"
            onClick={() => {
              setEditingBus(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Create Bus
          </Button>
        }
      />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search buses or drivers..."
      />

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(b) => b.id}
        emptyTitle="No buses found"
      />

      <BusFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingBus={editingBus}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this bus?"
        description={`"${deleteTarget?.busNumber}" will be permanently removed. Make sure no upcoming events depend on it.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
