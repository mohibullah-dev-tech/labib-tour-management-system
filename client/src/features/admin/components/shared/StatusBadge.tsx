import { Badge, type BadgeProps } from '@/components/ui/badge';

export interface StatusBadgeProps {
  label: string;
  variant: NonNullable<BadgeProps['variant']>;
}

/** Thin wrapper so every admin status column (template/event/bus/booking/payment/review status) renders identically. */
function StatusBadge({ label, variant }: StatusBadgeProps) {
  return <Badge variant={variant}>{label}</Badge>;
}

export { StatusBadge };
