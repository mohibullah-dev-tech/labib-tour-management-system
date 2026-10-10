export type CommunicationChannel =
  'website' | 'whatsapp' | 'facebook' | 'instagram' | 'telegram' | 'internal';

export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type ConversationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type HandlingMode = 'ai' | 'human';
export type SenderType = 'customer' | 'staff' | 'ai' | 'system';

export interface ChannelStatusInfo {
  channel: CommunicationChannel;
  name: string;
  configured: boolean;
  status: 'connected' | 'not_configured' | 'error';
  publicUrl?: string;
  description: string;
  details?: Record<string, unknown>;
}

export interface PublicContactChannelItem {
  enabled: boolean;
  url?: string;
  number?: string;
  label: string;
  labelBn: string;
}

export interface PublicContactChannels {
  websiteChat: PublicContactChannelItem;
  whatsapp: PublicContactChannelItem;
  facebook: PublicContactChannelItem;
  instagram: PublicContactChannelItem;
  telegram: PublicContactChannelItem;
}

export interface MessageAttachment {
  name: string;
  url: string;
  mimeType: string;
  sizeBytes?: number;
}

export interface CommunicationMessage {
  id: string;
  _id?: string;
  conversationId: string;
  channel: CommunicationChannel;
  direction: 'inbound' | 'outbound';
  senderType: SenderType;
  senderId?: string;
  senderName?: string;
  providerMessageId?: string;
  content: string;
  attachments?: MessageAttachment[];
  status: 'sent' | 'delivered' | 'seen' | 'failed' | 'pending';
  deliveryError?: string;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
  metadata?: Record<string, unknown>;
}

export interface CommunicationConversation {
  id: string;
  _id: string;
  channel: CommunicationChannel;
  type: string;
  externalContactId?: string;
  customerDisplayName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  status: ConversationStatus;
  priority: ConversationPriority;
  handlingMode: HandlingMode;
  tags?: string[];
  bookingId?: {
    _id: string;
    bookingReference: string;
    bookingStatus: string;
    totalAmount: number;
    receivedAmount: number;
    dueAmount: number;
  };
  eventId?: {
    _id: string;
    title: string;
    destination: string;
    departureDate: string;
    pricing?: { basePrice: number };
  };
  title?: string;
  lastMessageId?: CommunicationMessage;
  lastMessageAt?: string;
  unreadCountAdmin: number;
  unreadCountCustomer: number;
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
}
