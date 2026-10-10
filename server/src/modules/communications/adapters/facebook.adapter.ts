import crypto from 'node:crypto';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';
import type { ChannelAdapter, ChannelAdapterResult } from './base.adapter.js';
import type { OutboundMessagePayload } from '../types/communication.types.js';

export class FacebookChannelAdapter implements ChannelAdapter {
  readonly channel = 'facebook' as const;

  isConfigured(): boolean {
    return Boolean(env.META_PAGE_ACCESS_TOKEN && env.META_PAGE_ACCESS_TOKEN.length > 10);
  }

  static verifySignature(rawBody: string | Buffer, signatureHeader?: string): boolean {
    if (!env.META_APP_SECRET) return true;
    if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;

    const signature = signatureHeader.slice('sha256='.length);
    const expected = crypto.createHmac('sha256', env.META_APP_SECRET).update(rawBody).digest('hex');

    try {
      return crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expected, 'utf8'));
    } catch {
      return false;
    }
  }

  async sendMessage(payload: OutboundMessagePayload): Promise<ChannelAdapterResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Facebook Page Messaging API is not configured',
      };
    }

    if (!payload.recipientContactId) {
      return {
        success: false,
        error: 'Recipient PSID is required for Facebook Messenger delivery',
      };
    }

    try {
      const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${env.META_PAGE_ACCESS_TOKEN}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: payload.recipientContactId },
          message: { text: payload.content },
          messaging_type: 'RESPONSE',
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        const msg = errorData?.error?.message || `Meta Messenger HTTP ${response.status}`;
        logger.error('Facebook Messenger send failure', { error: msg });
        return { success: false, error: msg };
      }

      const resData = (await response.json()) as { message_id?: string };
      const messageId = resData?.message_id;

      return {
        success: true,
        providerMessageId: messageId || `fb_${Date.now()}`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Facebook network error';
      logger.error('Facebook API network exception', { error: msg });
      return { success: false, error: msg };
    }
  }
}
