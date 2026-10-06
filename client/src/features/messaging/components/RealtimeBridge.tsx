import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { realtimeService } from '../services/realtime.service';

export function RealtimeBridge() {
  const client = useQueryClient();
  useEffect(() => {
    realtimeService.connect();
    const offNotification = realtimeService.subscribe('notification:new', () => {
      void client.invalidateQueries({ queryKey: ['notifications'] });
      toast('New notification', { description: 'Your tour information has been updated.' });
    });
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
