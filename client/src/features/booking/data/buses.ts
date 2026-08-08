import type { Bus } from '@/features/booking/types';
import {
  generateSeatRows,
  countAvailableSeats,
  countTotalSeats,
} from '@/features/booking/utils/seat-layout';

/**
 * One bus per event (business rule: one event = one bus), keyed by id
 * and referenced from BookingEvent.busId in data/events.ts. Seat status
 * overrides below are hand-placed to demonstrate every SeatStatus the
 * brief requires (booked, locked, reserved, female-reserved) — a real
 * backend will send this same `rows` shape computed from actual
 * bookings.
 */
function buildBus(id: string, name: string, busNumber: string, acType: 'AC' | 'Non-AC'): Bus {
  const rows = generateSeatRows({
    A1: 'booked',
    A2: 'booked',
    B3: 'booked',
    C1: 'locked',
    C2: 'locked',
    D4: 'reserved',
    E1: 'female-reserved',
    E2: 'female-reserved',
    F3: 'booked',
    G1: 'booked',
    G2: 'booked',
    G3: 'booked',
    G4: 'booked',
    K1: 'booked',
  });

  return {
    id,
    name,
    busNumber,
    acType,
    totalSeats: countTotalSeats(rows),
    availableSeats: countAvailableSeats(rows),
    rows,
  };
}

export const BUSES: Bus[] = [
  buildBus('bus-sajek-01', 'Green Line Coaster', 'DHK-METRO-GA-11-2201', 'AC'),
  buildBus('bus-coxsbazar-01', 'Shyamoli Paribahan', 'DHK-METRO-GA-14-3390', 'Non-AC'),
  buildBus('bus-bandarban-01', 'Green Line Coaster', 'DHK-METRO-GA-11-2205', 'AC'),
  buildBus('bus-sylhet-01', 'Ena Transport', 'DHK-METRO-GA-12-4471', 'AC'),
];

export function getBusById(busId: string): Bus | undefined {
  return BUSES.find((b) => b.id === busId);
}
