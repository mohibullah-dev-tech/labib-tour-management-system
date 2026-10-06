import { z } from 'zod';
import {
  BOOKING_TYPES,
  DEFAULT_MINIMUM_ADVANCE_PERCENT,
  EVENT_STATUSES,
  PACKAGE_TIERS,
  TOUR_TYPES,
} from '@/constants/index.js';

const dateString = z.string().datetime({ offset: true });
const money = z.number().finite().nonnegative();

export const createTourTemplateSchema = z.object({
  title: z.string().trim().min(3).max(120),
  shortDescription: z.string().trim().max(300).default(''),
  description: z.string().trim().min(20).max(5000),
  tourType: z.enum(TOUR_TYPES),
  destination: z.string().trim().min(2).max(160),
  durationDays: z.number().int().min(1).max(60),
  inclusions: z.array(z.string().trim().min(1).max(160)).max(50).default([]),
  exclusions: z.array(z.string().trim().min(1).max(160)).max(50).default([]),
  pricing: z.object({
    basePrice: money,
    packagePrices: z.record(z.enum(PACKAGE_TIERS), money).default({}),
  }),
  minimumAdvancePercent: z.number().min(0).max(100).default(DEFAULT_MINIMUM_ADVANCE_PERCENT),
});

export const createTourEventSchema = z
  .object({
    tourTemplateId: z.string().regex(/^[\da-f]{24}$/i),
    busId: z.string().regex(/^[\da-f]{24}$/i),
    hostId: z.string().regex(/^[\da-f]{24}$/i),
    eventCode: z.string().trim().min(3).max(32),
    startDate: dateString,
    endDate: dateString,
    bookingCloseAt: dateString.optional(),
    capacity: z.number().int().min(1).max(100).default(45),
    status: z.enum(EVENT_STATUSES).default('draft'),
    pickupPoints: z
      .array(
        z.object({
          name: z.string().trim().min(2).max(100),
          address: z.string().trim().min(3).max(300),
          time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        }),
      )
      .min(1)
      .max(20),
  })
  .refine((event) => Date.parse(event.endDate) > Date.parse(event.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export const createBookingSchema = z
  .object({
    eventId: z.string().regex(/^[\da-f]{24}$/i),
    bookingType: z.enum(BOOKING_TYPES),
    quantity: z.number().int().min(1).max(10),
    seatNumbers: z
      .array(z.string().regex(/^(?:[A-J][1-4]|K[1-5])$/))
      .min(1)
      .max(10),
    guestDetails: z
      .array(
        z.object({
          name: z.string().trim().min(2).max(120),
          phone: z.string().trim().min(7).max(24),
          email: z.string().email().max(254).optional(),
          address: z.string().trim().max(500).optional(),
          emergencyContact: z.string().trim().max(24).optional(),
          emergencyContactName: z.string().trim().max(120).optional(),
          age: z.number().int().min(0).max(120).optional(),
        }),
      )
      .min(1)
      .max(10),
    pickupPoint: z.string().trim().max(200).optional(),
    specialNotes: z.string().trim().max(1000).optional(),
  })
  .refine((booking) => booking.quantity === booking.seatNumbers.length, {
    message: 'Select exactly one seat per guest',
    path: ['seatNumbers'],
  })
  .refine((booking) => booking.quantity === booking.guestDetails.length, {
    message: 'Provide details for each guest',
    path: ['guestDetails'],
  })
  .refine((booking) => new Set(booking.seatNumbers).size === booking.seatNumbers.length, {
    message: 'Seat selections must be unique',
    path: ['seatNumbers'],
  });

export const markNotificationReadSchema = z.object({ isRead: z.boolean() });

export type CreateTourTemplateInput = z.infer<typeof createTourTemplateSchema>;
export type CreateTourEventInput = z.infer<typeof createTourEventSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
