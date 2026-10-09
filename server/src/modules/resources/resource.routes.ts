import { Router } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { authenticate, authorize } from '@/middlewares/authenticate.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { ApiError } from '@/utils/ApiError.js';
import {
  Booking,
  Bus,
  Conversation,
  EventAnnouncement,
  EventSeat,
  LiveLocation,
  Message,
  Notification,
  Payment,
  Review,
  TourEvent,
  TourTemplate,
  User,
} from '@/models/index.js';
import { createBooking } from '@/modules/bookings/booking.service.js';
import { generateBookingPdf } from '@/modules/bookings/bookingPdf.service.js';
import { createTourEventSchema, createTourTemplateSchema } from '@/validators/index.js';
import { updateProfileSchema } from '@/validators/auth.validators.js';
import { getIO, ROOMS, emitNotification } from '@/sockets/index.js';

const router = Router();
const admin = authorize('admin', 'super_admin');
const host = authorize('host', 'admin', 'super_admin');
const objectId = z.string().regex(/^[\da-f]{24}$/i);
const paging = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
});
const envelope = (data: unknown) => ({ success: true, data });

router.get(
  '/users/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user!.id)
      .select('-passwordHash -refreshTokenHash -refreshTokenExpiresAt')
      .lean();
    if (!user) throw ApiError.notFound('User not found');
    res.json(envelope(user));
  }),
);
router.patch(
  '/users/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const update = updateProfileSchema.parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { $set: update },
      { new: true, runValidators: true },
    )
      .select('-passwordHash -refreshTokenHash -refreshTokenExpiresAt')
      .lean();
    if (!user) throw ApiError.notFound('User not found');
    res.json(envelope(user));
  }),
);
router.get(
  '/admin/users',
  authenticate,
  admin,
  asyncHandler(async (req, res) => {
    const { page, limit, search } = paging.parse(req.query);
    const term = search?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = term
      ? {
          $or: [
            { name: new RegExp(term, 'i') },
            { email: new RegExp(term, 'i') },
            { phone: new RegExp(term, 'i') },
          ],
        }
      : {};
    const [items, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash -refreshTokenHash -refreshTokenExpiresAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);
    res.json(
      envelope({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }),
    );
  }),
);
router.get(
  '/admin/users/:id',
  authenticate,
  admin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
      .select('-passwordHash -refreshTokenHash -refreshTokenExpiresAt')
      .lean();
    if (!user) throw ApiError.notFound('User not found');
    res.json(envelope(user));
  }),
);
router.patch(
  '/admin/users/:id/status',
  authenticate,
  admin,
  asyncHandler(async (req, res) => {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: { isActive },
        ...(isActive ? {} : { $unset: { refreshTokenHash: 1, refreshTokenExpiresAt: 1 } }),
      },
      { new: true },
    )
      .select('-passwordHash -refreshTokenHash -refreshTokenExpiresAt')
      .lean();
    if (!user) throw ApiError.notFound('User not found');
    res.json(envelope(user));
  }),
);

