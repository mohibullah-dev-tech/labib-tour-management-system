import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Phone, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_HOSTS } from '@/features/admin/data/hosts';
import type { HostAdmin, HostAvailability } from '@/features/admin/types';
import { AdminPageHeader } from '@/features/admin/components/layout/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/shared/AdminToolbar';
import { DataTable, type DataTableColumn } from '@/features/admin/components/shared/DataTable';
import { StatusBadge } from '@/features/admin/components/shared/StatusBadge';
import { ConfirmDialog } from '@/features/admin/components/shared/ConfirmDialog';
import {
  HostFormDialog,
  type HostFormValues,
} from '@/features/admin/components/hosts/HostFormDialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const AVAILABILITY_VARIANT: Record<HostAvailability, 'success' | 'default' | 'muted'> = {
  available: 'success',
  assigned: 'default',
  unavailable: 'muted',
};

export function AdminHostsPage() {
  const [hosts, setHosts] = useState<HostAdmin[]>(ADMIN_HOSTS);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingHost, setEditingHost] = useState<HostAdmin | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HostAdmin | null>(null);

  const filtered = useMemo(
    () => hosts.filter((h) => !search || h.name.toLowerCase().includes(search.toLowerCase())),
    [hosts, search],
  );

  const handleSave = (values: HostFormValues) => {
    if (editingHost) {
      setHosts((prev) => prev.map((h) => (h.id === editingHost.id ? { ...h, ...values } : h)));
      toast.success('Host updated');
    } else {
      setHosts((prev) => [
        { id: `ahost-${Date.now()}`, ...values, assignedEventCount: 0 },
        ...prev,
      ]);
      toast.success('Host created');
    }
    setEditingHost(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setHosts((prev) => prev.filter((h) => h.id !== deleteTarget.id));
    toast.success('Host removed');
    setDeleteTarget(null);
  };

  const columns: DataTableColumn<HostAdmin>[] = [
    {
      key: 'host',
      header: 'Host',
      render: (h) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={h.photo} alt="" />
            <AvatarFallback>
              {h.name
                .split(' ')
                .map((p) => p[0])
                .slice(0, 2)
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-foreground font-medium">{h.name}</p>
            <p className="text-muted-foreground text-xs">{h.experienceYears} years experience</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      hideOnMobile: true,
      render: (h) => (
        <div className="text-muted-foreground flex items-center gap-3 text-xs">
          <a href={`tel:${h.phone}`} className="hover:text-primary flex items-center gap-1">
            <Phone className="size-3.5" />
            {h.phone}
          </a>
          <a
            href={h.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary flex items-center gap-1"
          >
            <MessageCircle className="size-3.5" />
            WhatsApp
          </a>
        </div>
      ),
    },
    {
      key: 'assigned',
      header: 'Assigned Events',
      render: (h) => h.assignedEventCount,
      hideOnMobile: true,
    },
    {
      key: 'availability',
      header: 'Availability',
      render: (h) => (
        <StatusBadge label={h.availability} variant={AVAILABILITY_VARIANT[h.availability]} />
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (h) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${h.name}`}
            onClick={() => {
              setEditingHost(h);
              setFormOpen(true);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Remove ${h.name}`}
            onClick={() => setDeleteTarget(h)}
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
        title="Hosts"
        description="Tour hosts — contact info, experience, and event assignments."
        actions={
          <Button
            className="gap-2"
            onClick={() => {
              setEditingHost(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            Create Host
          </Button>
        }
      />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search hosts..."
      />

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(h) => h.id}
        emptyTitle="No hosts found"
      />

      <HostFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingHost={editingHost}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove this host?"
        description={`"${deleteTarget?.name}" will be removed. Make sure they aren't assigned to any upcoming events.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
