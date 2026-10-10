import { env } from '@/config/env.js';
import type { ChannelStatusInfo } from '../types/communication.types.js';

export function formatWhatsAppClickToChat(phone?: string, text?: string): string | undefined {
  if (!phone) return undefined;
  // Clean non-digit characters
  const cleanNumber = phone.replace(/\D/g, '');
  if (!cleanNumber) return undefined;
  const initialText = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${cleanNumber}${initialText}`;
}

export class ChannelConfigService {
  /**
   * Returns public contact links for frontend buttons and website visitors.
   * Only includes channels that are legitimately configured with a URL or phone.
   */
  static getPublicContactChannels() {
    const rawWaNumber = env.PUBLIC_WHATSAPP_NUMBER || '+8801819800000'; // Default company contact
    const defaultWaMessage =
      'Hello Labib Tour! I would like to inquire about your upcoming group tours.';
    const waUrl = formatWhatsAppClickToChat(rawWaNumber, defaultWaMessage);

    return {
      websiteChat: {
        enabled: true,
        label: 'Live Chat with AI / Team',
        labelBn: 'লাইভ চ্যাট (AI ও টিম)',
      },
      whatsapp: {
        enabled: Boolean(rawWaNumber),
        number: rawWaNumber,
        url: waUrl,
        label: 'WhatsApp Chat',
        labelBn: 'হোয়াটসঅ্যাপ চ্যাট',
      },
      facebook: {
        enabled: Boolean(env.PUBLIC_FACEBOOK_PAGE_URL),
        url: env.PUBLIC_FACEBOOK_PAGE_URL || 'https://facebook.com',
        label: 'Facebook Messenger',
        labelBn: 'মেসেঞ্জার চ্যাট',
      },
      instagram: {
        enabled: Boolean(env.PUBLIC_INSTAGRAM_URL),
        url: env.PUBLIC_INSTAGRAM_URL,
        label: 'Instagram Direct',
        labelBn: 'ইনস্টাগ্রাম মেসেজ',
      },
      telegram: {
        enabled: Boolean(env.PUBLIC_TELEGRAM_URL),
        url: env.PUBLIC_TELEGRAM_URL,
        label: 'Telegram Channel/Bot',
        labelBn: 'টেলিগ্রাম',
      },
    };
  }

  /**
   * Returns internal channel status for Admin Unified Inbox.
   * Clearly distinguishes configured live adapters from unconfigured channels.
   */
  static getAdminChannelStatuses(): ChannelStatusInfo[] {
    const hasMetaToken = Boolean(
      env.META_PAGE_ACCESS_TOKEN && env.META_PAGE_ACCESS_TOKEN.length > 10,
    );
    const hasMetaSecret = Boolean(env.META_APP_SECRET && env.META_APP_SECRET.length > 5);
    const hasWhatsAppId = Boolean(env.WHATSAPP_PHONE_NUMBER_ID);
    const hasTelegramToken = Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_BOT_TOKEN.length > 15);

    const statuses: ChannelStatusInfo[] = [
      {
        channel: 'website',
        name: 'Website Live Chat',
        configured: true,
        status: 'connected',
        description: 'Internal real-time Socket.IO live chat with AI Assistant and Guest Sessions.',
        details: { realtimeEngine: 'Socket.IO', persistentStore: 'MongoDB' },
      },
      {
        channel: 'whatsapp',
        name: 'WhatsApp Business Cloud API',
        configured: hasMetaToken && hasWhatsAppId,
        status: hasMetaToken && hasWhatsAppId ? 'connected' : 'not_configured',
        publicUrl: formatWhatsAppClickToChat(env.PUBLIC_WHATSAPP_NUMBER),
        description:
          hasMetaToken && hasWhatsAppId
            ? 'Official Meta WhatsApp Business Cloud API active.'
            : 'Meta Cloud API credentials pending. Click-to-chat active via official WhatsApp link.',
        details: {
          hasPhoneNumberId: hasWhatsAppId,
          hasAccessToken: hasMetaToken,
          businessAccountId: env.WHATSAPP_BUSINESS_ACCOUNT_ID ? 'Configured' : 'Missing',
        },
      },
      {
        channel: 'facebook',
        name: 'Facebook Messenger',
        configured: hasMetaToken && hasMetaSecret,
        status: hasMetaToken && hasMetaSecret ? 'connected' : 'not_configured',
        publicUrl: env.PUBLIC_FACEBOOK_PAGE_URL,
        description:
          hasMetaToken && hasMetaSecret
            ? 'Official Meta Graph Page Messaging API active.'
            : 'Meta Page Access Token or App Secret not configured.',
        details: { hasPageAccessToken: hasMetaToken, hasAppSecret: hasMetaSecret },
      },
      {
        channel: 'instagram',
        name: 'Instagram Direct Messages',
        configured: hasMetaToken && hasMetaSecret,
        status: hasMetaToken && hasMetaSecret ? 'connected' : 'not_configured',
        publicUrl: env.PUBLIC_INSTAGRAM_URL,
        description:
          hasMetaToken && hasMetaSecret
            ? 'Official Meta Instagram Messaging API active.'
            : 'Meta Professional Account access token not configured.',
        details: { hasAccessToken: hasMetaToken },
      },
      {
        channel: 'telegram',
        name: 'Telegram Bot API',
        configured: hasTelegramToken,
        status: hasTelegramToken ? 'connected' : 'not_configured',
        publicUrl: env.PUBLIC_TELEGRAM_URL,
        description: hasTelegramToken
          ? 'Telegram Bot Webhook adapter active.'
          : 'Telegram Bot Token not configured in environment.',
        details: {
          hasBotToken: hasTelegramToken,
          hasWebhookSecret: Boolean(env.TELEGRAM_WEBHOOK_SECRET),
        },
      },
    ];

    return statuses;
  }

  /**
   * Returns AI Assistant status and configuration details.
   */
  static getAiStatus() {
    const isConfigured = Boolean(
      env.AI_ENABLED &&
      (env.AI_PROVIDER === 'local' || (env.AI_API_KEY && env.AI_API_KEY.length > 5)),
    );

    return {
      enabled: env.AI_ENABLED,
      provider: env.AI_PROVIDER,
      model: env.AI_MODEL || (env.AI_PROVIDER === 'local' ? 'Knowledge-Engine-v1' : 'default'),
      status: isConfigured ? 'ready' : 'disabled',
      supportsBengali: true,
      supportsEnglish: true,
      humanHandoverEnabled: true,
    };
  }
}

export const channelConfigService = {
  getPublicContactChannels: () => ChannelConfigService.getPublicContactChannels(),
  getAdminChannelStatuses: () => ChannelConfigService.getAdminChannelStatuses(),
  getAiStatus: () => ChannelConfigService.getAiStatus(),
  formatWhatsAppNumber: (phone?: string) => (phone ? phone.replace(/\D/g, '') : ''),
  formatWhatsAppClickToChat,
};
