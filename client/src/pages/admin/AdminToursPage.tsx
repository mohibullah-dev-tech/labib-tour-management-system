import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { TOUR_TEMPLATES } from '@/features/admin/data/templates';
import type { TourTemplate, TemplateStatus } from '@/features/admin/types';
import { TOUR_CATEGORY_LABELS } from '@/features/tours/types';
import { AdminPageHeader } from '@/features/admin/components/layout/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/shared/AdminToolbar';
import { DataTable, type DataTableColumn } from '@/features/admin/components/shared/DataTable';
import { StatusBadge } from '@/features/admin/components/shared/StatusBadge';
import { ConfirmDialog } from '@/features/admin/components/shared/ConfirmDialog';
import {
  TemplateFormSheet,
  type TemplateFormValues,
} from '@/features/admin/components/templates/TemplateFormSheet';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';

const STATUS_VARIANT: Record<TemplateStatus, 'success' | 'muted' | 'warning'> = {
  published: 'success',
  draft: 'warning',
  archived: 'muted',
};

/**
 * Full CRUD list for Tour Templates. State lives in this page (useState
 * over the mock array) — once a backend exists, this becomes a
 * TanStack Query `useTourTemplates()` + mutation hooks, and only the
 * data-fetching lines change, not the table/form below them.
 */
export function AdminToursPage() {
  const [templates, setTemplates] = useState<TourTemplate[]>(TOUR_TEMPLATES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TourTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TourTemplate | null>(null);

  const filtered = useMemo(
    () =>
      templates.filter((t) => {
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (
          search &&
          !t.name.toLowerCase().includes(search.toLowerCase()) &&
          !t.destination.toLowerCase().includes(search.toLowerCase())
        )
          return false;
        return true;
      }),
    [templates, search, statusFilter],
  );

  const handleSave = (values: TemplateFormValues) => {
    if (editingTemplate) {
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? { ...t, ...values, updatedAt: new Date().toISOString() }
            : t,
        ),
      );
      toast.success('Template updated');
    } else {
      const newTemplate: TourTemplate = {
        id: `tpl-${Date.now()}`,
        ...values,
        foodMenuCount: 0,
        includesCount: values.includes.length,
        excludesCount: values.excludes.length,
        placesCount: values.places.length,
        routeStopCount: 0,
        galleryCount: 0,
        updatedAt: new Date().toISOString(),
      };
      setTemplates((prev) => [newTemplate, ...prev]);
      toast.success('Template created');
    }
    setEditingTemplate(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    toast.success('Template deleted');
    setDeleteTarget(null);
  };

  const columns: DataTableColumn<TourTemplate>[] = [
    {
      key: 'name',
      header: 'Template',
      render: (t) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-10 rounded-md">
            <AvatarImage src={t.coverImage} alt="" className="rounded-md" />
            <AvatarFallback className="rounded-md">{t.destination.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-foreground font-medium">{t.name}</p>
            <p className="text-muted-foreground text-xs">{t.destination}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (t) => TOUR_CATEGORY_LABELS[t.category],
      hideOnMobile: true,
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (t) => `${t.durationDays}D/${t.durationNights}N`,
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <StatusBadge label={t.status} variant={STATUS_VARIANT[t.status]} />,
    },
    {
      key: 'updated',
      header: 'Updated',
      render: (t) => formatDate(t.updatedAt),
      hideOnMobile: true,
    },
    {
      key: 'actions',
      header: '',
      render: (t) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${t.name}`}
            onClick={() => {
              setEditingTemplate(t);
              setFormOpen(true);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${t.name}`}
            onClick={() => setDeleteTarget(t)}
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
        title="Tour Templates"
        description="Reusable tour blueprints — destination, duration, category, includes/excludes, and more."
        actions={
          <Button
            className="gap-2"
            onClick={() => {
              setEditingTemplate(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            New Template
          </Button>
        }
      />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search templates..."
      >
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as TemplateStatus | 'all')}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </AdminToolbar>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(t) => t.id}
        emptyTitle="No templates found"
        emptyDescription="Try adjusting your search or filters."
      />

      <TemplateFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        editingTemplate={editingTemplate}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this template?"
        description={`"${deleteTarget?.name}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
