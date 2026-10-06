import { Role } from '@/features/auth/types/role';
import type { HostProfile } from '@/features/host/types';

export const MOCK_HOST_PROFILE: HostProfile = {
  id: 'u-host-1',
  fullName: 'Rahim Ahmed',
  email: 'host@labibtours.com',
  phone: '+880 1711-000010',
  whatsapp: '+8801711000010',
  avatarUrl:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  experience: '5 Years Senior Tour Leader',
  bio: 'Certified wilderness tour leader with 5+ years of experience navigating the Chittagong Hill Tracts, Sylhet waterways, and remote coastal trails. Passionate about traveler safety, indigenous cultural heritage, and memorable group experiences.',
  languages: ['Bangla', 'English', 'Sylheti', 'Chittagonian'],
  emergencyContact: 'Kabir Ahmed (Brother) - +880 1819-998877',
  totalToursGuided: 48,
  assignedEventCount: 3,
  rating: 4.95,
  role: Role.Host,
};
