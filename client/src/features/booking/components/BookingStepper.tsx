import { Check } from 'lucide-react';
import { BOOKING_STEPS, type BookingStep } from '@/features/booking/types';
import { cn } from '@/lib/utils';

export interface BookingStepperProps {
  currentStep: BookingStep;
  /** Steps the user has already completed and can jump back to. */
  completedSteps: BookingStep[];
  onStepClick?: (step: BookingStep) => void;
}

/**
 * Horizontal progress stepper. Completed steps are clickable (jump back
 * without losing state, since BookingProvider holds everything in
 * memory) — future/unreached steps are not, so a guest can't skip ahead
 * of data they haven't provided yet.
 */
function BookingStepper({ currentStep, completedSteps, onStepClick }: BookingStepperProps) {
  const currentIndex = BOOKING_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <nav aria-label="Booking progress">
      <ol className="flex items-center">
        {BOOKING_STEPS.map((step, i) => {
          const isCompleted = completedSteps.includes(step.key);
          const isCurrent = step.key === currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <li
              key={step.key}
              className={cn('flex items-center', i < BOOKING_STEPS.length - 1 && 'flex-1')}
            >
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(step.key)}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'flex shrink-0 flex-col items-center gap-1.5 text-center',
                  isClickable ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                    isCurrent && 'border-primary bg-primary text-primary-foreground',
                    isCompleted &&
                      !isCurrent &&
                      'border-primary bg-primary-50 text-primary dark:bg-primary-950',
                    !isCurrent &&
                      !isCompleted &&
                      'border-border bg-background text-muted-foreground',
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={cn(
                    'hidden text-xs font-medium sm:block',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </span>
              </button>

              {i < BOOKING_STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn('mx-2 h-px flex-1', i < currentIndex ? 'bg-primary' : 'bg-border')}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { BookingStepper };