router.get(
  '/tours',
  asyncHandler(async (req, res) => {
    const { page, limit, search } = paging.parse(req.query);
    const term = search?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const filter = {
      isPublished: true,
      ...(term
        ? { $or: [{ title: new RegExp(term, 'i') }, { destination: new RegExp(term, 'i') }] }
        : {}),
    };
    const [items, total] = await Promise.all([
      TourTemplate.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      TourTemplate.countDocuments(filter),
    ]);
    res.json(
      envelope({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }),
    );
  }),
);
router.get(
  '/tours/:id',
  asyncHandler(async (req, res) => {
    if (!objectId.safeParse(req.params.id).success) throw ApiError.badRequest('Invalid tour id');
    const tour = await TourTemplate.findOne({ _id: req.params.id, isPublished: true }).lean();
    if (!tour) throw ApiError.notFound('Tour not found');
    res.json(envelope(tour));
  }),
);
router.get(
  '/admin/tours',
  authenticate,
  admin,
  asyncHandler(async (_req, res) =>
    res.json(envelope(await TourTemplate.find().sort({ createdAt: -1 }).lean())),
  ),
);
router.post(
  '/admin/tours',
  authenticate,
  admin,
  asyncHandler(async (req, res) => {
    const data = createTourTemplateSchema.parse(req.body);
    const slug = data.title
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const tour = await TourTemplate.create({ ...data, slug });
    res.status(201).json(envelope(tour));
  }),
);
router.patch(
  '/admin/tours/:id',
  authenticate,
  admin,
  asyncHandler(async (req, res) => {
    if (!objectId.safeParse(req.params.id).success) throw ApiError.badRequest('Invalid tour id');
    const tour = await TourTemplate.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!tour) throw ApiError.notFound('Tour not found');
    res.json(envelope(tour));
  }),
);
router.delete(
  '/admin/tours/:id',
  authenticate,
  admin,
  asyncHandler(async (req, res) => {
    const tour = await TourTemplate.findByIdAndUpdate(
      req.params.id,
      { $set: { isPublished: false } },
      { new: true },
    );
    if (!tour) throw ApiError.notFound('Tour not found');
    res.json(envelope(tour));
  }),
);

router.get(
  '/events',
  asyncHandler(async (req, res) => {
    const { page, limit } = paging.parse(req.query);
    const filter = {
      status: { $in: ['published', 'booking_open'] },
      startDate: { $gte: new Date() },
    };
    const [items, total] = await Promise.all([
      TourEvent.find(filter)
        .populate('tourTemplateId busId hostId')
        .sort({ startDate: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      TourEvent.countDocuments(filter),
    ]);
    res.json(
      envelope({ items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }),
    );
  }),
);
router.get(
  '/events/:id',
  asyncHandler(async (req, res) => {
    if (!objectId.safeParse(req.params.id).success) throw ApiError.badRequest('Invalid event id');
    const event = await TourEvent.findOne({ _id: req.params.id, status: { $ne: 'draft' } })
      .populate('tourTemplateId busId hostId')
      .lean();
    if (!event) throw ApiError.notFound('Event not found');
    res.json(envelope(event));
  }),
);
router.get(
  '/events/:id/seats',
  asyncHandler(async (req, res) => {
    if (!objectId.safeParse(req.params.id).success) throw ApiError.badRequest('Invalid event id');
    const seats = await EventSeat.find({ eventId: req.params.id }).sort({ seatNumber: 1 }).lean();
    res.json(envelope(seats));
  }),
);
router.get(
  '/host/events',
  authenticate,
  host,
  asyncHandler(async (req, res) =>
    res.json(
      envelope(
        await TourEvent.find({ hostId: req.user!.id })
          .populate('tourTemplateId busId')
          .sort({ startDate: 1 })
          .lean(),
      ),
    ),
  ),
);
router.get(
  '/guest/events',
  authenticate,
  authorize('guest'),
  asyncHandler(async (req, res) => {
    const eventIds = await Booking.distinct('eventId', { customerId: req.user!.id });
    res.json(
      envelope(
        await TourEvent.find({ _id: { $in: eventIds } })
          .populate('tourTemplateId busId')
          .sort({ startDate: 1 })
          .lean(),
      ),
    );
  }),
);
router.get(
  '/admin/events',
  authenticate,
  admin,
  asyncHandler(async (_req, res) =>
    res.json(
      envelope(
        await TourEvent.find()
          .populate('tourTemplateId busId hostId')
          .sort({ startDate: 1 })
          .lean(),
      ),
    ),
  ),
);
router.post(
  '/admin/events',
  authenticate,
  admin,
  asyncHandler(async (req, res) => {
    const data = createTourEventSchema.parse(req.body);
    const event = await TourEvent.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      ...(data.bookingCloseAt ? { bookingCloseAt: new Date(data.bookingCloseAt) } : {}),
    });
    const bus = await Bus.findById(data.busId).lean();
    if (!bus) {
      await event.deleteOne();
      throw ApiError.notFound('Bus not found');
    }
    await EventSeat.insertMany(
      bus.layout.map((seat) => ({
        eventId: event._id,
        busId: bus._id,
        seatNumber: seat.seatNumber,
        status: 'available',
      })),
      { ordered: false },
    );
    res.status(201).json(envelope(event));
  }),
);
router.patch(
  '/admin/events/:id',
  authenticate,
  admin,
  asyncHandler(async (req, res) => {
    if (!objectId.safeParse(req.params.id).success) throw ApiError.badRequest('Invalid event id');
    const event = await TourEvent.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!event) throw ApiError.notFound('Event not found');
    res.json(envelope(event));
  }),
);
router.delete(
  '/admin/events/:id',
  authenticate,
  admin,
  asyncHandler(async (req, res) => {
    const event = await TourEvent.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'cancelled' } },
      { new: true },
    );
    if (!event) throw ApiError.notFound('Event not found');
    res.json(envelope(event));
  }),
);

