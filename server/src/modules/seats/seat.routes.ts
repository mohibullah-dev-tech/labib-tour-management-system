import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authenticateOptional } from '@/middlewares/authenticate.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { SeatLockService } from '@/modules/seats/seatLock.service.js';

const router = Router();

const objectIdSchema = z.string().regex(/^[\da-f]{24}$/i, 'Invalid MongoDB ObjectId');

const lockSeatsSchema = z.object({
  seatNumbers: z.array(z.string().min(2).max(4)).min(1).max(10),
  sessionId: z.string().trim().optional(),
});

const releaseSeatsSchema = z.object({
  seatNumbers: z.array(z.string().min(2).max(4)).min(1).max(45),
  sessionId: z.string().trim().optional(),
});

const heartbeatSchema = z.object({
  seatNumbers: z.array(z.string().min(2).max(4)).min(1).max(10),
  sessionId: z.string().trim().optional(),
});

/**
 * GET /api/events/:eventId/seats
 * Get real-time seat availability combining MongoDB and Redis locks.
 */
router.get(
  '/events/:eventId/seats',
  authenticateOptional,
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    objectIdSchema.parse(eventId);
    const sessionId = typeof req.query.sessionId === 'string' ? req.query.sessionId : undefined;

    const seats = await SeatLockService.getEventSeatStatuses({
      eventId,
      userId: req.user?.id,
      sessionId,
    });

    res.json({
      success: true,
      data: seats,
    });
  }),
);

/**
 * POST /api/events/:eventId/seats/lock
 * Acquire temporary atomic lock on requested passenger seats.
 */
router.post(
  '/events/:eventId/seats/lock',
  authenticate,
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    objectIdSchema.parse(eventId);
    const { seatNumbers, sessionId } = lockSeatsSchema.parse(req.body);

    const lockResult = await SeatLockService.lockSeats({
      eventId,
      seatNumbers,
      userId: req.user!.id,
      sessionId,
    });

    res.status(200).json({
      success: true,
      data: lockResult,
    });
  }),
);

/**
 * POST /api/events/:eventId/seats/release
 * Release temporary locks owned by the authenticated user / session.
 */
router.post(
  '/events/:eventId/seats/release',
  authenticateOptional,
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    objectIdSchema.parse(eventId);
    const { seatNumbers, sessionId } = releaseSeatsSchema.parse(req.body);

    const result = await SeatLockService.releaseSeats({
      eventId,
      seatNumbers,
      userId: req.user?.id || '',
      sessionId,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  }),
);

/**
 * POST /api/events/:eventId/seats/heartbeat
 * Extend active seat locks for the current user/session.
 */
router.post(
  '/events/:eventId/seats/heartbeat',
  authenticateOptional,
  asyncHandler(async (req, res) => {
    const eventId = String(req.params.eventId);
    objectIdSchema.parse(eventId);
    const { seatNumbers, sessionId } = heartbeatSchema.parse(req.body);

    const result = await SeatLockService.heartbeatSeats({
      eventId,
      seatNumbers,
      userId: req.user?.id || '',
      sessionId,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  }),
);

export default router;
