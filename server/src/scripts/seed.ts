import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '@/config/env.js';
import { connectDatabase, disconnectDatabase } from '@/config/database.js';
import { createStandardPassengerSeatLayout } from '@/constants/index.js';
import {
  Booking,
  Bus,
  EventSeat,
  HostProfile,
  Notification,
  TourEvent,
  TourTemplate,
  User,
} from '@/models/index.js';
import { calculateBookingFinance } from '@/modules/bookings/bookingFinance.js';
import { logger } from '@/utils/logger.js';

async function seed(): Promise<void> {
  if (env.NODE_ENV === 'production') throw new Error('Seed script is disabled in production');
  await connectDatabase();

  const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12);
  const admin = await User.findOneAndUpdate(
    { email: 'admin@example.com' },
    {
      $setOnInsert: {
        name: 'LTMS Demo Admin',
        email: 'admin@example.com',
        passwordHash,
        role: 'admin',
        isVerified: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const host = await User.findOneAndUpdate(
    { email: 'host@example.com' },
    {
      $setOnInsert: {
        name: 'LTMS Demo Host',
        email: 'host@example.com',
        passwordHash,
        role: 'host',
        isVerified: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const guest = await User.findOneAndUpdate(
    { email: 'guest@example.com' },
    {
      $setOnInsert: {
        name: 'LTMS Demo Guest',
        email: 'guest@example.com',
        passwordHash,
        role: 'guest',
        isVerified: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const hostProfile = await HostProfile.findOneAndUpdate(
    { userId: host._id },
    { $setOnInsert: { userId: host._id, bio: 'Demo tour host', languages: ['Bangla', 'English'] } },
    { upsert: true, new: true },
  );
  const template = await TourTemplate.findOneAndUpdate(
    { slug: 'sundarbans-demo-tour' },
    {
      $setOnInsert: {
        title: 'Sundarbans Discovery Tour',
        slug: 'sundarbans-demo-tour',
        description: 'A sample multi-day tour used to validate the LTMS backend foundation.',
        shortDescription: 'A sample Sundarbans getaway.',
        tourType: 'premium',
        destination: 'Sundarbans, Bangladesh',
        durationDays: 2,
        inclusions: ['Guide', 'Transport'],
        exclusions: ['Personal expenses'],
        itinerary: [{ day: 1, title: 'River journey', description: 'Explore the waterways.' }],
        pricing: {
          basePrice: 6500,
          packagePrices: { single: 6500, couple: 12000, premium: 9000, vip: 12000 },
        },
        minimumAdvancePercent: 30,
        packageTiers: ['single', 'couple', 'premium', 'vip'],
        isPublished: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  const bus = await Bus.findOneAndUpdate(
    { registrationNumber: 'DEMO-LTMS-01' },
    {
      $setOnInsert: {
        registrationNumber: 'DEMO-LTMS-01',
        name: 'LTMS Demo Coach',
        type: 'coach',
        totalSeats: 45,
        layout: createStandardPassengerSeatLayout(),
        driverSeat: true,
        helperSeat: true,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  const starts = new Date();
  starts.setDate(starts.getDate() + 30);
  starts.setHours(7, 0, 0, 0);
  const ends = new Date(starts);
  ends.setDate(ends.getDate() + 2);
  const event = await TourEvent.findOneAndUpdate(
    { eventCode: 'DEMO-SUNDARBANS-01' },
    {
      $setOnInsert: {
        tourTemplateId: template._id,
        busId: bus._id,
        hostId: host._id,
        eventCode: 'DEMO-SUNDARBANS-01',
        startDate: starts,
        endDate: ends,
        bookingOpenAt: new Date(),
        status: 'booking_open',
        currency: 'BDT',
        pickupPoints: [
          { name: 'Dhaka Main Pickup', address: 'Demo pickup point, Dhaka', time: '07:00' },
        ],
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  await HostProfile.updateOne(
    { _id: hostProfile._id },
    { $addToSet: { assignedEventIds: event._id } },
  );

  const layout = bus.layout.length === 45 ? bus.layout : createStandardPassengerSeatLayout();
  await EventSeat.bulkWrite(
    layout.map((seat) => ({
      updateOne: {
        filter: { eventId: event._id, seatNumber: seat.seatNumber },
        update: {
          $setOnInsert: {
            eventId: event._id,
            busId: bus._id,
            seatNumber: seat.seatNumber,
            status: 'available',
          },
        },
        upsert: true,
      },
    })),
    { ordered: false },
  );

  const booking = await Booking.findOneAndUpdate(
    { bookingCode: 'DEMO-BOOKING-01' },
    {
      $setOnInsert: {
        bookingCode: 'DEMO-BOOKING-01',
        customerId: guest._id,
        eventId: event._id,
        tourTemplateId: template._id,
        bookingType: 'single',
        personCount: 1,
        seatNumbers: ['A1'],
        guestDetails: [{ name: 'LTMS Demo Guest', phone: '+8801000000000' }],
        ...calculateBookingFinance({
          unitPrice: 6500,
          quantity: 1,
          amountReceived: 0,
          minimumAdvancePercent: 30,
        }),
        paymentStatus: 'unpaid',
        bookingStatus: 'pending',
        currency: 'BDT',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  await EventSeat.updateOne(
    { eventId: event._id, seatNumber: 'A1', status: 'available' },
    { $set: { status: 'reserved', bookingId: booking._id } },
  );
  await Notification.findOneAndUpdate(
    { userId: guest._id, 'metadata.seedKey': 'demo-booking-confirmed' },
    {
      $setOnInsert: {
        userId: guest._id,
        type: 'booking',
        title: 'Demo booking ready',
        bookingId: booking._id,
        eventId: event._id,
        message: 'Your sample Sundarbans tour booking is ready.',
        metadata: { seedKey: 'demo-booking-confirmed', bookingId: booking._id },
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  logger.info('Development seed complete', {
    adminId: admin._id.toString(),
    hostId: host._id.toString(),
    guestId: guest._id.toString(),
    eventId: event._id.toString(),
    busId: bus._id.toString(),
    seats: layout.length,
  });
}

seed()
  .catch((error: unknown) => {
    logger.error('Development seed failed', { error });
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
    await mongoose.connection.close().catch(() => undefined);
  });
