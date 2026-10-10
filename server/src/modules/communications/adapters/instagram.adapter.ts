import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';
import type { ChannelAdapter, ChannelAdapterResult } from './base.adapter.js';
import type { OutboundMessagePayload } from '../types/communication.types.js';

export class InstagramChannelAdapter implements ChannelAdapter {
  readonly channel = 'instagram' as const;

  isConfigured(): boolean {
    return Boolean(env.META_PAGE_ACCESS_TOKEN && env.META_PAGE_ACCESS_TOKEN.length > 10);
  }

  async sendMessage(payload: OutboundMessagePayload): Promise<ChannelAdapterResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Instagram Messaging API is not configured',
      };
    }

    if (!payload.recipientContactId) {
      return {
        success: false,
        error: 'Recipient Instagram IGSID is required for Instagram delivery',
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
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        const msg = errorData?.error?.message || `Instagram API HTTP ${response.status}`;
        logger.error('Instagram send failure', { error: msg });
        return { success: false, error: msg };
      }

      const resData = (await response.json()) as { message_id?: string };
      return {
        success: true,
        providerMessageId: resData?.message_id || `ig_${Date.now()}`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Instagram network error';
      logger.error('Instagram network exception', { error: msg });
      return { success: false, error: msg };
    }
  }
}
