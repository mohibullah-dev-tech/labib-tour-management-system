import { useSearchParams } from 'react-router';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Section } from '@/components/layout/Section';
import { Container } from '@/components/common/Container';
import { BookingProvider } from '@/features/booking/hooks/BookingProvider';
import { useBooking } from '@/features/booking/hooks/useBooking';
import { BookingStepper } from '@/features/booking/components/BookingStepper';
import { SelectEventStep } from '@/features/booking/components/steps/SelectEventStep';
import { SelectPackageStep } from '@/features/booking/components/steps/SelectPackageStep';
import { SelectBusStep } from '@/features/booking/components/steps/SelectBusStep';
import { SelectSeatStep } from '@/features/booking/components/steps/SelectSeatStep';
import { BookingDetailsStep } from '@/features/booking/components/steps/BookingDetailsStep';
import { BookingSummaryStep } from '@/features/booking/components/steps/BookingSummaryStep';
import { BookingSuccessStep } from '@/features/booking/components/steps/BookingSuccessStep';
import type { BookingStep } from '@/features/booking/types';

/** Which steps are "completed" (and therefore clickable in the stepper) given how far the draft has progressed. */
function getCompletedSteps(draft: ReturnType<typeof useBooking>['draft']): BookingStep[] {
  const completed: BookingStep[] = [];
  if (draft.event) completed.push('event');
  if (draft.packageOption) completed.push('package');
  if (draft.packageOption) completed.push('bus'); // bus has nothing to configure, so it's "done" as soon as package is chosen
  if (draft.selectedSeatIds.length > 0) completed.push('seat');
  if (draft.guestForm.fullName) completed.push('details');
  return completed;
}

function BookingWizard() {
  const { draft, goToStep } = useBooking();
  const [searchParams, setSearchParams] = useSearchParams();
  const tourIdFilter = searchParams.get('tourId') ?? undefined;

  const clearTourFilter = () => {
    searchParams.delete('tourId');
    setSearchParams(searchParams);
  };

  if (draft.step === 'success') {
    return (
      <Section>
        <BookingSuccessStep />
      </Section>
    );
  }

  return (
    <Section>
      <Container className="mb-10 max-w-3xl">
        <BookingStepper
          currentStep={draft.step}
          completedSteps={getCompletedSteps(draft)}
          onStepClick={goToStep}
        />
      </Container>

      {draft.step === 'event' && (
        <SelectEventStep tourIdFilter={tourIdFilter} onClearFilter={clearTourFilter} />
      )}
      {draft.step === 'package' && <SelectPackageStep />}
      {draft.step === 'bus' && <SelectBusStep />}
      {draft.step === 'seat' && <SelectSeatStep />}
      {draft.step === 'details' && <BookingDetailsStep />}
      {draft.step === 'summary' && <BookingSummaryStep />}
    </Section>
  );
}

/**
 * Booking Module entry point. `BookingProvider` is instantiated here
 * (not at the app root) so the wizard's draft state resets automatically
 * whenever this page unmounts — a fresh booking always starts clean.
 */
export function BookingPage() {
  return (
    <PageWrapper>
      <BookingProvider>
        <BookingWizard />
      </BookingProvider>
    </PageWrapper>
  );
}
