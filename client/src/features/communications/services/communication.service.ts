import { apiClient } from '@/lib/axios';
import type {
  ChannelStatusInfo,
  CommunicationConversation,
  CommunicationMessage,
  PublicContactChannels,
} from '../types/communication.types';

export interface WebsiteSessionResponse {
  sessionId: string;
  token: string;
  conversationId: string;
  conversation: CommunicationConversation;
}

export interface ConversationListResponse {
  items: CommunicationConversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const communicationService = {
  /**
   * Public: Fetches configured public contact channels (WhatsApp, Messenger, etc.)
   */
  async getPublicChannels(): Promise<PublicContactChannels> {
    const { data } = await apiClient.get<{ success: boolean; data: PublicContactChannels }>(
      '/communications/public/channels',
    );
    return data.data;
  },

  /**
   * Public/Guest: Creates or restores a website visitor chat session.
   */
  async createWebsiteSession(input?: {
    sessionId?: string;
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<WebsiteSessionResponse> {
    const { data } = await apiClient.post<{ success: boolean; data: WebsiteSessionResponse }>(
      '/communications/website/session',
      input || {},
    );
    return data.data;
  },

  /**
   * Public/Guest: Fetches messages for website chat session.
   */
  async getWebsiteMessages(
    conversationId: string,
    sessionToken: string,
  ): Promise<CommunicationMessage[]> {
    const { data } = await apiClient.get<{ success: boolean; data: CommunicationMessage[] }>(
      `/communications/website/conversations/${conversationId}/messages`,
      {
        headers: { 'x-guest-session': sessionToken },
      },
    );
    return data.data;
  },

  /**
   * Public/Guest: Sends message in website chat session.
   */
  async sendWebsiteMessage(
    conversationId: string,
    sessionToken: string,
    content: string,
  ): Promise<CommunicationMessage> {
    const { data } = await apiClient.post<{ success: boolean; data: CommunicationMessage }>(
      `/communications/website/conversations/${conversationId}/messages`,
      { content },
      {
        headers: { 'x-guest-session': sessionToken },
      },
    );
    return data.data;
  },

  /**
   * Public/Guest: Requests human handover from AI to support staff.
   */
  async requestHandover(
    conversationId: string,
  ): Promise<{ success: boolean; handlingMode: string }> {
    const { data } = await apiClient.post<{
      success: boolean;
      data: { success: boolean; handlingMode: string };
    }>(`/communications/website/conversations/${conversationId}/handover`);
    return data.data;
  },

  // ==========================================
  // Admin Unified Inbox API
  // ==========================================

  /**
   * Admin: Lists conversations with search and channel/status filters.
   */
  async listAdminConversations(params?: {
    channel?: string;
    status?: string;
    priority?: string;
    handlingMode?: string;
    assignedTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ConversationListResponse> {
    const { data } = await apiClient.get<{ success: boolean; data: ConversationListResponse }>(
      '/communications/admin/conversations',
      { params },
    );
    return data.data;
  },

  /**
   * Admin: Gets single conversation details.
   */
  async getAdminConversation(id: string): Promise<CommunicationConversation> {
    const { data } = await apiClient.get<{ success: boolean; data: CommunicationConversation }>(
      `/communications/admin/conversations/${id}`,
    );
    return data.data;
  },

  /**
   * Admin: Gets message thread for conversation.
   */
  async getAdminConversationMessages(id: string): Promise<CommunicationMessage[]> {
    const { data } = await apiClient.get<{ success: boolean; data: CommunicationMessage[] }>(
      `/communications/admin/conversations/${id}/messages`,
    );
    return data.data;
  },

  /**
   * Admin: Sends staff reply.
   */
  async sendStaffReply(conversationId: string, content: string): Promise<CommunicationMessage> {
    const { data } = await apiClient.post<{ success: boolean; data: CommunicationMessage }>(
      `/communications/admin/conversations/${conversationId}/messages`,
      { content },
    );
    return data.data;
  },

  /**
   * Admin: Assigns conversation to staff member.
   */
  async assignStaff(
    conversationId: string,
    assignedTo?: string | null,
  ): Promise<CommunicationConversation> {
    const { data } = await apiClient.patch<{ success: boolean; data: CommunicationConversation }>(
      `/communications/admin/conversations/${conversationId}/assignment`,
      { assignedTo },
    );
    return data.data;
  },

  /**
   * Admin: Updates conversation status (open, pending, resolved, closed).
   */
  async updateStatus(
    conversationId: string,
    status: 'open' | 'pending' | 'resolved' | 'closed',
  ): Promise<CommunicationConversation> {
    const { data } = await apiClient.patch<{ success: boolean; data: CommunicationConversation }>(
      `/communications/admin/conversations/${conversationId}/status`,
      { status },
    );
    return data.data;
  },

  /**
   * Admin: Toggles AI or Human handling mode.
   */
  async setHandlingMode(
    conversationId: string,
    mode: 'ai' | 'human',
    reason?: string,
  ): Promise<CommunicationConversation> {
    const { data } = await apiClient.patch<{ success: boolean; data: CommunicationConversation }>(
      `/communications/admin/conversations/${conversationId}/handover`,
      { mode, reason },
    );
    return data.data;
  },

  /**
   * Admin: Links booking, event, or tags to conversation.
   */
  async linkContext(
    conversationId: string,
    payload: { bookingId?: string; eventId?: string; customerId?: string; tags?: string[] },
  ): Promise<CommunicationConversation> {
    const { data } = await apiClient.patch<{ success: boolean; data: CommunicationConversation }>(
      `/communications/admin/conversations/${conversationId}/context`,
      payload,
    );
    return data.data;
  },

  /**
   * Admin: Fetches channel configuration statuses.
   */
  async getChannelStatuses(): Promise<{
    channels: ChannelStatusInfo[];
    ai: {
      enabled: boolean;
      provider: string;
      model: string;
      status: string;
      supportsBengali: boolean;
      supportsEnglish: boolean;
      humanHandoverEnabled: boolean;
    };
  }> {
    const { data } = await apiClient.get<{
      success: boolean;
      data: {
        channels: ChannelStatusInfo[];
        ai: {
          enabled: boolean;
          provider: string;
          model: string;
          status: string;
          supportsBengali: boolean;
          supportsEnglish: boolean;
          humanHandoverEnabled: boolean;
        };
      };
    }>('/communications/admin/channels');
    return data.data;
  },
};
