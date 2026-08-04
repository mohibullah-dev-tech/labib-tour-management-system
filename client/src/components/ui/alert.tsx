import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative flex gap-3 rounded-md border p-4 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-border bg-muted text-foreground [&>svg]:text-foreground',
        info: 'border-secondary-200 bg-secondary-50 text-secondary-800 [&>svg]:text-secondary-600 dark:border-secondary-900 dark:bg-secondary-950 dark:text-secondary-200',
        success:
          'border-success-200 bg-success-50 text-success-800 [&>svg]:text-success-600 dark:border-success-900 dark:bg-success-950 dark:text-success-200',
        warning:
          'border-accent-200 bg-accent-50 text-accent-900 [&>svg]:text-accent-600 dark:border-accent-900 dark:bg-accent-950 dark:text-accent-200',
        destructive:
          'border-danger-200 bg-danger-50 text-danger-800 [&>svg]:text-danger-600 dark:border-danger-900 dark:bg-danger-950 dark:text-danger-200',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

const variantIcon = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: XCircle,
} as const;

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
  /** Hide the default leading icon (e.g. if you're supplying your own). */
  hideIcon?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', hideIcon = false, children, ...props }, ref) => {
    const Icon = variantIcon[variant ?? 'default'];
    return (
      <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
        {!hideIcon && <Icon aria-hidden="true" />}
        <div className="flex-1">{children}</div>
      </div>
    );
  },
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    // eslint-disable-next-line jsx-a11y/heading-has-content -- content supplied via `children` prop at usage sites
    <h5
      ref={ref}
      className={cn('mb-1 leading-none font-medium tracking-tight', className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm leading-relaxed opacity-90', className)} {...props} />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
