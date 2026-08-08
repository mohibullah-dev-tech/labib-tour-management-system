import type { TourCategory } from '@/features/tours/types';
import type { PricingBreakdown } from '@/features/booking/types';

/**
 * PLACEHOLDER minimum-advance rules, per category, per guest. The brief
 * gives exact examples for three categories (Day 500, Relax 1000,
 * Premium 2000) — "seasonal" isn't specified, so 1500 is a reasonable
 * placeholder between Relax and Premium. THE BACKEND WILL PROVIDE THE
 * REAL VALUES; this map exists only so the UI has something concrete to
 * compute and display today. See docs/BOOKING_MODULE.md.
 */
const MIN_ADVANCE_PER_GUEST_BY_CATEGORY: Record<TourCategory, number> = {
  day: 500,
  relax: 1000,
  seasonal: 1500,
  premium: 2000,
};

export function getMinimumAdvancePerGuest(category: TourCategory): number {
  return MIN_ADVANCE_PER_GUEST_BY_CATEGORY[category];
}

export interface ComputePricingArgs {
  category: TourCategory;
  pricePerPerson: number;
  guestCount: number;
  /** Placeholder — always 0 until a coupon/discount system exists. */
  discount?: number;
  /** Placeholder — always 0 for a new booking until payment integration exists. */
  receivedAmount?: number;
}

/**
 * Pure calculation, no side effects, no API calls — every number here is
 * derived from the four inputs above. Once a backend exists, this
 * function's output shape (`PricingBreakdown`) is exactly what a
 * `POST /api/v1/bookings/quote` endpoint should return, so swapping this
 * client-side calculation for a real API response is a drop-in change
 * at the call site (BookingSummaryStep), not a rewrite.
 */
export function computePricing({
  category,
  pricePerPerson,
  guestCount,
  discount = 0,
  receivedAmount = 0,
}: ComputePricingArgs): PricingBreakdown {
  const subtotal = pricePerPerson * guestCount;
  const total = Math.max(0, subtotal - discount);
  const minimumAdvance = getMinimumAdvancePerGuest(category) * guestCount;
  const dueAmount = Math.max(0, total - receivedAmount);

  return {
    guestCount,
    pricePerPerson,
    subtotal,
    discount,
    total,
    minimumAdvance,
    receivedAmount,
    dueAmount,
  };
}
