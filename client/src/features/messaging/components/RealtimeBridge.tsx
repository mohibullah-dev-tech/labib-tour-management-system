import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { realtimeService } from '../services/realtime.service';

export function RealtimeBridge() {
  const client = useQueryClient();
  useEffect(() => {
    realtimeService.connect();
    const offNotification = realtimeService.subscribe(
      'notification:new',
      (payload: { id: string; title?: string; message?: string }) => {
        void client.invalidateQueries({ queryKey: ['notifications'] });
        void client.invalidateQueries({ queryKey: ['notifications-unread'] });
        toast(payload?.title || 'New notification', {
          description: payload?.message || 'Your tour information has been updated.',
        });
      },
    );
    const offMessage = realtimeService.subscribe('message:new', (message) => {
      void client.invalidateQueries({ queryKey: ['conversations'] });
      void client.invalidateQueries({ queryKey: ['conversation', message.conversationId] });
      toast('New message', { description: `New message from ${message.senderName}` });
    });
    const offAnnouncement = realtimeService.subscribe('event:announcement', (announcement) => {
      void client.invalidateQueries({ queryKey: ['event-announcements'] });
      toast('Event announcement', { description: announcement.title });
    });
    return () => {
      offNotification();
      offMessage();
      offAnnouncement();
      realtimeService.disconnect();
    };
  }, [client]);
  return null;
}
