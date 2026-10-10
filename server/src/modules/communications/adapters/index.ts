import type { CommunicationChannel } from '@/constants/index.js';
import type { ChannelAdapter } from './base.adapter.js';
import { WebsiteChannelAdapter } from './website.adapter.js';
import { WhatsAppChannelAdapter } from './whatsapp.adapter.js';
import { FacebookChannelAdapter } from './facebook.adapter.js';
import { InstagramChannelAdapter } from './instagram.adapter.js';
import { TelegramChannelAdapter } from './telegram.adapter.js';

export * from './base.adapter.js';
export * from './website.adapter.js';
export * from './whatsapp.adapter.js';
export * from './facebook.adapter.js';
export * from './instagram.adapter.js';
export * from './telegram.adapter.js';

const adapters: Record<CommunicationChannel, ChannelAdapter> = {
  website: new WebsiteChannelAdapter(),
  whatsapp: new WhatsAppChannelAdapter(),
  facebook: new FacebookChannelAdapter(),
  instagram: new InstagramChannelAdapter(),
  telegram: new TelegramChannelAdapter(),
  internal: new WebsiteChannelAdapter(),
};

export function getChannelAdapter(channel: CommunicationChannel): ChannelAdapter {
  return adapters[channel] || adapters.website;
}
