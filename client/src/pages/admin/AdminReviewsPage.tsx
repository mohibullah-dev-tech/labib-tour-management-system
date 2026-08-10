import { useMemo, useState } from 'react';
import { Check, X, Star } from 'lucide-react';
import { toast } from 'sonner';
import { ADMIN_REVIEWS } from '@/features/admin/data/reviews';
import type { ReviewAdmin, ReviewModerationStatus } from '@/features/admin/types';
import { AdminPageHeader } from '@/features/admin/components/layout/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/shared/AdminToolbar';
import { DataTable, type DataTableColumn } from '@/features/admin/components/shared/DataTable';
import { StatusBadge } from '@/features/admin/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Rating } from '@/components/common/Rating';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const STATUS_VARIANT: Record<ReviewModerationStatus, 'warning' | 'success' | 'destructive'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
};

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewAdmin[]>(ADMIN_REVIEWS);
  const [statusFilter, setStatusFilter] = useState<ReviewModerationStatus | 'all'>('all');

  const filtered = useMemo(
    () => reviews.filter((r) => statusFilter === 'all' || r.status === statusFilter),
    [reviews, statusFilter],
  );

  const updateReview = (id: string, patch: Partial<ReviewAdmin>) =>
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const handleApprove = (r: ReviewAdmin) => {
    updateReview(r.id, { status: 'approved' });
    toast.success('Review approved');
  };
  const handleReject = (r: ReviewAdmin) => {
    updateReview(r.id, { status: 'rejected' });
    toast.success('Review rejected');
  };
  const handleToggleFeatured = (r: ReviewAdmin) => {
    updateReview(r.id, { isFeatured: !r.isFeatured });
    toast.success(r.isFeatured ? 'Removed from featured' : 'Marked as featured');
  };

  const columns: DataTableColumn<ReviewAdmin>[] = [
    {
      key: 'review',
      header: 'Review',
      render: (r) => (
        <div className="max-w-sm">
          <p className="text-foreground font-medium">
            {r.guestName} <span className="text-muted-foreground font-normal">on {r.tourName}</span>
          </p>
          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">{r.comment}</p>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (r) => <Rating value={r.rating} showValue />,
      hideOnMobile: true,
    },
    {
      key: 'submitted',
      header: 'Submitted',
      render: (r) => formatDate(r.submittedAt),
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge label={r.status} variant={STATUS_VARIANT[r.status]} />,
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={r.isFeatured ? 'Unfeature' : 'Feature'}
                onClick={() => handleToggleFeatured(r)}
              >
                <Star className={cn('size-4', r.isFeatured && 'fill-accent-500 text-accent-500')} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {r.isFeatured ? 'Remove from featured' : 'Mark as featured'}
            </TooltipContent>
          </Tooltip>
          {r.status !== 'approved' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Approve"
                  onClick={() => handleApprove(r)}
                >
                  <Check className="text-success-600 size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Approve</TooltipContent>
            </Tooltip>
          )}
          {r.status !== 'rejected' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Reject"
                  onClick={() => handleReject(r)}
                >
                  <X className="text-destructive size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reject</TooltipContent>
            </Tooltip>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Reviews"
        description="Moderate guest reviews before they appear on the public site."
      />

      <AdminToolbar>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as ReviewModerationStatus | 'all')}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </AdminToolbar>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(r) => r.id}
        emptyTitle="No reviews found"
      />
    </div>
  );
}