router.get(
  '/admin/buses',
  authenticate,
  admin,
  asyncHandler(async (_req, res) =>
    res.json(envelope(await Bus.find().sort({ createdAt: -1 }).lean())),
  ),
);
router.post(
  '/admin/buses',
  authenticate,
  admin,
  asyncHandler(async (req, res) => res.status(201).json(envelope(await Bus.create(req.body)))),
);
router.patch(
  '/admin/buses/:id',
  authenticate,
  admin,
  asyncHandler(async (req, res) => {
    if (!objectId.safeParse(req.params.id).success) throw ApiError.badRequest('Invalid bus id');
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!bus) throw ApiError.notFound('Bus not found');
    res.json(envelope(bus));
  }),
);
router.delete(
  '/admin/buses/:id',
  authenticate,
  admin,
  asyncHandler(async (req, res) => {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true },
    );
    if (!bus) throw ApiError.notFound('Bus not found');
    res.json(envelope(bus));
  }),
);

router.post(
  '/bookings',
  authenticate,
  authorize('guest', 'admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const idempotencyKey = (req.headers['idempotency-key'] as string) || req.body.idempotencyKey;
    const sessionId = (req.headers['x-seat-session-id'] as string) || req.body.sessionId;
    const booking = await createBooking(req.body, req.user!.id, { sessionId, idempotencyKey });
    res.status(201).json(envelope(booking));
  }),
);
router.get(
  '/bookings',
  authenticate,
  asyncHandler(async (req, res) => {
    const filter =
      req.user!.role === 'admin' || req.user!.role === 'super_admin'
        ? {}
        : req.user!.role === 'host'
          ? { eventId: { $in: await TourEvent.find({ hostId: req.user!.id }).distinct('_id') } }
          : { customerId: req.user!.id };
    res.json(
      envelope(
        await Booking.find(filter)
          .populate('eventId tourTemplateId')
          .sort({ createdAt: -1 })
          .lean(),
      ),
    );
  }),
);
router.get(
  '/bookings/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!objectId.safeParse(req.params.id).success) throw ApiError.badRequest('Invalid booking id');
    const booking = await Booking.findById(req.params.id).populate('eventId tourTemplateId').lean();
    if (!booking) throw ApiError.notFound('Booking not found');
    if (req.user!.role === 'guest' && String(booking.customerId) !== req.user!.id)
      throw ApiError.forbidden();
    if (req.user!.role === 'host') {
      const event = await TourEvent.exists({ _id: booking.eventId, hostId: req.user!.id });
      if (!event) throw ApiError.forbidden();
    }
    res.json(envelope(booking));
  }),
);

