import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin text-primary', {
  variants: {
    size: {
      sm: 'size-4',
      md: 'size-6',
      lg: 'size-8',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof spinnerVariants> {
  /** Screen-reader label — always provide context, "Loading" is a safe default. */
  label?: string;
}

function Spinner({ className, size, label = 'Loading', ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      className={cn('inline-flex items-center justify-center', className)}
      {...props}
    >
      <Loader2 className={spinnerVariants({ size })} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export { Spinner };
