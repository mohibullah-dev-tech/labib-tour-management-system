import mongoose, { Types } from 'mongoose';
import { Bus, EventSeat, TourEvent, TourTemplate, User } from '@/models/index.js';
import { ApiError } from '@/utils/ApiError.js';
import { createTourEventSchema, type CreateTourEventInput } from '@/validators/index.js';
import { createStandardPassengerSeatLayout } from '@/constants/index.js';

/** Creates an event only if its bus has no overlapping non-cancelled assignment. */
export async function createTourEvent(input: CreateTourEventInput) {
  const data = createTourEventSchema.parse(input);
  const busId = new Types.ObjectId(data.busId);
  const hostId = new Types.ObjectId(data.hostId);
  const bus = await Bus.findOne({ _id: busId, isActive: true }).lean();
  if (!bus) throw ApiError.notFound('Active bus not found');
  const host = await User.findOne({ _id: hostId, role: 'host', isActive: true })
    .select('_id')
    .lean();
  if (!host) throw ApiError.badRequest('An active host account is required');
  if (!(await TourTemplate.exists({ _id: data.tourTemplateId, isPublished: true }))) {
    throw ApiError.badRequest('A published tour template is required');
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  const seats = bus.layout.length ? bus.layout : createStandardPassengerSeatLayout();
  if (data.capacity > seats.length)
    throw ApiError.badRequest('Event capacity cannot exceed the bus passenger layout');
  const session = await mongoose.startSession();
  let createdEvent: InstanceType<typeof TourEvent> | undefined;
  try {
    await session.withTransaction(
      async () => {
        // Touching the bus serializes concurrent schedules for that same vehicle.
        const scheduledBus = await Bus.findOneAndUpdate(
          { _id: busId, isActive: true },
          { $set: { lastScheduleChangeAt: new Date() } },
          { new: true, session },
        );
        if (!scheduledBus) throw ApiError.notFound('Active bus not found');

        const overlap = await TourEvent.exists({
          busId,
          status: { $ne: 'cancelled' },
          startDate: { $lt: endDate },
          endDate: { $gt: startDate },
        }).session(session);
        if (overlap)
          throw ApiError.conflict('This bus is already assigned to an overlapping event');

        const [event] = await TourEvent.create(
          [
            {
              ...data,
              busId,
              hostId,
              startDate,
              endDate,
              tourTemplateId: new Types.ObjectId(data.tourTemplateId),
            },
          ],
          { session },
        );
        await EventSeat.insertMany(
          seats.map((seat) => ({
            eventId: event._id,
            busId,
            seatNumber: seat.seatNumber,
            status: 'available',
          })),
          { session, ordered: true },
        );
        createdEvent = event;
      },
      { readConcern: { level: 'snapshot' }, writeConcern: { w: 'majority' } },
    );
  } finally {
    await session.endSession();
  }
  if (!createdEvent) throw ApiError.internal('Event transaction completed without an event');
  return createdEvent;
}
