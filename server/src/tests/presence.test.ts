import assert from 'node:assert/strict';
import test from 'node:test';
import { presenceService } from '@/modules/presence/presence.service.js';

test('Real-Time Active Presence & Online Users System', async (suite) => {
  await suite.test('PresenceService: registers connections and tracks role breakdown', () => {
    // 1. Register Guest
    const guestResult = presenceService.registerConnection(
      'socket_guest_1',
      { id: 'u_gst_1', name: 'Farhana Guest', email: 'guest@example.com', role: 'guest' },
      { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    );

    assert.strictEqual(guestResult.presence.name, 'Farhana Guest');
    assert.strictEqual(guestResult.presence.device, 'Desktop');
    assert.strictEqual(guestResult.presence.role, 'guest');

    // 2. Register Host
    const hostResult = presenceService.registerConnection(
      'socket_host_1',
      { id: 'u_host_1', name: 'Rahim Host', email: 'host@example.com', role: 'host' },
      { 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) Mobile/15E148' },
    );

    assert.strictEqual(hostResult.presence.role, 'host');
    assert.strictEqual(hostResult.presence.device, 'Mobile');

    // 3. Register Admin
    const adminResult = presenceService.registerConnection('socket_admin_1', {
      id: 'u_adm_1',
      name: 'Central Admin',
      email: 'admin@example.com',
      role: 'admin',
    });

    assert.strictEqual(adminResult.presence.role, 'admin');

    // 4. Register Anonymous Visitor
    const visitorResult = presenceService.registerConnection('socket_vis_1', {
      id: 'vis_anon_1',
      name: 'Website Visitor',
      role: 'visitor',
      isVisitor: true,
    });

    assert.strictEqual(visitorResult.presence.isVisitor, true);

    const summary = presenceService.getSummary();
    assert.ok(summary.totalOnline >= 4);
    assert.ok(summary.guestsCount >= 1);
    assert.ok(summary.hostsCount >= 1);
    assert.ok(summary.adminsCount >= 1);
    assert.ok(summary.visitorsCount >= 1);
  });

  await suite.test('PresenceService: updates current route and activity status', () => {
    const updated = presenceService.updateActivity('socket_guest_1', {
      currentPath: '/tours/sajek-valley-experience',
      pageTitle: 'Sajek Valley Cloud Tour',
      status: 'active',
    });

    assert.ok(updated.presence);
    assert.strictEqual(updated.presence?.currentPath, '/tours/sajek-valley-experience');
    assert.strictEqual(updated.presence?.pageTitle, 'Sajek Valley Cloud Tour');
  });

  await suite.test('PresenceService: returns roster sorted by latest activity', () => {
    const roster = presenceService.getRoster();
    assert.ok(Array.isArray(roster));
    assert.ok(roster.length >= 4);

    // Most recently active should be at top
    assert.strictEqual(roster[0].socketId, 'socket_guest_1');
  });

  await suite.test('PresenceService: deregisters on disconnect and updates counters', () => {
    const { removed, summary: afterRemove } = presenceService.removeConnection('socket_vis_1');
    assert.ok(removed);
    assert.ok(afterRemove);
    assert.strictEqual(removed?.socketId, 'socket_vis_1');

    // Clean up test sockets
    presenceService.removeConnection('socket_guest_1');
    presenceService.removeConnection('socket_host_1');
    presenceService.removeConnection('socket_admin_1');

    const finalSummary = presenceService.getSummary();
    assert.strictEqual(finalSummary.guestsCount, 0);
    assert.strictEqual(finalSummary.hostsCount, 0);
    assert.strictEqual(finalSummary.adminsCount, 0);
  });
});
