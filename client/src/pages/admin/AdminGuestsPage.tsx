import { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import { ADMIN_GUESTS } from '@/features/admin/data/guests';
import type { GuestAdmin } from '@/features/admin/types';
import { AdminPageHeader } from '@/features/admin/components/layout/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/shared/AdminToolbar';
import { DataTable, type DataTableColumn } from '@/features/admin/components/shared/DataTable';
import { GuestProfileDialog } from '@/features/admin/components/guests/GuestProfileDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AdminGuestsPage() {
  const [search, setSearch] = useState('');
  const [profileGuest, setProfileGuest] = useState<GuestAdmin | null>(null);

  const filtered = useMemo(
    () =>
      ADMIN_GUESTS.filter(
        (g) =>
          !search ||
          g.name.toLowerCase().includes(search.toLowerCase()) ||
          g.phone.includes(search),
      ),
    [search],
  );

  const columns: DataTableColumn<GuestAdmin>[] = [
    {
      key: 'guest',
      header: 'Guest',
      render: (g) => (
        <div>
          <p className="text-foreground font-medium">{g.name}</p>
          <p className="text-muted-foreground text-xs">{g.email}</p>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (g) => g.phone, hideOnMobile: true },
    {
      key: 'completed',
      header: 'Tours Completed',
      render: (g) => <Badge variant="secondary">{g.totalToursCompleted}</Badge>,
    },
    {
      key: 'upcoming',
      header: 'Upcoming',
      render: (g) => (
        <Badge variant={g.upcomingTourCount > 0 ? 'default' : 'muted'}>{g.upcomingTourCount}</Badge>
      ),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: '',
      render: (g) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`View ${g.name}'s profile`}
            onClick={() => setProfileGuest(g)}
          >
            <Eye className="size-4" />
          </Button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Guests"
        description="Guest list, travel history, and emergency contacts."
      />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search guests by name or phone..."
      />

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(g) => g.id}
        emptyTitle="No guests found"
      />

      <GuestProfileDialog
        guest={profileGuest}
        onOpenChange={(open) => !open && setProfileGuest(null)}
      />
    </div>
  );
}