router.get(
  ['/bookings/:id/ticket.pdf', '/bookings/:id/ticket'],
  authenticate,
  asyncHandler(async (req, res) => {
    const rawId = req.params.id;
    const bookingId = typeof rawId === 'string' ? rawId : rawId?.[0];
    if (!bookingId || bookingId.length > 50) {
      throw ApiError.badRequest('Invalid booking identifier');
    }

    const { doc, filename } = await generateBookingPdf({
      bookingId,
      documentType: 'ticket',
      user: { id: req.user!.id, role: req.user!.role },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    doc.pipe(res);
  }),
);

router.get(
  ['/bookings/:id/receipt.pdf', '/bookings/:id/receipt'],
  authenticate,
  asyncHandler(async (req, res) => {
    const rawId = req.params.id;
    const bookingId = typeof rawId === 'string' ? rawId : rawId?.[0];
    if (!bookingId || bookingId.length > 50) {
      throw ApiError.badRequest('Invalid booking identifier');
    }

    const { doc, filename } = await generateBookingPdf({
      bookingId,
      documentType: 'receipt',
      user: { id: req.user!.id, role: req.user!.role },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    doc.pipe(res);
  }),
);

router.patch(
  '/bookings/:id/cancel',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!objectId.safeParse(req.params.id).success) throw ApiError.badRequest('Invalid booking id');
    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.user!.id,
      bookingStatus: 'pending',
    });
    if (!booking) throw ApiError.notFound('Pending booking not found');
    booking.bookingStatus = 'cancelled';
    await booking.save();
    await EventSeat.updateMany(
      { eventId: booking.eventId, bookingId: booking._id, status: 'reserved' },
      { $set: { status: 'available' }, $unset: { bookingId: 1 } },
    );
    res.json(envelope(booking));
  }),
);
router.get(
  '/host/events/:eventId/bookings',
  authenticate,
  host,
  asyncHandler(async (req, res) => {
    const event = await TourEvent.exists({ _id: req.params.eventId, hostId: req.user!.id });
    if (!event && !['admin', 'super_admin'].includes(req.user!.role)) throw ApiError.forbidden();
    res.json(
      envelope(
        await Booking.find({ eventId: req.params.eventId })
          .populate('customerId')
          .sort({ createdAt: -1 })
          .lean(),
      ),
    );
  }),
);
router.patch(
  '/admin/bookings/:id/status',
  authenticate,
  admin,
  asyncHandler(async (req, res) => {
    const status = z
      .enum(['pending', 'confirmed', 'cancelled', 'completed'])
      .parse(req.body.status);
    const current = await Booking.findById(req.params.id);
    if (!current) throw ApiError.notFound('Booking not found');
    if (status === 'confirmed' && current.receivedAmount < current.minimumAdvance)
      throw ApiError.conflict('The minimum advance must be recorded before confirmation');
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: { bookingStatus: status } },
      { new: true, runValidators: true },
    );
    if (!booking) throw ApiError.notFound('Booking not found');
    if (status === 'cancelled' && booking.receivedAmount === 0)
      await EventSeat.updateMany(
        { eventId: booking.eventId, bookingId: booking._id, status: 'reserved' },
        { $set: { status: 'available' }, $unset: { bookingId: 1 } },
      );
    res.json(envelope(booking));
  }),
);

