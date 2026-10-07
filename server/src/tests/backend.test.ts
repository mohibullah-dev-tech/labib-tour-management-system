import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import express from 'express';
import test from 'node:test';
import { getDatabaseStatus } from '@/config/database.js';
import { createStandardPassengerSeatLayout } from '@/constants/index.js';
import { errorHandler } from '@/middlewares/errorHandler.js';
import { authorize } from '@/middlewares/authenticate.js';
import { createApp } from '@/app.js';
import {
  Booking,
  Bus,
  Conversation,
  EventAnnouncement,
  EventSeat,
  HostProfile,
  LiveLocation,
  Message,
  Notification,
  Payment,
  Review,
  TourEvent,
  TourTemplate,
  User,
} from '@/models/index.js';
import { calculateBookingFinance } from '@/modules/bookings/bookingFinance.js';
import { ApiError } from '@/utils/ApiError.js';
import { createBookingSchema, createTourEventSchema } from '@/validators/index.js';
import { registerSchema } from '@/validators/auth.validators.js';

test('canonical 45-seat layout keeps K3 marked as the aisle obstruction', () => {
  const layout = createStandardPassengerSeatLayout();
  assert.equal(layout.length, 45);
  assert.equal(new Set(layout.map((seat) => seat.seatNumber)).size, 45);
  assert.equal(
    layout
      .filter((seat) => seat.blocksAisle)
      .map((seat) => seat.seatNumber)
      .join(','),
    'K3',
  );
  assert.deepEqual(
    layout.slice(-5).map((seat) => seat.seatNumber),
    ['K1', 'K2', 'K3', 'K4', 'K5'],
  );
});

test('bus rejects layouts with duplicate or missing seats', async () => {
  const layout = createStandardPassengerSeatLayout();
  const validBus = new Bus({ registrationNumber: 'TEST-01', name: 'Test coach', layout: layout });
  await assert.doesNotReject(validBus.validate());
  const invalidBus = new Bus({
    registrationNumber: 'TEST-02',
    name: 'Broken coach',
    layout: [...layout.slice(0, 44), layout[0]],
  });
  await assert.rejects(invalidBus.validate(), /layout/);
});

test('event seat and latest-only event location have unique compound/singleton indexes', () => {
  const seatIndexes = EventSeat.schema.indexes();
  assert.ok(
    seatIndexes.some(
      ([keys, options]) => keys.eventId === 1 && keys.seatNumber === 1 && options?.unique,
    ),
  );
  assert.ok(
    LiveLocation.schema.indexes().some(([keys, options]) => keys.eventId === 1 && options?.unique),
  );
  assert.equal(TourEvent.schema.path('busId')?.isRequired, true);
  const roleValues = User.schema.path('role')?.options.enum as string[];
  assert.equal(roleValues.includes('super_admin'), true);
  assert.ok(
    TourTemplate.schema.indexes().some(([keys, options]) => keys.slug === 1 && options?.unique),
  );
  assert.ok(
    Payment.schema.indexes().some(([keys, options]) => keys.transactionId === 1 && options?.unique),
  );
  assert.ok(Notification.schema.indexes().some(([keys]) => keys.userId === 1 && keys.isRead === 1));
  assert.ok(Conversation.schema.indexes().some(([keys]) => keys['participants.userId'] === 1));
  assert.ok(
    Message.schema.indexes().some(([keys]) => keys.conversationId === 1 && keys.createdAt === -1),
  );
  assert.ok(EventAnnouncement.schema.indexes().some(([keys]) => keys.eventId === 1));
  assert.ok(
    Review.schema.indexes().some(([keys, options]) => keys.bookingId === 1 && options?.unique),
  );
  assert.equal(getDatabaseStatus(), 'disconnected');
});

test('required models validate their persistence fields without a database connection', async () => {
  const models = [
    User,
    HostProfile,
    TourTemplate,
    TourEvent,
    Booking,
    Payment,
    Review,
    Notification,
    Conversation,
    Message,
    EventAnnouncement,
    LiveLocation,
  ];
  for (const Model of models) {
    const document = new Model({});
    await assert.rejects(
      document.validate(),
      { name: 'ValidationError' },
      `${Model.modelName} should enforce required fields`,
    );
  }
});

