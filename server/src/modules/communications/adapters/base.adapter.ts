import type { CommunicationChannel } from '@/constants/index.js';
import type { OutboundMessagePayload } from '../types/communication.types.js';

export interface ChannelAdapterResult {
  success: boolean;
  providerMessageId?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ChannelAdapter {
  readonly channel: CommunicationChannel;
  isConfigured(): boolean;
  sendMessage(payload: OutboundMessagePayload): Promise<ChannelAdapterResult>;
}
