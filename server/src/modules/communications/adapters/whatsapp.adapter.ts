import crypto from 'node:crypto';
import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';
import type { ChannelAdapter, ChannelAdapterResult } from './base.adapter.js';
import type { OutboundMessagePayload } from '../types/communication.types.js';

export class WhatsAppChannelAdapter implements ChannelAdapter {
  readonly channel = 'whatsapp' as const;

  isConfigured(): boolean {
    return Boolean(
      env.META_PAGE_ACCESS_TOKEN &&
      env.WHATSAPP_PHONE_NUMBER_ID &&
      env.META_PAGE_ACCESS_TOKEN.length > 10,
    );
  }

  /**
   * Verifies Meta X-Hub-Signature-256 header.
   */
  static verifySignature(rawBody: string | Buffer, signatureHeader?: string): boolean {
    if (!env.META_APP_SECRET) return true; // In development if secret not set, permit
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
      logger.warn(
        'WhatsApp adapter sendMessage skipped: credentials not configured in environment',
      );
      return {
        success: false,
        error: 'WhatsApp Business Cloud API is not configured in server environment',
      };
    }

    const recipientPhone = payload.recipientContactId?.replace(/\D/g, '');
    if (!recipientPhone) {
      return {
        success: false,
        error: 'Valid recipient phone number is required for WhatsApp delivery',
      };
    }

    try {
      const url = `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.META_PAGE_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipientPhone,
          type: 'text',
          text: { preview_url: false, body: payload.content },
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: { message?: string };
        };
        const msg = errorData?.error?.message || `Meta WhatsApp HTTP ${response.status}`;
        logger.error('WhatsApp message send failure', { error: msg, recipientPhone });
        return { success: false, error: msg };
      }

      const resData = (await response.json()) as { messages?: Array<{ id?: string }> };
      const wamid = resData?.messages?.[0]?.id;

      return {
        success: true,
        providerMessageId: wamid || `wa_${Date.now()}`,
        metadata: { wamid },
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'WhatsApp network error';
      logger.error('WhatsApp API network exception', { error: msg });
      return { success: false, error: msg };
    }
  }
}
