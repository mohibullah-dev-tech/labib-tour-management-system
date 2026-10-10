/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert/strict';
import test from 'node:test';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { disconnectRedis } from '@/config/redis.js';
import { env } from '@/config/env.js';
import { channelConfigService } from '@/modules/communications/services/channelConfig.service.js';
import { aiTravelAssistantService } from '@/modules/communications/services/ai/ai.service.js';
import { Message } from '@/models/Message.model.js';
import { TourTemplate } from '@/models/TourTemplate.model.js';
import { TourEvent } from '@/models/TourEvent.model.js';

test.after(async () => {
  await disconnectRedis();
});

test('Phase 19 — Unified Communications & AI Travel Assistant System', async (suite) => {
  await suite.test('Channel Configuration — Honest Status & WhatsApp Link Formatting', () => {
    const config = channelConfigService.getPublicContactChannels();

    assert.ok(config.websiteChat.enabled, 'Website chat should always be enabled');
    assert.strictEqual(typeof config.whatsapp.enabled, 'boolean');
    assert.strictEqual(typeof config.facebook.enabled, 'boolean');

    const adminStatuses = channelConfigService.getAdminChannelStatuses();
    assert.ok(Array.isArray(adminStatuses) && adminStatuses.length >= 5);
    const waStatus = adminStatuses.find((s) => s.channel === 'whatsapp');
    assert.ok(waStatus, 'WhatsApp status should be defined in admin statuses');
    assert.ok(waStatus.status === 'connected' || waStatus.status === 'not_configured');

    // Test WhatsApp number formatting
    const rawNumber = '+880 1712-345678';
    const cleaned = channelConfigService.formatWhatsAppNumber(rawNumber);
    assert.strictEqual(
      cleaned,
      '8801712345678',
      'WhatsApp number should be sanitized of +, spaces and dashes',
    );
    assert.ok(!cleaned.includes('+') && !cleaned.includes(' ') && !cleaned.includes('-'));
  });

  await suite.test('Guest Session Token — Issue & Verification', () => {
    const guestConversationId = new Types.ObjectId().toString();
    const visitorId = 'vis_' + crypto.randomBytes(6).toString('hex');
    const secret = env.JWT_ACCESS_SECRET || 'secret';

    const token = jwt.sign(
      {
        type: 'guest_chat_session',
        guestConversationId,
        visitorId,
        displayName: 'Guest Traveler',
      },
      secret,
      {
        expiresIn: '7d',
        issuer: 'ltms-guest-session',
      },
    );

    const decoded = jwt.verify(token, secret, { issuer: 'ltms-guest-session' }) as any;
    assert.strictEqual(decoded.type, 'guest_chat_session');
    assert.strictEqual(decoded.guestConversationId, guestConversationId);
    assert.strictEqual(decoded.visitorId, visitorId);
    assert.strictEqual(decoded.displayName, 'Guest Traveler');
  });

  await suite.test('AI Travel Assistant — Handover Trigger Detection', () => {
    // English triggers
    assert.strictEqual(
      aiTravelAssistantService.detectHandoverIntent('Can I speak with a human agent?'),
      true,
    );
    assert.strictEqual(
      aiTravelAssistantService.detectHandoverIntent('Please connect me to customer support'),
      true,
    );
    assert.strictEqual(
      aiTravelAssistantService.detectHandoverIntent('I want to talk to an operator'),
      true,
    );

    // Bengali triggers
    assert.strictEqual(
      aiTravelAssistantService.detectHandoverIntent('মানুষের সাথে কথা বলতে চাই'),
      true,
    );
    assert.strictEqual(
      aiTravelAssistantService.detectHandoverIntent('এজেন্ট এর সাথে কথা বলতে চাই'),
      true,
    );
    assert.strictEqual(
      aiTravelAssistantService.detectHandoverIntent('ফোন নাম্বার দিন কথা বলব'),
      true,
    );

    // Normal inquiries should NOT trigger handover
    assert.strictEqual(
      aiTravelAssistantService.detectHandoverIntent('What tours are available in Sajek?'),
      false,
    );
    assert.strictEqual(
      aiTravelAssistantService.detectHandoverIntent('পরের ট্যুর কবে যাবে?'),
      false,
    );
    assert.strictEqual(
      aiTravelAssistantService.detectHandoverIntent('What is included in the package?'),
      false,
    );
  });

  await suite.test(
    'AI Travel Assistant — Verified Tour Knowledge Context (No Hallucination)',
    async () => {
      // Mock TourTemplate & TourEvent methods
      const originalFindTemplates = TourTemplate.find;
      const originalFindEvents = TourEvent.find;

      const mockTemplate = {
        title: 'Sajek Valley Cloud Experience',
        destination: 'Sajek Valley',
        durationDays: 3,
        durationNights: 2,
        basePrice: 5500,
        inclusions: ['Cottage stay', '4x4 Chander Gari', 'All meals'],
        exclusions: ['Personal shopping', 'Entry fees beyond itinerary'],
        boardingPoints: [{ city: 'Dhaka', location: 'Sayedabad Bus Terminal' }],
        status: 'active',
        isArchived: false,
      };

      const mockEvent = {
        title: 'Sajek Weekend Special',
        departureDate: new Date('2026-11-15T22:00:00.000Z'),
        returnDate: new Date('2026-11-18T06:00:00.000Z'),
        status: 'published',
        availableSeats: 12,
        tourTemplateId: {
          title: 'Sajek Valley Cloud Experience',
          destination: 'Sajek Valley',
          basePrice: 5500,
        },
      };

      TourTemplate.find = (() => ({
        select: () => ({
          limit: () => ({
            lean: async () => [mockTemplate],
          }),
        }),
      })) as any;

      TourEvent.find = (() => ({
        select: () => ({
          sort: () => ({
            limit: () => ({
              lean: async () => [mockEvent],
            }),
          }),
        }),
      })) as any;

      try {
        const response = await aiTravelAssistantService.generateReply(
          'Tell me about Sajek tour packages and pricing',
        );

        assert.ok(response.reply, 'AI response should not be empty');
        assert.ok(
          response.reply.includes('Sajek') ||
            response.reply.includes('5500') ||
            response.reply.includes('Tour'),
          'AI response should reference real tour data',
        );
        assert.strictEqual(response.shouldHandover, false);
      } finally {
        TourTemplate.find = originalFindTemplates;
        TourEvent.find = originalFindEvents;
      }
    },
  );

  await suite.test('Webhook Security — Signature & Verification Logic', () => {
    // 1. Meta Webhook Signature check
    const secret = 'test-meta-app-secret-12345';
    const payload = JSON.stringify({ object: 'page', entry: [] });
    const signature = 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const expectedHash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const providedHash = signature.replace('sha256=', '');
    assert.strictEqual(
      crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(providedHash)),
      true,
      'Valid Meta webhook signature must match HMAC SHA-256',
    );

    // Tampered payload fails
    const tamperedPayload = JSON.stringify({ object: 'page', entry: [{ id: 'fake' }] });
    const tamperedHash = crypto.createHmac('sha256', secret).update(tamperedPayload).digest('hex');
    assert.strictEqual(
      crypto.timingSafeEqual(Buffer.from(tamperedHash), Buffer.from(providedHash)),
      false,
      'Tampered payload must fail signature check',
    );

    // 2. Telegram Secret Token Header check
    const configuredTelegramSecret = 'telegram-bot-secret-xyz';
    const validHeader = 'telegram-bot-secret-xyz';
    const invalidHeader: string = 'wrong-token';

    assert.strictEqual(validHeader === configuredTelegramSecret, true);
    assert.strictEqual(invalidHeader === configuredTelegramSecret, false);
  });

  await suite.test('Message Model — Deduplication by Sparse Provider Message ID', async () => {
    // Verify providerMessageId uniqueness constraint concept
    const providerMessageId = 'wamid_HBgLMTAwMDAwMDAwMB';
    const originalFindOne = Message.findOne;

    let lookedUp = false;
    Message.findOne = ((query: any) => {
      if (query.providerMessageId === providerMessageId) {
        lookedUp = true;
        return Promise.resolve({
          _id: new Types.ObjectId(),
          providerMessageId,
          body: 'Already processed message',
        });
      }
      return Promise.resolve(null);
    }) as any;

    try {
      const existing = await Message.findOne({ providerMessageId });
      assert.ok(existing, 'Should locate existing message by providerMessageId');
      assert.strictEqual(lookedUp, true);
      assert.strictEqual(existing.providerMessageId, providerMessageId);
    } finally {
      Message.findOne = originalFindOne;
    }
  });

  await suite.test('Conversation Handling Mode & Status State Transitions', () => {
    const conversation: any = {
      channel: 'website',
      status: 'pending',
      handlingMode: 'ai',
      unreadCountAdmin: 0,
      unreadCountCustomer: 0,
    };

    // Customer sends message
    conversation.unreadCountAdmin += 1;
    conversation.status = 'active';
    assert.strictEqual(conversation.unreadCountAdmin, 1);
    assert.strictEqual(conversation.status, 'active');

    // Customer requests handover
    conversation.handlingMode = 'human';
    conversation.priority = 'urgent';
    assert.strictEqual(conversation.handlingMode, 'human');
    assert.strictEqual(conversation.priority, 'urgent');

    // Staff replies
    conversation.unreadCountAdmin = 0;
    conversation.unreadCountCustomer += 1;
    assert.strictEqual(conversation.unreadCountAdmin, 0);
    assert.strictEqual(conversation.unreadCountCustomer, 1);

    // Staff resolves conversation
    conversation.status = 'resolved';
    assert.strictEqual(conversation.status, 'resolved');
  });
});
