import { Types } from 'mongoose';
import { TourEvent, TourTemplate } from '@/models/index.js';
import { ApiError } from '@/utils/ApiError.js';
import { calculateBookingFinance } from '@/modules/bookings/bookingFinance.js';
import type { CreateBookingInput } from '@/validators/index.js';

/** Reads every price and the advance rule from the saved template. */
export async function quoteBooking(
  input: Pick<CreateBookingInput, 'eventId' | 'bookingType' | 'quantity'>,
) {
  if (!Types.ObjectId.isValid(input.eventId)) throw ApiError.badRequest('Invalid event id');
  const event = await TourEvent.findById(input.eventId)
    .select('tourTemplateId status currency bookingOpenAt bookingCloseAt')
    .lean();
  if (!event) throw ApiError.notFound('Tour event not found');
  if (event.status !== 'booking_open')
    throw ApiError.conflict('This event is not accepting bookings');
  const now = new Date();
  if (
    (event.bookingOpenAt && event.bookingOpenAt > now) ||
    (event.bookingCloseAt && event.bookingCloseAt <= now)
  ) {
    throw ApiError.conflict('The event booking window is closed');
  }

  const template = await TourTemplate.findById(event.tourTemplateId)
    .select('pricing minimumAdvancePercent')
    .lean();
  if (!template) throw ApiError.notFound('Tour template not found');
  const tierPrice =
    template.pricing.packagePrices instanceof Map
      ? template.pricing.packagePrices.get(input.bookingType)
      : (template.pricing.packagePrices as Record<string, number> | undefined)?.[input.bookingType];
  const packagePrice = typeof tierPrice === 'number' ? tierPrice : template.pricing.basePrice;
  return {
    ...calculateBookingFinance({
      unitPrice: packagePrice,
      quantity: input.quantity,
      amountReceived: 0,
      minimumAdvancePercent: template.minimumAdvancePercent,
    }),
    currency: event.currency,
  };
}
