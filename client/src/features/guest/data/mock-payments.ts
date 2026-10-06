import type { GuestPayment } from '@/features/guest/types';

export const MOCK_GUEST_PAYMENTS: GuestPayment[] = [
  {
    id: 'TXN-BK-8941-1',
    bookingId: 'LTMS-BK-8941',
    destination: 'Sajek Valley, Rangamati',
    amount: 17000,
    date: '2026-10-01T14:32:00Z',
    method: 'bKash',
    transactionId: 'BKASH9A8K2J1',
    status: 'success',
  },
  {
    id: 'TXN-BK-9102-1',
    bookingId: 'LTMS-BK-9102',
    destination: "Cox's Bazar & Inani Beach",
    amount: 7000,
    date: '2026-10-03T18:15:00Z',
    method: 'Nagad',
    transactionId: 'NGD4930129L',
    status: 'success',
  },
  {
    id: 'TXN-BK-7320-1',
    bookingId: 'LTMS-BK-7320',
    destination: 'Sreemangal, Sylhet',
    amount: 6800,
    date: '2026-08-02T11:20:00Z',
    method: 'Card',
    transactionId: 'CARD-VISA-9041',
    status: 'success',
  },
  {
    id: 'TXN-BK-6619-1',
    bookingId: 'LTMS-BK-6619',
    destination: 'Sunamganj, Sylhet',
    amount: 19500,
    date: '2026-06-01T09:40:00Z',
    method: 'Bank Transfer',
    transactionId: 'EBL-TR-2940192',
    status: 'success',
  },
];
