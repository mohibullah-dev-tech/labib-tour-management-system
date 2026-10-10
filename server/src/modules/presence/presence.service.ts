import type { SocketUser, ActiveUserPresence, PresenceSummary } from '@/sockets/socketTypes.js';

class PresenceService {
  private activeUsers = new Map<string, ActiveUserPresence>();

  /**
   * Registers a connected socket with user identity.
   */
  registerConnection(
    socketId: string,
    user: SocketUser,
    handshakeHeaders?: Record<string, unknown>,
  ): { presence: ActiveUserPresence; summary: PresenceSummary } {
    const userAgent = String(handshakeHeaders?.['user-agent'] || '');
    const isMobile = /mobile|iphone|android|ipod|ipad|windows phone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const device = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop';

    const now = new Date().toISOString();
    const presence: ActiveUserPresence = {
      socketId,
      userId: user.id,
      name: user.name || (user.isVisitor ? 'Website Visitor' : 'User'),
      email: user.email,
      role: user.role || (user.isVisitor ? 'visitor' : 'guest'),
      isVisitor: Boolean(user.isVisitor),
      currentPath: user.isVisitor ? '/' : user.role === 'admin' ? '/admin' : '/dashboard',
      pageTitle: 'Home',
      device,
      connectedAt: now,
      lastActiveAt: now,
      status: 'active',
    };

    this.activeUsers.set(socketId, presence);
    return { presence, summary: this.getSummary() };
  }

  /**
   * Updates an active user's current route or activity status.
   */
  updateActivity(
    socketId: string,
    update: {
      currentPath?: string;
      pageTitle?: string;
      status?: 'active' | 'idle';
      device?: string;
    },
  ): { presence: ActiveUserPresence | null; summary: PresenceSummary } {
    const existing = this.activeUsers.get(socketId);
    if (!existing) {
      return { presence: null, summary: this.getSummary() };
    }

    if (update.currentPath) existing.currentPath = update.currentPath;
    if (update.pageTitle) existing.pageTitle = update.pageTitle;
    if (update.status) existing.status = update.status;
    if (update.device) existing.device = update.device;
    existing.lastActiveAt = new Date().toISOString();

    return { presence: existing, summary: this.getSummary() };
  }

  /**
   * Deregisters a disconnected socket.
   */
  removeConnection(socketId: string): {
    removed: ActiveUserPresence | null;
    summary: PresenceSummary;
  } {
    const removed = this.activeUsers.get(socketId) || null;
    this.activeUsers.delete(socketId);
    return { removed, summary: this.getSummary() };
  }

  /**
   * Computes an overview summary of all online users.
   */
  getSummary(): PresenceSummary {
    let guestsCount = 0;
    let hostsCount = 0;
    let adminsCount = 0;
    let visitorsCount = 0;

    for (const user of this.activeUsers.values()) {
      if (user.isVisitor || user.role === 'visitor') {
        visitorsCount++;
      } else if (user.role === 'guest') {
        guestsCount++;
      } else if (user.role === 'host') {
        hostsCount++;
      } else if (user.role === 'admin' || user.role === 'super_admin') {
        adminsCount++;
      } else {
        visitorsCount++;
      }
    }

    return {
      totalOnline: this.activeUsers.size,
      guestsCount,
      hostsCount,
      adminsCount,
      visitorsCount,
    };
  }

  /**
   * Returns complete active user roster, sorted by latest activity.
   */
  getRoster(): ActiveUserPresence[] {
    return Array.from(this.activeUsers.values()).sort(
      (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
    );
  }
}

export const presenceService = new PresenceService();
