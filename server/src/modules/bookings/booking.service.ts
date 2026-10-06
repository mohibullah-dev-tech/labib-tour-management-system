import mongoose, { Types } from 'mongoose';
import { Booking, EventSeat, TourEvent, TourTemplate, User } from '@/models/index.js';
import { ApiError } from '@/utils/ApiError.js';
import { createBookingSchema, type CreateBookingInput } from '@/validators/index.js';
import { calculateBookingFinance } from '@/modules/bookings/bookingFinance.js';

/** Claims seats and writes a booking in one replica-set transaction. */
export async function createBooking(input: CreateBookingInput, userId: string) {
  const data = createBookingSchema.parse(input);
  if (!Types.ObjectId.isValid(userId)) throw ApiError.badRequest('Invalid user id');
  const session = await mongoose.startSession();
  let createdBooking: InstanceType<typeof Booking> | undefined;

  try {
    await session.withTransaction(
      async () => {
        const customer = await User.exists({ _id: userId, isActive: true }).session(session);
        if (!customer) throw ApiError.unauthorized('An active account is required to book');
        const now = new Date();
        const event = await TourEvent.findOne({
          _id: data.eventId,
          status: 'booking_open',
          $and: [
            { $or: [{ bookingOpenAt: { $exists: false } }, { bookingOpenAt: { $lte: now } }] },
            { $or: [{ bookingCloseAt: { $exists: false } }, { bookingCloseAt: { $gt: now } }] },
          ],
        })
          .session(session)
          .select('tourTemplateId currency')
          .lean();
        if (!event) throw ApiError.conflict('This event is not accepting bookings');

        const template = await TourTemplate.findById(event.tourTemplateId)
          .session(session)
          .select('pricing minimumAdvancePercent')
          .lean();
        if (!template) throw ApiError.notFound('Tour template not found');
        const tierPrice =
          template.pricing.packagePrices instanceof Map
            ? template.pricing.packagePrices.get(data.bookingType)
            : (template.pricing.packagePrices as Record<string, number> | undefined)?.[
                data.bookingType
              ];
        const packagePrice = typeof tierPrice === 'number' ? tierPrice : template.pricing.basePrice;
        const finance = calculateBookingFinance({
          unitPrice: packagePrice,
          quantity: data.quantity,
          amountReceived: 0,
          minimumAdvancePercent: template.minimumAdvancePercent,
        });

        const claimedSeats = await EventSeat.updateMany(
          { eventId: event._id, seatNumber: { $in: data.seatNumbers }, status: 'available' },
          { $set: { status: 'locked' } },
          { session },
        );
        if (claimedSeats.modifiedCount !== data.seatNumbers.length) {
          throw ApiError.conflict('One or more selected seats are no longer available');
        }

        const [booking] = await Booking.create(
          [
            {
              bookingCode: `LT-${Date.now().toString(36).toUpperCase()}-${new Types.ObjectId().toString().slice(-6).toUpperCase()}`,
              customerId: new Types.ObjectId(userId),
              eventId: event._id,
              tourTemplateId: event.tourTemplateId,
              bookingType: data.bookingType,
              personCount: data.quantity,
              seatNumbers: data.seatNumbers,
              guestDetails: data.guestDetails,
              pickupPoint: data.pickupPoint,
              specialNotes: data.specialNotes,
              ...finance,
              paymentStatus: 'unpaid',
              bookingStatus: 'pending',
              currency: event.currency,
            },
          ],
          { session },
        );
        await EventSeat.updateMany(
          { eventId: event._id, seatNumber: { $in: data.seatNumbers }, status: 'locked' },
          { $set: { status: 'reserved', bookingId: booking._id }, $unset: { lockedUntil: 1 } },
          { session },
        );
        createdBooking = booking;
      },
      { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } },
    );
  } finally {
    await session.endSession();
  }

  if (!createdBooking) throw ApiError.internal('Booking transaction completed without a booking');
  return createdBooking;
}
