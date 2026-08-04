import * as React from 'react';
import { cn } from '@/lib/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          'border-input bg-background text-foreground flex min-h-24 w-full rounded-sm border px-3 py-2 text-sm',
          'shadow-sm transition-colors',
          'placeholder:text-muted-foreground',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
