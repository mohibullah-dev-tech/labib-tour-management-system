import { z } from 'zod';

const strongPassword = z
  .string()
  .min(8)
  .max(128)
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a number');

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    phone: z
      .string()
      .trim()
      .min(7)
      .max(24)
      .regex(/^\+?[\d\s()-]+$/),
    password: strongPassword,
  })
  .strict();

export const loginSchema = z
  .object({
    identifier: z.string().trim().min(3).max(254),
    password: z.string().min(1).max(128),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: strongPassword,
  })
  .strict();

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    phone: z
      .string()
      .trim()
      .min(7)
      .max(24)
      .regex(/^\+?[\d\s()-]+$/)
      .optional(),
    avatar: z.string().url().max(2048).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Provide at least one profile field');

export const identifierSchema = z
  .object({ identifier: z.string().trim().min(3).max(254) })
  .strict();
export const resetPasswordSchema = z
  .object({
    token: z.string().min(20).max(512),
    password: strongPassword,
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
