import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(3, 'Enter your email or phone number'),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const verifyCodeSchema = z.object({
  code: z.string().length(6, 'Enter the 6-digit code'),
});
export type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>;
