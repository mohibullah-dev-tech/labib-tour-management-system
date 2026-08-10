import { useMemo, useState } from 'react';
import { Plus, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_GALLERY } from '@/features/admin/data/gallery';
import type { GalleryItemAdmin } from '@/features/admin/types';
import { AdminPageHeader } from '@/features/admin/components/layout/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/shared/AdminToolbar';
import { ConfirmDialog } from '@/features/admin/components/shared/ConfirmDialog';
import { UploadImagesDialog } from '@/features/admin/components/gallery/UploadImagesDialog';
import { LazyImage } from '@/components/common/LazyImage';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/common/EmptyState';
import { Images } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItemAdmin[]>(ADMIN_GALLERY);
  const [destinationFilter, setDestinationFilter] = useState('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItemAdmin | null>(null);

  const destinations = useMemo(
    () => Array.from(new Set(items.map((i) => i.destination))).sort(),
    [items],
  );
  const filtered = useMemo(
    () => items.filter((i) => destinationFilter === 'all' || i.destination === destinationFilter),
    [items, destinationFilter],
  );

  const toggleFeatured = (item: GalleryItemAdmin) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isFeatured: !i.isFeatured } : i)),
    );
    toast.success(item.isFeatured ? 'Removed from featured' : 'Marked as featured');
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    toast.success('Image deleted');
    setDeleteTarget(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Gallery"
        description="Organize destination photos and mark featured images for the public gallery."
        actions={
          <Button className="gap-2" onClick={() => setUploadOpen(true)}>
            <Plus className="size-4" />
            Upload Images
          </Button>
        }
      />

      <AdminToolbar>
        <Select value={destinationFilter} onValueChange={setDestinationFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All destinations</SelectItem>
            {destinations.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminToolbar>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No images found"
          description="Try a different destination filter, or upload new images."
        />
      ) : (
        <div className="laptop:grid-cols-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group border-border relative overflow-hidden rounded-lg border"
            >
              <LazyImage src={item.image} alt={item.destination} aspectClassName="aspect-square" />
              <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={item.isFeatured ? 'Unfeature' : 'Feature'}
                    onClick={() => toggleFeatured(item)}
                    className="size-8 bg-white/90 text-neutral-900 hover:bg-white"
                  >
                    <Star
                      className={cn('size-4', item.isFeatured && 'fill-accent-500 text-accent-500')}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete image"
                    onClick={() => setDeleteTarget(item)}
                    className="text-destructive size-8 bg-white/90 hover:bg-white"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <p className="truncate text-xs font-medium text-white">{item.destination}</p>
              </div>
              {item.isFeatured && (
                <span className="bg-accent-500 absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-medium text-white">
                  Featured
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <UploadImagesDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this image?"
        description="This image will be permanently removed from the gallery."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