router.get(
  '/notifications',
  authenticate,
  asyncHandler(async (req, res) =>
    res.json(
      envelope(
        await Notification.find({ userId: req.user!.id }).sort({ createdAt: -1 }).limit(100).lean(),
      ),
    ),
  ),
);
router.patch(
  '/notifications/:id/read',
  authenticate,
  asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true },
    );
    if (!notification) throw ApiError.notFound('Notification not found');
    res.json(envelope(notification));
  }),
);
router.patch(
  '/notifications/read-all',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await Notification.updateMany(
      { userId: req.user!.id, isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );
    res.json(envelope({ updatedCount: result.modifiedCount }));
  }),
);
router.get(
  '/conversations',
  authenticate,
  asyncHandler(async (req, res) =>
    res.json(
      envelope(
        await Conversation.find({ 'participants.userId': req.user!.id, isClosed: false })
          .sort({ lastMessageAt: -1 })
          .populate('participants.userId lastMessageId')
          .lean(),
      ),
    ),
  ),
);
router.post(
  '/events/:eventId/conversations',
  authenticate,
  authorize('guest', 'admin', 'super_admin'),
  asyncHandler(async (req, res) => {
    const event = await TourEvent.findById(req.params.eventId).select('hostId').lean();
    if (!event) throw ApiError.notFound('Event not found');
    const existing = await Conversation.findOne({
      eventId: event._id,
      'participants.userId': { $all: [req.user!.id, event.hostId] },
    });
    const conversation =
      existing ??
      (await Conversation.create({
        type: 'guest-host',
        eventId: event._id,
        participants: [
          {
            userId: req.user!.id,
            role: req.user!.role === 'super_admin' ? 'admin' : req.user!.role,
          },
          { userId: event.hostId, role: 'host' },
        ],
      }));
    res.status(existing ? 200 : 201).json(envelope(conversation));
  }),
);
router.get(
  '/conversations/:id/messages',
  authenticate,
  asyncHandler(async (req, res) => {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      'participants.userId': req.user!.id,
    });
    if (!conversation) throw ApiError.notFound('Conversation not found');
    const messages = await Message.find({ conversationId: conversation._id })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(500)
      .lean();
    res.json(envelope(messages));
  }),
);
router.post(
  '/conversations/:id/messages',
  authenticate,
  asyncHandler(async (req, res) => {
    const { content } = z.object({ content: z.string().trim().min(1).max(5000) }).parse(req.body);
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      'participants.userId': req.user!.id,
      isClosed: false,
    });
    if (!conversation) throw ApiError.notFound('Conversation not found');
    const message = await Message.create({
      conversationId: conversation._id,
      senderId: req.user!.id,
      content,
    });
    conversation.lastMessageId = message._id;
    conversation.lastMessageAt = message.createdAt;
    await conversation.save();
    res.status(201).json(envelope(message));
  }),
);
router.patch(
  '/conversations/:id/read',
  authenticate,
  asyncHandler(async (req, res) => {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      'participants.userId': req.user!.id,
    });
    if (!conversation) throw ApiError.notFound('Conversation not found');
    const now = new Date();
    await Conversation.updateOne(
      { _id: conversation._id, 'participants.userId': req.user!.id },
      { $set: { 'participants.$.lastReadAt': now } },
    );
    await Message.updateMany(
      {
        conversationId: conversation._id,
        senderId: { $ne: req.user!.id },
        readAt: { $exists: false },
      },
      { $set: { status: 'seen', readAt: now } },
    );
    res.json(envelope({ readAt: now.toISOString() }));
  }),
);
router.get(
  '/events/:eventId/announcements',
  asyncHandler(async (req, res) =>
    res.json(
      envelope(
        await EventAnnouncement.find({ eventId: req.params.eventId })
          .sort({ createdAt: -1 })
          .lean(),
      ),
    ),
  ),
);
router.post(
  '/host/events/:eventId/announcements',
  authenticate,
  host,
  asyncHandler(async (req, res) => {
    const { title, message } = z
      .object({
        title: z.string().trim().min(2).max(160),
        message: z.string().trim().min(2).max(5000),
      })
      .parse(req.body);
    const event = await TourEvent.findOne({
      _id: req.params.eventId,
      ...(['admin', 'super_admin'].includes(req.user!.role) ? {} : { hostId: req.user!.id }),
    });
    if (!event) throw ApiError.notFound('Event not found');
    const announcement = await EventAnnouncement.create({
      eventId: req.params.eventId,
      senderId: req.user!.id,
      title,
      message,
    });
    const customerIds = await Booking.distinct('customerId', {
      eventId: req.params.eventId,
      bookingStatus: { $in: ['confirmed', 'completed'] },
    });
    if (customerIds.length) {
      await Notification.insertMany(
        customerIds.map((userId) => ({
          userId,
          type: 'event_update',
          title,
          message,
          eventId: event._id,
          actionUrl: `/events/${event._id}`,
        })),
      );
    }

    try {
      const io = getIO();
      const eventIdStr = String(req.params.eventId);
      // Broadcast real-time announcement to all participants in this event room
      io.to(ROOMS.event(eventIdStr)).emit('event:announcement', {
        id: announcement._id.toString(),
        eventId: eventIdStr,
        senderId: req.user!.id,
        title,
        message,
        createdAt: announcement.createdAt.toISOString(),
      });

      // Push real-time notification to each affected customer's personal user room
      for (const customerId of customerIds) {
        emitNotification(customerId.toString(), {
          id: announcement._id.toString(),
          type: 'event_update',
          title,
          message,
          createdAt: announcement.createdAt.toISOString(),
          eventId: event._id.toString(),
          actionUrl: `/events/${event._id}`,
        });
      }
    } catch {
      // Degrade gracefully if socket server is unavailable
    }

    res.status(201).json(envelope(announcement));
  }),
);
router.get(
  '/reviews',
  asyncHandler(async (_req, res) =>
    res.json(
      envelope(
        await Review.find({ status: 'approved' })
          .populate('userId eventId')
          .sort({ createdAt: -1 })
          .limit(100)
          .lean(),
      ),
    ),
  ),
);
router.post(
  '/reviews',
  authenticate,
  authorize('guest'),
  asyncHandler(async (req, res) => {
    const data = z
      .object({
        bookingId: objectId,
        rating: z.number().int().min(1).max(5),
        title: z.string().max(120).optional(),
        comment: z.string().max(3000).optional(),
      })
      .parse(req.body);
    const booking = await Booking.findOne({
      _id: data.bookingId,
      customerId: req.user!.id,
      bookingStatus: 'completed',
    }).lean();
    if (!booking) throw ApiError.forbidden('A completed booking is required to review this event');
    res
      .status(201)
      .json(
        envelope(await Review.create({ ...data, userId: req.user!.id, eventId: booking.eventId })),
      );
  }),
);
router.patch(
  '/admin/reviews/:id/status',
  authenticate,
  admin,
  asyncHandler(async (req, res) => {
    const status = z.enum(['pending', 'approved', 'rejected']).parse(req.body.status);
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true },
    );
    if (!review) throw ApiError.notFound('Review not found');
    res.json(envelope(review));
  }),
);
router.get(
  '/admin/payments',
  authenticate,
  admin,
  asyncHandler(async (_req, res) =>
    res.json(
      envelope(
        await Payment.find()
          .populate('bookingId receivedBy')
          .sort({ createdAt: -1 })
          .limit(500)
          .lean(),
      ),
    ),
  ),
);
router.post(
  '/admin/bookings/:id/payments',
  authenticate,
  admin,
  asyncHandler(async (req, res) => {
    const input = z
      .object({
        amount: z.number().positive(),
        method: z.enum(['cash', 'bank', 'mobile_banking', 'other']),
        transactionId: z.string().trim().max(160).optional(),
        note: z.string().trim().max(1000).optional(),
      })
      .parse(req.body);
    const session = await mongoose.startSession();
    let result: { payment: unknown; booking: unknown } | undefined;
    try {
      await session.withTransaction(async () => {
        const booking = await Booking.findById(req.params.id).session(session);
        if (!booking) throw ApiError.notFound('Booking not found');
        if (input.amount > booking.dueAmount)
          throw ApiError.badRequest('Payment exceeds the remaining balance');
        const [payment] = await Payment.create(
          [{ bookingId: booking._id, ...input, receivedBy: req.user!.id, status: 'completed' }],
          { session },
        );
        booking.receivedAmount += input.amount;
        booking.dueAmount = Math.max(0, booking.totalAmount - booking.receivedAmount);
        booking.paymentStatus = booking.dueAmount === 0 ? 'paid' : 'partial';
        if (booking.receivedAmount >= booking.minimumAdvance && booking.bookingStatus === 'pending')
          booking.bookingStatus = 'confirmed';
        await booking.save({ session });
        result = { payment, booking };
      });
    } finally {
      await session.endSession();
    }
    if (!result) throw ApiError.internal('Payment transaction completed without a result');
    res.status(201).json(envelope(result));
  }),
);

