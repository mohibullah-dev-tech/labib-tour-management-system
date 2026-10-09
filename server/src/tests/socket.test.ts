/* eslint-disable @typescript-eslint/no-explicit-any */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server as HttpServer } from 'node:http';
import jwt from 'jsonwebtoken';
import { io as ioClient, type Socket as ClientSocket } from 'socket.io-client';
import { env } from '@/config/env.js';
import { initSocketServer, closeSocketServer } from '@/sockets/index.js';
import { User, TourEvent, Booking, Conversation, Message, LiveLocation } from '@/models/index.js';
import {
  broadcastSeatLocked,
  broadcastSeatReleased,
  broadcastSeatBooked,
} from '@/sockets/handlers/seatHandlers.js';
import { emitNotification } from '@/sockets/handlers/notificationHandlers.js';
import type {
  ServerLocationUpdatePayload,
  SeatLockedPayload,
  MessagePayload,
  NotificationPayload,
} from '@/sockets/socketTypes.js';

function createToken(userId: string, role: string = 'guest'): string {
  return jwt.sign({ sub: userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
    issuer: 'ltms-api',
    audience: 'ltms-client',
  });
}

test('Socket.IO Real-time Suite', async (suite) => {
  const httpServer: HttpServer = createServer();
  let port: number;
  let serverUrl: string;

  const mockGuestId = '66f5c09a8912345678900001';
  const mockHostId = '66f5c09a8912345678900002';
  const mockAdminId = '66f5c09a8912345678900003';
  const mockOtherId = '66f5c09a8912345678900004';
  const mockEventId = '66f5c09a89123456789abc01';
  const mockConvId = '66f5c09a89123456789ccc01';

  // Save original model methods
  const origUserFindById = User.findById;
  const origTourEventExists = TourEvent.exists;
  const origTourEventFindById = TourEvent.findById;
  const origTourEventFindOne = TourEvent.findOne;
  const origBookingExists = Booking.exists;
  const origConvFindById = Conversation.findById;
  const origConvExists = Conversation.exists;
  const origConvUpdateOne = Conversation.updateOne;
  const origMessageCreate = Message.create;
  const origMessageUpdateOne = Message.updateOne;
  const origLiveLocationFindOneAndUpdate = LiveLocation.findOneAndUpdate;
  const origLiveLocationUpdateOne = LiveLocation.updateOne;

  // Setup Mocks
  User.findById = ((id: string) => ({
    select: () => ({
      lean: async () => {
        if (id === mockGuestId) {
          return {
            _id: mockGuestId,
            name: 'Guest User',
            email: 'guest@example.com',
            role: 'guest',
            isActive: true,
          };
        }
        if (id === mockHostId) {
          return {
            _id: mockHostId,
            name: 'Rahim Host',
            email: 'host@example.com',
            role: 'host',
            isActive: true,
          };
        }
        if (id === mockAdminId) {
          return {
            _id: mockAdminId,
            name: 'Super Admin',
            email: 'admin@example.com',
            role: 'admin',
            isActive: true,
          };
        }
        if (id === mockOtherId) {
          return {
            _id: mockOtherId,
            name: 'Other User',
            email: 'other@example.com',
            role: 'guest',
            isActive: true,
          };
        }
        return null;
      },
    }),
  })) as any;

  TourEvent.findOne = ((query: any) => ({
    select: () => ({
      lean: async () => {
        if (query._id === mockEventId && query.hostId === mockHostId) {
          return { _id: mockEventId, status: 'ongoing', busId: '66f5c09a89123456789bus01' };
        }
        return null;
      },
    }),
  })) as any;

  TourEvent.exists = (async (query: any) => {
    if (query._id === mockEventId && query.hostId === mockHostId) return true;
    return false;
  }) as any;

  TourEvent.findById = ((id: string) => ({
    select: () => ({
      lean: async () => {
        if (id === mockEventId) {
          return { _id: mockEventId, busId: '66f5c09a89123456789bus01', hostId: mockHostId };
        }
        return null;
      },
    }),
  })) as any;

  Booking.exists = (async (query: any) => {
    if (query.eventId === mockEventId && query.customerId === mockGuestId) return true;
    return false;
  }) as any;

  Conversation.exists = (async (query: any) => {
    if (query._id === mockConvId) {
      if (
        query['participants.userId'] === mockGuestId ||
        query['participants.userId'] === mockHostId
      ) {
        return true;
      }
    }
    return false;
  }) as any;

  Conversation.findById = ((id: string) => ({
    _id: id,
    isClosed: false,
    participants: [{ userId: mockGuestId }, { userId: mockHostId }],
    save: async () => {},
  })) as any;

  Conversation.updateOne = (async () => ({})) as any;

  Message.create = (async (doc: any) => ({
    _id: '66f5c09a89123456789msg01',
    ...doc,
    createdAt: new Date(),
  })) as any;

  Message.updateOne = (async () => ({})) as any;

  LiveLocation.findOneAndUpdate = (async () => ({})) as any;
  LiveLocation.updateOne = (async () => ({})) as any;

  // Start HTTP and Socket.IO server on dynamic port
  initSocketServer(httpServer);

  await new Promise<void>((resolve) => {
    httpServer.listen(0, () => {
      const addr = httpServer.address();
      if (typeof addr === 'object' && addr !== null) {
        port = addr.port;
        serverUrl = `http://127.0.0.1:${port}`;
      }
      resolve();
    });
  });

  suite.after(async () => {
    await closeSocketServer();
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));

    // Restore models
    User.findById = origUserFindById;
    TourEvent.exists = origTourEventExists;
    TourEvent.findById = origTourEventFindById;
    TourEvent.findOne = origTourEventFindOne;
    Booking.exists = origBookingExists;
    Conversation.findById = origConvFindById;
    Conversation.exists = origConvExists;
    Conversation.updateOne = origConvUpdateOne;
    Message.create = origMessageCreate;
    Message.updateOne = origMessageUpdateOne;
    LiveLocation.findOneAndUpdate = origLiveLocationFindOneAndUpdate;
    LiveLocation.updateOne = origLiveLocationUpdateOne;
  });

  await suite.test('Authentication: reject connection without valid token', async () => {
    await new Promise<void>((resolve) => {
      const client = ioClient(serverUrl, {
        auth: {},
        transports: ['websocket'],
        reconnection: false,
      });

      client.on('connect_error', (err) => {
        assert.equal(err.message, 'UNAUTHORIZED');
        client.close();
        resolve();
      });
    });
  });

  await suite.test('Authentication: reject connection with expired/invalid token', async () => {
    await new Promise<void>((resolve) => {
      const client = ioClient(serverUrl, {
        auth: { token: 'invalid.jwt.token' },
        transports: ['websocket'],
        reconnection: false,
      });

      client.on('connect_error', (err) => {
        assert.equal(err.message, 'INVALID_TOKEN');
        client.close();
        resolve();
      });
    });
  });

  await suite.test(
    'Authentication: connect successfully with valid JWT and auto-join user room',
    async () => {
      const token = createToken(mockGuestId, 'guest');
      const client = ioClient(serverUrl, {
        auth: { token },
        transports: ['websocket'],
        reconnection: false,
      });

      await new Promise<void>((resolve, reject) => {
        client.on('connect', () => {
          assert.ok(client.connected);
          client.close();
          resolve();
        });
        client.on('connect_error', reject);
      });
    },
  );

  await suite.test(
    'Room Authorization: event:join allowed for booked guest, rejected for non-booked',
    async () => {
      const guestToken = createToken(mockGuestId, 'guest');
      const otherToken = createToken(mockOtherId, 'guest');

      const guestClient: ClientSocket = ioClient(serverUrl, {
        auth: { token: guestToken },
        transports: ['websocket'],
      });
      const otherClient: ClientSocket = ioClient(serverUrl, {
        auth: { token: otherToken },
        transports: ['websocket'],
      });

      await new Promise<void>((resolve) => guestClient.on('connect', resolve));
      await new Promise<void>((resolve) => otherClient.on('connect', resolve));

      // Booked guest joins
      const guestJoinResult: any = await new Promise((resolve) => {
        guestClient.emit('event:join', { eventId: mockEventId }, resolve);
      });
      assert.equal(guestJoinResult.success, true);

      // Non-booked guest joins
      const otherJoinResult: any = await new Promise((resolve) => {
        otherClient.emit('event:join', { eventId: mockEventId }, resolve);
      });
      assert.equal(otherJoinResult.success, false);
      assert.equal(otherJoinResult.error?.code, 'FORBIDDEN');

      guestClient.close();
      otherClient.close();
    },
  );

  await suite.test(
    'Seat Lock Broadcaster: clients receive seat:locked, seat:released, seat:booked',
    async () => {
      const guestToken = createToken(mockGuestId, 'guest');
      const guestClient: ClientSocket = ioClient(serverUrl, {
        auth: { token: guestToken },
        transports: ['websocket'],
      });

      await new Promise<void>((resolve) => guestClient.on('connect', resolve));

      // Join event room
      await new Promise((resolve) =>
        guestClient.emit('event:join', { eventId: mockEventId }, resolve),
      );

      // Test seat:locked reception
      const lockedPromise = new Promise<SeatLockedPayload>((resolve) => {
        guestClient.on('seat:locked', (payload) => resolve(payload));
      });

      broadcastSeatLocked(mockEventId, ['A1', 'A2'], new Date(Date.now() + 600000).toISOString());
      const lockedPayload = await lockedPromise;
      assert.equal(lockedPayload.eventId, mockEventId);
      assert.deepEqual(lockedPayload.seats, ['A1', 'A2']);
      assert.equal(lockedPayload.lockedBy, 'held'); // Anonymous

      // Test seat:released reception
      const releasedPromise = new Promise<any>((resolve) => {
        guestClient.on('seat:released', resolve);
      });
      broadcastSeatReleased(mockEventId, ['A1']);
      const releasedPayload = await releasedPromise;
      assert.deepEqual(releasedPayload.seats, ['A1']);

      // Test seat:booked reception
      const bookedPromise = new Promise<any>((resolve) => {
        guestClient.on('seat:booked', resolve);
      });
      broadcastSeatBooked(mockEventId, ['A1', 'A2'], 'mockBooking123');
      const bookedPayload = await bookedPromise;
      assert.deepEqual(bookedPayload.seats, ['A1', 'A2']);
      assert.equal(bookedPayload.bookingId, 'mockBooking123');

      guestClient.close();
    },
  );

  await suite.test(
    'Live Location: Host start, update, and stop with listener delivery',
    async () => {
      const hostToken = createToken(mockHostId, 'host');
      const guestToken = createToken(mockGuestId, 'guest');

      const hostClient: ClientSocket = ioClient(serverUrl, {
        auth: { token: hostToken },
        transports: ['websocket'],
      });
      const guestClient: ClientSocket = ioClient(serverUrl, {
        auth: { token: guestToken },
        transports: ['websocket'],
      });

      await new Promise<void>((resolve) => hostClient.on('connect', resolve));
      await new Promise<void>((resolve) => guestClient.on('connect', resolve));

      // Guest joins event
      await new Promise((resolve) =>
        guestClient.emit('event:join', { eventId: mockEventId }, resolve),
      );

      // Prepare location listener on guest
      const startedPromise = new Promise<any>((resolve) =>
        guestClient.on('location:started', resolve),
      );
      const updatePromise = new Promise<ServerLocationUpdatePayload>((resolve) =>
        guestClient.on('location:update', resolve),
      );
      const stoppedPromise = new Promise<any>((resolve) =>
        guestClient.on('location:stopped', resolve),
      );

      // Host starts sharing
      const startResult: any = await new Promise((resolve) => {
        hostClient.emit(
          'location:start',
          { eventId: mockEventId, initialCoords: { latitude: 23.8103, longitude: 90.4125 } },
          resolve,
        );
      });
      assert.equal(startResult.success, true);
      const startNotice = await startedPromise;
      assert.equal(startNotice.eventId, mockEventId);

      // Host sends update
      hostClient.emit('location:update', {
        eventId: mockEventId,
        latitude: 23.82,
        longitude: 90.42,
        accuracy: 5,
        speed: 40,
      });
      const updatePayload = await updatePromise;
      assert.equal(updatePayload.eventId, mockEventId);
      assert.equal(updatePayload.latitude, 23.82);
      assert.equal(updatePayload.status, 'active');

      // Host stops sharing
      const stopResult: any = await new Promise((resolve) => {
        hostClient.emit('location:stop', { eventId: mockEventId, reason: 'host_stopped' }, resolve);
      });
      assert.equal(stopResult.success, true);
      const stopNotice = await stoppedPromise;
      assert.equal(stopNotice.reason, 'host_stopped');

      hostClient.close();
      guestClient.close();
    },
  );

  await suite.test(
    'Messaging & Typing: Real-time chat between conversation participants',
    async () => {
      const guestToken = createToken(mockGuestId, 'guest');
      const hostToken = createToken(mockHostId, 'host');

      const guestClient: ClientSocket = ioClient(serverUrl, {
        auth: { token: guestToken },
        transports: ['websocket'],
      });
      const hostClient: ClientSocket = ioClient(serverUrl, {
        auth: { token: hostToken },
        transports: ['websocket'],
      });

      await new Promise<void>((resolve) => guestClient.on('connect', resolve));
      await new Promise<void>((resolve) => hostClient.on('connect', resolve));

      // Both participants join conversation room
      const guestJoinConv: any = await new Promise((resolve) =>
        guestClient.emit('conversation:join', { conversationId: mockConvId }, resolve),
      );
      assert.equal(guestJoinConv.success, true);
      const hostJoinConv: any = await new Promise((resolve) =>
        hostClient.emit('conversation:join', { conversationId: mockConvId }, resolve),
      );
      assert.equal(hostJoinConv.success, true);

      // Typing listener on host
      const typingPromise = new Promise<any>((resolve) => {
        hostClient.on('message:typing', resolve);
      });
      guestClient.emit('message:typing', { conversationId: mockConvId });
      const typingPayload = await typingPromise;
      assert.equal(typingPayload.conversationId, mockConvId);
      assert.equal(typingPayload.userId, mockGuestId);

      // Host listens for message:new
      const messagePromise = new Promise<MessagePayload>((resolve) => {
        hostClient.on('message:new', resolve);
      });

      // Guest sends message
      const sendAck: any = await new Promise((resolve) => {
        guestClient.emit(
          'message:send',
          {
            conversationId: mockConvId,
            content: 'Hello tour host!',
          },
          resolve,
        );
      });
      assert.equal(sendAck.success, true);
      assert.ok(sendAck.data?.messageId);

      const receivedMessage = await messagePromise;
      assert.equal(receivedMessage.content, 'Hello tour host!');
      assert.equal(receivedMessage.senderId, mockGuestId);

      guestClient.close();
      hostClient.close();
    },
  );

  await suite.test('Notifications: Real-time delivery to user personal room', async () => {
    const guestToken = createToken(mockGuestId, 'guest');
    const guestClient: ClientSocket = ioClient(serverUrl, {
      auth: { token: guestToken },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve) => guestClient.on('connect', resolve));

    const notifPromise = new Promise<NotificationPayload>((resolve) => {
      guestClient.on('notification:new', resolve);
    });

    const mockNotif: NotificationPayload = {
      id: 'notif_12345',
      type: 'event_update',
      title: 'Bus Departure Delayed',
      message: 'Bus departure has been rescheduled by 15 minutes.',
      createdAt: new Date().toISOString(),
      eventId: mockEventId,
    };

    emitNotification(mockGuestId, mockNotif);

    const receivedNotif = await notifPromise;
    assert.equal(receivedNotif.id, 'notif_12345');
    assert.equal(receivedNotif.title, 'Bus Departure Delayed');

    guestClient.close();
  });
});
