import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Marks the field as invalid — pairs with aria-describedby for the error message. */
  invalid?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', invalid = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={invalid || undefined}
        className={cn(
          'border-input bg-background text-foreground flex h-10 w-full rounded-sm border px-3 py-2 text-sm',
          'shadow-sm transition-colors',
          'placeholder:text-muted-foreground',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
