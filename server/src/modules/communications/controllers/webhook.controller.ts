import { env } from '@/config/env.js';
import { logger } from '@/utils/logger.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { ApiError } from '@/utils/ApiError.js';
import { WhatsAppChannelAdapter } from '../adapters/whatsapp.adapter.js';
import { TelegramChannelAdapter } from '../adapters/telegram.adapter.js';
import { MessageService } from '../services/message.service.js';

export class WebhookController {
  /**
   * Meta Webhook Verification (WhatsApp, Facebook, Instagram).
   * Responds to Meta challenge during webhook subscription setup.
   */
  static verifyMeta = asyncHandler(async (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const expectedVerifyToken = env.META_VERIFY_TOKEN || 'ltms_meta_verify_token_2026';

    if (mode === 'subscribe' && token === expectedVerifyToken) {
      logger.info('Meta webhook verification handshake successful');
      res.status(200).send(challenge);
      return;
    }

    logger.warn('Meta webhook verification rejected: token mismatch', { receivedToken: token });
    throw ApiError.forbidden('Invalid Meta verification token');
  });

  /**
   * Handles incoming Meta Webhooks (WhatsApp Cloud API, Facebook Messenger, Instagram Direct).
   */
  static handleMeta = asyncHandler(async (req, res) => {
    // 1. Signature Verification
    const signature = req.headers['x-hub-signature-256'] as string | undefined;
    const rawBody =
      (req as unknown as { rawBody?: Buffer | string }).rawBody || JSON.stringify(req.body);

    if (env.META_APP_SECRET && !WhatsAppChannelAdapter.verifySignature(rawBody, signature)) {
      logger.warn('Meta webhook rejected: invalid X-Hub-Signature-256');
      throw ApiError.unauthorized('Invalid webhook signature');
    }

    // 2. Fast acknowledgement to prevent Meta retries
    res.status(200).send('EVENT_RECEIVED');

    const body = req.body;

    // 3. Process WhatsApp events
    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value;
          if (value?.messages) {
            for (const msg of value.messages) {
              if (msg.type === 'text') {
                const contact = value.contacts?.find(
                  (c: { wa_id?: string; profile?: { name?: string } }) => c.wa_id === msg.from,
                );
                await MessageService.processInboundMessage({
                  channel: 'whatsapp',
                  externalContactId: msg.from,
                  customerDisplayName: contact?.profile?.name || `WhatsApp (+${msg.from})`,
                  customerPhone: msg.from,
                  providerMessageId: msg.id,
                  content: msg.text.body,
                });
              }
            }
          }
        }
      }
      return;
    }

    // 4. Process Facebook Messenger & Instagram Direct events
    if (body.object === 'page' || body.object === 'instagram') {
      const channel = body.object === 'instagram' ? 'instagram' : 'facebook';
      const entries = body.entry || [];
      for (const entry of entries) {
        const messaging = entry.messaging || [];
        for (const event of messaging) {
          if (event.message && !event.message.is_echo) {
            const senderPsid = event.sender?.id;
            const text = event.message.text;
            const mid = event.message.mid;

            if (senderPsid && text) {
              await MessageService.processInboundMessage({
                channel,
                externalContactId: senderPsid,
                customerDisplayName: `${channel === 'instagram' ? 'Instagram' : 'Facebook'} User (${senderPsid.slice(-4)})`,
                providerMessageId: mid,
                content: text,
              });
            }
          }
        }
      }
    }
  });

  /**
   * Handles incoming Telegram Bot Webhooks.
   */
  static handleTelegram = asyncHandler(async (req, res) => {
    // 1. Verify Secret Token
    const secretHeader = req.headers['x-telegram-bot-api-secret-token'] as string | undefined;
    if (env.TELEGRAM_WEBHOOK_SECRET && !TelegramChannelAdapter.verifySecretToken(secretHeader)) {
      logger.warn('Telegram webhook rejected: secret token mismatch');
      throw ApiError.unauthorized('Invalid Telegram secret token');
    }

    // Fast 200 OK to Telegram
    res.status(200).json({ ok: true });

    const update = req.body;
    const message = update.message;

    if (message && message.text) {
      const chatId = String(message.chat.id);
      const from = message.from;
      const displayName =
        [from?.first_name, from?.last_name].filter(Boolean).join(' ') ||
        from?.username ||
        `Telegram User (${chatId})`;

      await MessageService.processInboundMessage({
        channel: 'telegram',
        externalContactId: chatId,
        customerDisplayName: displayName,
        providerMessageId: String(message.message_id),
        content: message.text,
      });
    }
  });
}
