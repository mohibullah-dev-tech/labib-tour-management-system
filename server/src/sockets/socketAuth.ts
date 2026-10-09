import jwt from 'jsonwebtoken';
import type { Socket } from 'socket.io';
import { env } from '@/config/env.js';
import { User, TourEvent, Booking, Conversation } from '@/models/index.js';
import { ROOMS } from './socketRooms.js';
import type {
  SocketData,
  SocketUser,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
} from './socketTypes.js';
import { logger } from '@/utils/logger.js';
import type { UserRole } from '@/constants/index.js';

interface AccessClaims extends jwt.JwtPayload {
  sub: string;
  tokenUse?: string;
}

/**
 * Socket.IO authentication middleware.
 * Verifies JWT access token, validates active account in DB,
 * and sets up authenticated socket user state.
 */
export async function socketAuthMiddleware(
  socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>,
  next: (err?: Error) => void,
): Promise<void> {
  try {
    const authPayload = socket.handshake.auth as { token?: string } | undefined;
    const headerAuth = socket.handshake.headers.authorization;
    let token = authPayload?.token;

    if (!token && headerAuth?.startsWith('Bearer ')) {
      token = headerAuth.slice('Bearer '.length);
    }

    if (!token) {
      return next(new Error('UNAUTHORIZED'));
    }

    let claims: AccessClaims;
    try {
      claims = jwt.verify(token, env.JWT_ACCESS_SECRET, {
        issuer: 'ltms-api',
        audience: 'ltms-client',
      }) as AccessClaims;
    } catch (err: unknown) {
      if (err instanceof jwt.TokenExpiredError) {
        return next(new Error('TOKEN_EXPIRED'));
      }
      return next(new Error('INVALID_TOKEN'));
    }

    if (!claims.sub) {
      return next(new Error('INVALID_TOKEN'));
    }

    const user = await User.findById(claims.sub).select('name email role isActive').lean();
    if (!user || !user.isActive) {
      return next(new Error('UNAUTHORIZED'));
    }

    socket.data.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
    };
    socket.data.joinedRooms = new Set<string>();

    // Automatically join personal user room for direct notifications
    const personalRoom = ROOMS.user(socket.data.user.id);
    await socket.join(personalRoom);
    socket.data.joinedRooms.add(personalRoom);

    next();
  } catch (error) {
    logger.error('Socket authentication exception', { error });
    next(new Error('SERVER_ERROR'));
  }
}

/**
 * Verifies if a user has legitimate access to an event.
 * - Admin / Super Admin: Always allowed
 * - Host: Allowed only if assigned to this event
 * - Guest: Allowed only if they hold an active/pending/confirmed/completed booking for this event
 */
export async function verifyEventAccess(user: SocketUser, eventId: string): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'super_admin') {
    return true;
  }

  if (user.role === 'host') {
    const isAssigned = await TourEvent.exists({ _id: eventId, hostId: user.id });
    return Boolean(isAssigned);
  }

  if (user.role === 'guest') {
    const hasBooking = await Booking.exists({
      eventId,
      customerId: user.id,
      bookingStatus: { $in: ['confirmed', 'pending', 'completed'] },
    });
    return Boolean(hasBooking);
  }

  return false;
}

/**
 * Specifically verifies that the user is the designated host of the event.
 * Used for live location broadcasting.
 */
export async function verifyHostAssignedToEvent(hostId: string, eventId: string): Promise<boolean> {
  const event = await TourEvent.findOne({ _id: eventId, hostId }).select('status').lean();
  if (!event) return false;
  // Location sharing only permitted for published, booking_open, or ongoing tours
  return ['published', 'booking_open', 'ongoing'].includes(event.status);
}

/**
 * Verifies if a user has access to participate in a conversation.
 */
export async function verifyConversationAccess(
  user: SocketUser,
  conversationId: string,
): Promise<boolean> {
  if (user.role === 'admin' || user.role === 'super_admin') {
    return true;
  }

  const isParticipant = await Conversation.exists({
    _id: conversationId,
    'participants.userId': user.id,
    isClosed: false,
  });

  return Boolean(isParticipant);
}
