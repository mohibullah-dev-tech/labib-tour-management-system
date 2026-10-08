import { createContext, useCallback, useMemo, useReducer, type PropsWithChildren } from 'react';
import type {
  BookingEvent,
  BookingPackageOption,
  BookingStep,
  GuestFormData,
} from '@/features/booking/types';
import { EMPTY_GUEST_FORM, BOOKING_STEPS } from '@/features/booking/types';
import { getBusById } from '@/features/booking/data/buses';
import { clearSeatLockSessionId } from '@/features/booking/services/seat.service';

export interface BookingDraft {
  step: BookingStep;
  event: BookingEvent | null;
  packageOption: BookingPackageOption | null;
  selectedSeatIds: string[];
  lockExpiresAt: string | null;
  seatLockSessionId: string | null;
  guestForm: GuestFormData;
  bookingId: string | null;
  isHoldExpired: boolean;
}

type BookingAction =
  | { type: 'SELECT_EVENT'; event: BookingEvent }
  | { type: 'SELECT_PACKAGE'; packageOption: BookingPackageOption }
  | { type: 'CONFIRM_BUS' }
  | { type: 'TOGGLE_SEAT'; seatId: string }
  | { type: 'SET_SEAT_LOCKS'; seatNumbers: string[]; expiresAt: string; sessionId: string }
  | { type: 'CLEAR_SEAT_LOCKS' }
  | { type: 'MARK_HOLD_EXPIRED' }
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
  lockExpiresAt: null,
  seatLockSessionId: null,
  guestForm: EMPTY_GUEST_FORM,
  bookingId: null,
  isHoldExpired: false,
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
      const updatedSeats = isSelected
        ? state.selectedSeatIds.filter((id) => id !== action.seatId)
        : [...state.selectedSeatIds, action.seatId];
      return {
        ...state,
        selectedSeatIds: updatedSeats,
      };
    }
    case 'SET_SEAT_LOCKS':
      return {
        ...state,
        selectedSeatIds: action.seatNumbers,
        lockExpiresAt: action.expiresAt,
        seatLockSessionId: action.sessionId,
        isHoldExpired: false,
      };
    case 'CLEAR_SEAT_LOCKS':
      return {
        ...state,
        selectedSeatIds: [],
        lockExpiresAt: null,
        isHoldExpired: false,
      };
    case 'MARK_HOLD_EXPIRED':
      return {
        ...state,
        selectedSeatIds: [],
        lockExpiresAt: null,
        isHoldExpired: true,
      };
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
      clearSeatLockSessionId();
      return initialDraft;
    default:
      return state;
  }
}

export interface BookingContextValue {
  draft: BookingDraft;
  bus: ReturnType<typeof getBusById>;
  selectEvent: (event: BookingEvent) => void;
  selectPackage: (packageOption: BookingPackageOption) => void;
  confirmBus: () => void;
  toggleSeat: (seatId: string) => void;
  setSeatLocks: (seatNumbers: string[], expiresAt: string, sessionId: string) => void;
  clearSeatLocks: () => void;
  markHoldExpired: () => void;
  setGuestForm: (form: GuestFormData) => void;
  submitBooking: (bookingId: string) => void;
  goToStep: (step: BookingStep) => void;
  goBack: () => void;
  reset: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components -- context must live next to its Provider
export const BookingContext = createContext<BookingContextValue | null>(null);

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
  const setSeatLocks = useCallback(
    (seatNumbers: string[], expiresAt: string, sessionId: string) =>
      dispatch({ type: 'SET_SEAT_LOCKS', seatNumbers, expiresAt, sessionId }),
    [],
  );
  const clearSeatLocks = useCallback(() => dispatch({ type: 'CLEAR_SEAT_LOCKS' }), []);
  const markHoldExpired = useCallback(() => dispatch({ type: 'MARK_HOLD_EXPIRED' }), []);
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
      setSeatLocks,
      clearSeatLocks,
      markHoldExpired,
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
      setSeatLocks,
      clearSeatLocks,
      markHoldExpired,
      setGuestForm,
      submitBooking,
      goToStep,
      goBack,
      reset,
    ],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