test('valid user, tour, event, booking, payment, and messaging documents pass schema validation', async () => {
  const customerId = new User()._id;
  const hostId = new User()._id;
  const templateId = new TourTemplate()._id;
  const eventId = new TourEvent()._id;
  const bookingId = new Booking()._id;
  const conversationId = new Conversation()._id;
  const documents = [
    new User({
      name: 'Demo Guest',
      email: 'demo@example.com',
      passwordHash: 'hashed-only-value',
      role: 'guest',
    }),
    new HostProfile({ userId: hostId }),
    new TourTemplate({
      title: 'Coastal tour',
      slug: 'coastal-tour',
      description: 'A valid reusable tour template.',
      tourType: 'day',
      destination: 'Cox’s Bazar',
      durationDays: 1,
      pricing: { basePrice: 1000 },
    }),
    new TourEvent({
      tourTemplateId: templateId,
      busId: customerId,
      hostId,
      eventCode: 'EVT-100',
      startDate: new Date('2027-01-01T07:00:00Z'),
      endDate: new Date('2027-01-01T18:00:00Z'),
      status: 'booking_open',
      pickupPoints: [{ name: 'Main stop', address: 'Central road', time: '07:00' }],
    }),
    new EventSeat({ eventId, busId: customerId, seatNumber: 'A1', status: 'available' }),
    new Booking({
      bookingCode: 'LT-TEST-01',
      customerId,
      eventId,
      tourTemplateId: templateId,
      bookingType: 'single',
      personCount: 1,
      seatNumbers: ['A1'],
      guestDetails: [{ name: 'Demo Guest', phone: '+8801000000000' }],
      packagePrice: 1000,
      subtotal: 1000,
      discount: 0,
      totalAmount: 1000,
      minimumAdvancePercent: 30,
      minimumAdvance: 300,
      receivedAmount: 0,
      dueAmount: 1000,
    }),
    new Payment({ bookingId, amount: 300, method: 'mobile_banking', status: 'completed' }),
    new Review({ userId: customerId, eventId, bookingId, rating: 5 }),
    new Notification({
      userId: customerId,
      type: 'booking',
      title: 'Booking received',
      message: 'Your booking is pending.',
    }),
    new Conversation({
      type: 'guest-host',
      participants: [
        { userId: customerId, role: 'guest' },
        { userId: hostId, role: 'host' },
      ],
    }),
    new Message({ conversationId, senderId: customerId, content: 'Hello' }),
    new EventAnnouncement({
      eventId,
      senderId: hostId,
      title: 'Pickup update',
      message: 'Pickup begins at 7:00.',
    }),
    new LiveLocation({
      eventId,
      hostId,
      busId: customerId,
      latitude: 23.7,
      longitude: 90.4,
      status: 'active',
      timestamp: new Date(),
    }),
  ];
  for (const document of documents) await assert.doesNotReject(document.validate());
});

test('booking finance is computed from server prices with the minimum advance', () => {
  assert.deepEqual(calculateBookingFinance({ unitPrice: 1000, quantity: 2, amountReceived: 400 }), {
    packagePrice: 1000,
    subtotal: 2000,
    discount: 0,
    totalAmount: 2000,
    minimumAdvancePercent: 30,
    minimumAdvance: 600,
    receivedAmount: 400,
    dueAmount: 1600,
  });
  assert.throws(
    () => calculateBookingFinance({ unitPrice: -1, quantity: 1, amountReceived: 0 }),
    RangeError,
  );
});

test('request validators reject repeated seats and nonpositive event ranges', () => {
  const booking = createBookingSchema.safeParse({
    eventId: '64b7f267cf837e4a9811d001',
    bookingType: 'single',
    quantity: 2,
    seatNumbers: ['A1', 'A1'],
    guestDetails: [
      { name: 'One Person', phone: '+880100000001' },
      { name: 'Two Person', phone: '+880100000002' },
    ],
  });
  assert.equal(booking.success, false);
  const event = createTourEventSchema.safeParse({
    tourTemplateId: '64b7f267cf837e4a9811d001',
    busId: '64b7f267cf837e4a9811d002',
    hostId: '64b7f267cf837e4a9811d003',
    eventCode: 'EV-001',
    startDate: '2027-01-02T10:00:00Z',
    endDate: '2027-01-02T09:00:00Z',
    pickupPoints: [{ name: 'Station', address: 'Central road', time: '07:00' }],
  });
  assert.equal(event.success, false);
});

test('registration is guest-only and rejects client-supplied role escalation', () => {
  const valid = {
    name: 'Demo User',
    email: 'demo@example.com',
    phone: '+8801712345678',
    password: 'SecurePass123',
  };
  assert.equal(registerSchema.safeParse(valid).success, true);
  assert.equal(registerSchema.safeParse({ ...valid, role: 'admin' }).success, false);
});

test('protected auth endpoint rejects anonymous requests and RBAC rejects missing role', async (context) => {
  const server = createServer(createApp());
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(
    async () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  );
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const response = await fetch(`http://127.0.0.1:${address.port}/api/auth/me`);
  assert.equal(response.status, 401);
  const payload = (await response.json()) as { error: { code: string } };
  assert.equal(payload.error.code, 'UNAUTHORIZED');

  const app = express();
  app.get('/admin', authorize('admin', 'super_admin'), (_req, res) => res.sendStatus(204));
  app.use(errorHandler);
  const roleServer = createServer(app);
  await new Promise<void>((resolve) => roleServer.listen(0, '127.0.0.1', resolve));
  context.after(
    async () =>
      new Promise<void>((resolve, reject) =>
        roleServer.close((error) => (error ? reject(error) : resolve())),
      ),
  );
  const roleAddress = roleServer.address();
  assert.ok(roleAddress && typeof roleAddress !== 'string');
  const denied = await fetch(`http://127.0.0.1:${roleAddress.port}/admin`);
  assert.equal(denied.status, 401);
});

test('GET /api/health exposes API and database status without starting MongoDB', async (context) => {
  const server = createServer(createApp());
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(
    async () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  );
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
  const payload = (await response.json()) as {
    success: boolean;
    data: { api: string; database: string; environment: string };
  };
  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.data.api, 'ok');
  assert.equal(payload.data.database, 'disconnected');
  assert.ok(['development', 'production', 'test'].includes(payload.data.environment));
});

test('central error middleware returns the standard conflict response', async (context) => {
  const app = express();
  app.get('/conflict', (_req, _res, next) => next(ApiError.conflict('Seat was just booked')));
  app.use(errorHandler);
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  context.after(
    async () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  );
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const response = await fetch(`http://127.0.0.1:${address.port}/conflict`);
  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), {
    success: false,
    error: { code: 'CONFLICT', message: 'Seat was just booked' },
  });
});