const coordinates = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
  headingDegrees: z.number().min(0).max(360).optional(),
  speed: z.number().nonnegative().optional(),
});
router.post(
  '/host/events/:eventId/location/start',
  authenticate,
  host,
  asyncHandler(async (req, res) => {
    const point = coordinates.parse(req.body);
    const event = await TourEvent.findOne({ _id: req.params.eventId, hostId: req.user!.id }).lean();
    if (!event && !['admin', 'super_admin'].includes(req.user!.role)) throw ApiError.forbidden();
    if (!event) throw ApiError.notFound('Event not found');
    const location = await LiveLocation.findOneAndUpdate(
      { eventId: req.params.eventId },
      {
        $set: {
          ...point,
          eventId: req.params.eventId,
          hostId: req.user!.id,
          busId: event.busId,
          status: 'active',
          timestamp: new Date(),
        },
      },
      { upsert: true, new: true, runValidators: true },
    );
    res.status(201).json(envelope(location));
  }),
);
router.patch(
  '/host/events/:eventId/location',
  authenticate,
  host,
  asyncHandler(async (req, res) => {
    const point = coordinates.parse(req.body);
    const location = await LiveLocation.findOneAndUpdate(
      { eventId: req.params.eventId, hostId: req.user!.id, status: 'active' },
      { $set: { ...point, timestamp: new Date() } },
      { new: true, runValidators: true },
    );
    if (!location) throw ApiError.notFound('Active location session not found');
    res.json(envelope(location));
  }),
);
router.post(
  '/host/events/:eventId/location/stop',
  authenticate,
  host,
  asyncHandler(async (req, res) => {
    const location = await LiveLocation.findOneAndUpdate(
      { eventId: req.params.eventId, hostId: req.user!.id, status: 'active' },
      { $set: { status: 'inactive', timestamp: new Date() } },
      { new: true },
    );
    if (!location) throw ApiError.notFound('Active location session not found');
    res.json(envelope(location));
  }),
);
router.get(
  '/events/:eventId/location',
  authenticate,
  asyncHandler(async (req, res) => {
    if (!['admin', 'super_admin'].includes(req.user!.role)) {
      const booking = await Booking.exists({
        eventId: req.params.eventId,
        customerId: req.user!.id,
        bookingStatus: { $in: ['confirmed', 'completed'] },
      });
      if (!booking) throw ApiError.forbidden('A confirmed event booking is required');
    }
    const location = await LiveLocation.findOne({
      eventId: req.params.eventId,
      status: 'active',
    }).lean();
    if (!location) throw ApiError.notFound('No active location is available');
    res.json(envelope(location));
  }),
);

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address'),
  phone: z.string().trim().max(24).optional().or(z.literal('')),
  subject: z.string().trim().min(2, 'Subject must be at least 2 characters').max(150),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(3000),
});

router.post(
  '/contact',
  asyncHandler(async (req, res) => {
    const data = contactSchema.parse(req.body);

    try {
      const adminUsers = await User.find({ role: { $in: ['admin', 'super_admin'] } })
        .select('_id')
        .lean();
      if (adminUsers.length > 0) {
        await Notification.insertMany(
          adminUsers.map((admin) => ({
            userId: admin._id,
            type: 'system',
            title: `New Inquiry from ${data.name}`,
            message: `Subject: ${data.subject}\nFrom: ${data.email} (${data.phone || 'No phone'})\n${data.message.slice(0, 120)}...`,
            actionUrl: '/admin',
          })),
        );
      }
    } catch {
      // Graceful fallback if notification creation fails
    }

    res.status(200).json(
      envelope({
        received: true,
        message:
          'Thank you for contacting Labib Tour & Travel Group! Our travel advisory team will respond shortly.',
      }),
    );
  }),
);

export default router;
