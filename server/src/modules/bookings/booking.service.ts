import mongoose, { Types } from 'mongoose';
import { Booking, EventSeat, TourEvent, TourTemplate, User } from '@/models/index.js';
import { ApiError } from '@/utils/ApiError.js';
import { createBookingSchema, type CreateBookingInput } from '@/validators/index.js';
import { calculateBookingFinance } from '@/modules/bookings/bookingFinance.js';
import { SeatLockService } from '@/modules/seats/seatLock.service.js';
import { redisClient, isRedisConnected } from '@/config/redis.js';
import { logger } from '@/utils/logger.js';

export interface CreateBookingOptions {
  sessionId?: string;
  idempotencyKey?: string;
}

/**
 * Concurrency-safe booking creation.
 * Verifies active seat lock ownership in Redis,
 * executes MongoDB transaction to claim EventSeats permanently and record Booking,
 * and releases temporary Redis locks.
 */
export async function createBooking(
  input: CreateBookingInput,
  userId: string,
  options?: CreateBookingOptions,
) {
  const data = createBookingSchema.parse(input);
  if (!Types.ObjectId.isValid(userId)) throw ApiError.badRequest('Invalid user id');

  // 1. Idempotency Protection: Prevent duplicate submissions from double clicks
  const idempotencyKey = options?.idempotencyKey;
  if (idempotencyKey) {
    const redisIdempKey = `labib:idempotency:${userId}:${idempotencyKey}`;
    if (isRedisConnected()) {
      try {
        const acquired = await redisClient.set(redisIdempKey, 'processing', 'EX', 120, 'NX');
        if (!acquired) {
          throw ApiError.conflict(
            'A booking request with this idempotency key is already processing or completed.',
          );
        }
      } catch (err) {
        if (err instanceof ApiError) throw err;
        logger.warn('Redis idempotency check warning', { error: err });
      }
    }
  }

  // 2. Critical Check: Verify active Redis seat lock ownership before booking
  const hasValidLocks = await SeatLockService.verifyActiveLocks({
    eventId: data.eventId,
    seatNumbers: data.seatNumbers,
    userId,
    sessionId: options?.sessionId,
  });

  if (!hasValidLocks) {
    throw ApiError.conflict(
      'Your seat hold has expired or is invalid. Please select your seats again.',
    );
  }

  // 3. Prepare MongoDB execution
  const session = await mongoose.startSession();
  let createdBooking: InstanceType<typeof Booking> | undefined;

  try {
    // Attempt standard replica set / Atlas MongoDB transaction
    const executeInTransaction = async (sess?: mongoose.ClientSession) => {
      const customer = await User.exists({ _id: userId, isActive: true }).session(sess || null);
      if (!customer) throw ApiError.unauthorized('An active account is required to book');

      const now = new Date();
      const eventQuery = TourEvent.findOne({
        _id: data.eventId,
        status: { $in: ['booking_open', 'published'] },
        $and: [
          { $or: [{ bookingOpenAt: { $exists: false } }, { bookingOpenAt: { $lte: now } }] },
          { $or: [{ bookingCloseAt: { $exists: false } }, { bookingCloseAt: { $gt: now } }] },
        ],
      }).select('tourTemplateId currency busId');

      if (sess) eventQuery.session(sess);
      const event = await eventQuery.lean();
      if (!event) throw ApiError.conflict('This event is not accepting bookings');

      const templateQuery = TourTemplate.findById(event.tourTemplateId).select(
        'pricing minimumAdvancePercent',
      );
      if (sess) templateQuery.session(sess);
      const template = await templateQuery.lean();
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

      // Verify that no seat has already been booked by another user in MongoDB
      const alreadyBooked = await EventSeat.find({
        eventId: event._id,
        seatNumber: { $in: data.seatNumbers },
        status: { $in: ['booked', 'reserved', 'blocked'] },
      })
        .session(sess || null)
        .lean();

      if (alreadyBooked.length > 0) {
        const bookedSeatNumbers = alreadyBooked.map((s) => s.seatNumber).join(', ');
        throw ApiError.conflict(`Seat ${bookedSeatNumbers} has already been booked.`);
      }

      // Generate unique booking code
      const bookingCode = `LT-${Date.now().toString(36).toUpperCase()}-${new Types.ObjectId().toString().slice(-6).toUpperCase()}`;

      // Create Booking record
      const [booking] = await Booking.create(
        [
          {
            bookingCode,
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
        sess ? { session: sess } : {},
      );

      // Permanently update EventSeat status in MongoDB to 'booked'
      const updateResult = await EventSeat.updateMany(
        { eventId: event._id, seatNumber: { $in: data.seatNumbers } },
        { $set: { status: 'booked', bookingId: booking._id }, $unset: { lockedUntil: 1 } },
        sess ? { session: sess } : {},
      );

      // If seats weren't existing in EventSeat, upsert/create them
      if (updateResult.matchedCount < data.seatNumbers.length) {
        const existingNumbers = (
          await EventSeat.find({ eventId: event._id, seatNumber: { $in: data.seatNumbers } })
            .select('seatNumber')
            .lean()
        ).map((s) => s.seatNumber);

        const missingSeats = data.seatNumbers.filter((num) => !existingNumbers.includes(num));
        if (missingSeats.length > 0) {
          await EventSeat.insertMany(
            missingSeats.map((num) => ({
              eventId: event._id,
              busId: event.busId,
              seatNumber: num,
              status: 'booked',
              bookingId: booking._id,
            })),
            sess ? { session: sess } : {},
          );
        }
      }

      createdBooking = booking;
    };

    try {
      await session.withTransaction(() => executeInTransaction(session), {
        readConcern: { level: 'snapshot' },
        writeConcern: { w: 'majority' },
      });
    } catch (txError: unknown) {
      const msg = txError instanceof Error ? txError.message : String(txError);
      // Fallback for standalone MongoDB environments that do not support replica set transactions
      if (msg.includes('replica set') || msg.includes('Transaction numbers are only allowed')) {
        logger.info('Running booking transaction in standalone fallback mode');
        await executeInTransaction();
      } else {
        throw txError;
      }
    }
  } finally {
    await session.endSession();
  }

  if (!createdBooking) {
    throw ApiError.internal('Booking transaction completed without a booking record');
  }

  // 4. Release Redis temporary locks since seats are now permanently booked in MongoDB
  try {
    await SeatLockService.releaseSeats({
      eventId: data.eventId,
      seatNumbers: data.seatNumbers,
      userId,
      sessionId: options?.sessionId,
    });
  } catch (releaseErr) {
    logger.warn('Failed to release Redis locks after booking confirmation', { error: releaseErr });
  }

  return createdBooking;
}
