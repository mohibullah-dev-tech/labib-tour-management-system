import { Role } from '@/features/auth/types/role';
import type { GuestProfile } from '@/features/guest/types';

export const MOCK_GUEST_PROFILE: GuestProfile = {
  id: 'u-guest-1',
  fullName: 'Farhana Akter',
  email: 'guest@labibtours.com',
  phone: '+880 1611-000001',
  address: 'House 42, Road 11, Sector 4, Uttara, Dhaka-1230',
  avatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  emergencyContact: '+880 1711-998877 (Father: Md. Anwar Hossain)',
  preferredPickupLocation: 'Abdullahpur Bus Stand, Dhaka',
  memberSince: '2026-01-10T00:00:00Z',
  totalToursCompleted: 3,
  totalReviewsGiven: 2,
  rewardPoints: 450,
  role: Role.Guest,
};
