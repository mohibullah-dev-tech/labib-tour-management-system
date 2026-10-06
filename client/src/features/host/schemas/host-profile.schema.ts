import { z } from 'zod';

const BD_PHONE_REGEX = /^(?:\+?880|0)1[3-9]\d{8}$/;

export const hostProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'Full name must be at least 3 characters')
    .max(60, 'Full name cannot exceed 60 characters'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(BD_PHONE_REGEX, 'Please enter a valid Bangladeshi phone number (e.g. 01712345678)'),
  whatsapp: z.string().trim().min(10, 'Please enter a valid WhatsApp contact number'),
  experience: z.string().trim().min(3, 'Please describe your guide experience level'),
  bio: z
    .string()
    .trim()
    .min(20, 'Please provide a short bio of at least 20 characters')
    .max(500, 'Bio cannot exceed 500 characters'),
  languages: z
    .string()
    .trim()
    .min(2, 'Please list spoken languages (e.g. Bangla, English, Sylheti)'),
  emergencyContact: z
    .string()
    .trim()
    .min(5, 'Please provide an emergency contact name and phone number'),
});

export type HostProfileFormValues = z.infer<typeof hostProfileSchema>;
