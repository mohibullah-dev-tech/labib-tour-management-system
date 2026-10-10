import type { CommunicationChannel, SenderType } from '@/constants/index.js';

export interface ChannelStatusInfo {
  channel: CommunicationChannel;
  name: string;
  configured: boolean;
  status: 'connected' | 'not_configured' | 'error';
  publicUrl?: string;
  description: string;
  details?: Record<string, unknown>;
}

export interface InboundMessagePayload {
  channel: CommunicationChannel;
  externalContactId: string;
  customerDisplayName?: string;
  customerPhone?: string;
  customerEmail?: string;
  content: string;
  providerMessageId?: string;
  attachments?: Array<{
    name: string;
    url: string;
    mimeType: string;
    sizeBytes?: number;
  }>;
  metadata?: Record<string, unknown>;
}

export interface OutboundMessagePayload {
  conversationId: string;
  channel: CommunicationChannel;
  content: string;
  recipientContactId?: string;
  senderType: SenderType;
  senderId?: string;
  senderName?: string;
  attachments?: Array<{
    name: string;
    url: string;
    mimeType: string;
    sizeBytes?: number;
  }>;
}

export interface GuestSessionClaims {
  sessionId: string;
  name?: string;
  email?: string;
  phone?: string;
  conversationId?: string;
}

export interface AIResponseResult {
  reply: string;
  shouldHandover: boolean;
  handoverReason?: string;
  confidence: number;
  sourcesUsed: string[];
}
