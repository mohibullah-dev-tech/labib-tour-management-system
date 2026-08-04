import type { LucideIcon, LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Consistent Lucide icon sizing across the app. Rather than every call
 * site picking its own `size-4` / `size-5` / `h-4 w-4` by hand, features
 * pick one of four named sizes here — keeps icon weight visually uniform
 * next to text at each scale (button, inline text, card header, banner).
 */
const ICON_SIZE = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
} as const;

export type IconSize = keyof typeof ICON_SIZE;

export interface IconProps extends Omit<LucideProps, 'size'> {
  icon: LucideIcon;
  size?: IconSize;
}

function Icon({ icon: LucideIconComponent, size = 'sm', className, ...props }: IconProps) {
  return (
    <LucideIconComponent
      size={ICON_SIZE[size]}
      strokeWidth={2}
      className={cn('shrink-0', className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export { Icon, ICON_SIZE };
