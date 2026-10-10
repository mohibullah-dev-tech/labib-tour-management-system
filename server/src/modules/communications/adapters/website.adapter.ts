import type { ChannelAdapter, ChannelAdapterResult } from './base.adapter.js';
import type { OutboundMessagePayload } from '../types/communication.types.js';

export class WebsiteChannelAdapter implements ChannelAdapter {
  readonly channel = 'website' as const;

  isConfigured(): boolean {
    return true;
  }

  async sendMessage(_payload: OutboundMessagePayload): Promise<ChannelAdapterResult> {
    // Website chat messages are broadcast directly to the conversation room via Socket.io
    return {
      success: true,
      providerMessageId: `web_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
  }
}
