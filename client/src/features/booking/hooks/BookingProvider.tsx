import { createContext, useCallback, useMemo, useReducer, type PropsWithChildren } from 'react';
import type {
  BookingEvent,
  BookingPackageOption,
  BookingStep,
  GuestFormData,
} from '@/features/booking/types';
import { EMPTY_GUEST_FORM, BOOKING_STEPS } from '@/features/booking/types';
import { getBusById } from '@/features/booking/data/buses';

interface BookingDraft {
  step: BookingStep;
  event: BookingEvent | null;
  packageOption: BookingPackageOption | null;
  selectedSeatIds: string[];
  guestForm: GuestFormData;
  bookingId: string | null;
}

type BookingAction =
  | { type: 'SELECT_EVENT'; event: BookingEvent }
  | { type: 'SELECT_PACKAGE'; packageOption: BookingPackageOption }
  | { type: 'CONFIRM_BUS' }
  | { type: 'TOGGLE_SEAT'; seatId: string }
  | { type: 'SET_GUEST_FORM'; guestForm: GuestFormData }
  | { type: 'SUBMIT_BOOKING'; bookingId: string }
  | { type: 'GO_TO_STEP'; step: BookingStep }
  | { type: 'GO_BACK' }
  | { type: 'RESET' };

const initialDraft: BookingDraft = {
  step: 'event',
  event: null,
  packageOption: null,
  selectedSeatIds: [],
  guestForm: EMPTY_GUEST_FORM,
  bookingId: null,
};

function stepIndex(step: BookingStep): number {
  return BOOKING_STEPS.findIndex((s) => s.key === step);
}

function bookingReducer(state: BookingDraft, action: BookingAction): BookingDraft {
  switch (action.type) {
    case 'SELECT_EVENT':
      return { ...initialDraft, event: action.event, step: 'package' };
    case 'SELECT_PACKAGE':
      return { ...state, packageOption: action.packageOption, step: 'bus' };
    case 'CONFIRM_BUS':
      return { ...state, step: 'seat' };
    case 'TOGGLE_SEAT': {
      const isSelected = state.selectedSeatIds.includes(action.seatId);
      return {
        ...state,
        selectedSeatIds: isSelected
          ? state.selectedSeatIds.filter((id) => id !== action.seatId)
          : [...state.selectedSeatIds, action.seatId],
      };
    }
    case 'SET_GUEST_FORM':
      return { ...state, guestForm: action.guestForm };
    case 'SUBMIT_BOOKING':
      return { ...state, step: 'success', bookingId: action.bookingId };
    case 'GO_TO_STEP':
      return { ...state, step: action.step };
    case 'GO_BACK': {
      const prevIndex = Math.max(0, stepIndex(state.step) - 1);
      return { ...state, step: BOOKING_STEPS[prevIndex].key };
    }
    case 'RESET':
      return initialDraft;
    default:
      return state;
  }
}

interface BookingContextValue {
  draft: BookingDraft;
  bus: ReturnType<typeof getBusById>;
  selectEvent: (event: BookingEvent) => void;
  selectPackage: (packageOption: BookingPackageOption) => void;
  confirmBus: () => void;
  toggleSeat: (seatId: string) => void;
  setGuestForm: (form: GuestFormData) => void;
  submitBooking: (bookingId: string) => void;
  goToStep: (step: BookingStep) => void;
  goBack: () => void;
  reset: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components -- context must live next to its Provider
export const BookingContext = createContext<BookingContextValue | null>(null);

/**
 * Owns the entire booking wizard's draft state via useReducer — a single
 * source of truth threaded through every step component, instead of
 * lifting state through props across 6 separate step components. Scoped
 * to BookingPage only (not app-wide) since nothing outside the booking
 * flow needs it.
 */
export function BookingProvider({ children }: PropsWithChildren) {
  const [draft, dispatch] = useReducer(bookingReducer, initialDraft);

  const selectEvent = useCallback(
    (event: BookingEvent) => dispatch({ type: 'SELECT_EVENT', event }),
    [],
  );
  const selectPackage = useCallback(
    (packageOption: BookingPackageOption) => dispatch({ type: 'SELECT_PACKAGE', packageOption }),
    [],
  );
  const confirmBus = useCallback(() => dispatch({ type: 'CONFIRM_BUS' }), []);
  const toggleSeat = useCallback((seatId: string) => dispatch({ type: 'TOGGLE_SEAT', seatId }), []);
  const setGuestForm = useCallback(
    (guestForm: GuestFormData) => dispatch({ type: 'SET_GUEST_FORM', guestForm }),
    [],
  );
  const submitBooking = useCallback(
    (bookingId: string) => dispatch({ type: 'SUBMIT_BOOKING', bookingId }),
    [],
  );
  const goToStep = useCallback((step: BookingStep) => dispatch({ type: 'GO_TO_STEP', step }), []);
  const goBack = useCallback(() => dispatch({ type: 'GO_BACK' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const bus = useMemo(
    () => (draft.event ? getBusById(draft.event.busId) : undefined),
    [draft.event],
  );

  const value = useMemo<BookingContextValue>(
    () => ({
      draft,
      bus,
      selectEvent,
      selectPackage,
      confirmBus,
      toggleSeat,
      setGuestForm,
      submitBooking,
      goToStep,
      goBack,
      reset,
    }),
    [
      draft,
      bus,
      selectEvent,
      selectPackage,
      confirmBus,
      toggleSeat,
      setGuestForm,
      submitBooking,
      goToStep,
      goBack,
      reset,
    ],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
