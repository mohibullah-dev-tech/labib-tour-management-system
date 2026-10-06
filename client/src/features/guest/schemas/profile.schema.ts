import { z } from 'zod';

export const guestProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(11, 'Phone number must be at least 11 digits'),
  address: z.string().min(5, 'Please provide your full address'),
  emergencyContact: z.string().min(5, 'Emergency contact details required'),
  preferredPickupLocation: z.string().min(3, 'Preferred pickup location required'),
});

export type GuestProfileFormValues = z.infer<typeof guestProfileSchema>;
