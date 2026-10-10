import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';
import type { ChannelAdapter, ChannelAdapterResult } from './base.adapter.js';
import type { OutboundMessagePayload } from '../types/communication.types.js';

export class TelegramChannelAdapter implements ChannelAdapter {
  readonly channel = 'telegram' as const;

  isConfigured(): boolean {
    return Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_BOT_TOKEN.length > 10);
  }

  /**
   * Validates incoming Telegram Webhook Secret Token header
   */
  static verifySecretToken(secretHeader?: string): boolean {
    if (!env.TELEGRAM_WEBHOOK_SECRET) return true;
    return secretHeader === env.TELEGRAM_WEBHOOK_SECRET;
  }

  async sendMessage(payload: OutboundMessagePayload): Promise<ChannelAdapterResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Telegram Bot Token is not configured',
      };
    }

    const chatId = payload.recipientContactId;
    if (!chatId) {
      return {
        success: false,
        error: 'Telegram chat_id is required for outbound messaging',
      };
    }

    try {
      const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: payload.content,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { description?: string };
        const msg = errorData?.description || `Telegram API HTTP ${response.status}`;
        logger.error('Telegram sendMessage failure', { error: msg, chatId });
        return { success: false, error: msg };
      }

      const resData = (await response.json()) as { result?: { message_id?: number } };
      const messageId = resData?.result?.message_id;

      return {
        success: true,
        providerMessageId: messageId ? String(messageId) : `tg_${Date.now()}`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Telegram network error';
      logger.error('Telegram network exception', { error: msg });
      return { success: false, error: msg };
    }
  }
}
