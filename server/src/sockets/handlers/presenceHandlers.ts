import type { Server as SocketIOServer, Socket } from 'socket.io';
import { ROOMS } from '../socketRooms.js';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from '../socketTypes.js';
import { presenceService } from '@/modules/presence/presence.service.js';

type IOServer = SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerPresenceHandlers(io: IOServer, socket: AppSocket): void {
  const user = socket.data.user;
  if (!user) return;

  // 1. Register presence upon connection
  const { summary } = presenceService.registerConnection(
    socket.id,
    user,
    socket.handshake.headers as Record<string, unknown>,
  );

  // Broadcast summary to everyone (public social proof count)
  io.emit('presence:summary', summary);

  // Broadcast detailed roster to admin room
  io.to(ROOMS.presenceAdmins()).emit('presence:roster', {
    items: presenceService.getRoster(),
    summary,
  });

  // If this connected user is an admin, immediately send them the current roster
  if (user.role === 'admin' || user.role === 'super_admin') {
    socket.emit('presence:roster', {
      items: presenceService.getRoster(),
      summary,
    });
  }

  // 2. Client activity updates (page transitions, route changes, idle/active status)
  socket.on('presence:activity', (payload, callback) => {
    const { summary: updatedSummary } = presenceService.updateActivity(socket.id, payload);

    // Broadcast updated activity to admin monitor
    io.to(ROOMS.presenceAdmins()).emit('presence:roster', {
      items: presenceService.getRoster(),
      summary: updatedSummary,
    });

    if (callback) {
      callback({ success: true });
    }
  });

  // 3. Cleanup upon disconnect
  socket.on('disconnect', () => {
    const { summary: afterDisconnectSummary } = presenceService.removeConnection(socket.id);

    // Broadcast updated counters to everyone
    io.emit('presence:summary', afterDisconnectSummary);

    // Broadcast updated roster to admin room
    io.to(ROOMS.presenceAdmins()).emit('presence:roster', {
      items: presenceService.getRoster(),
      summary: afterDisconnectSummary,
    });
  });
}
