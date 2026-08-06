import { Phone, MessageCircle } from 'lucide-react';
import type { HostInfo as HostInfoType } from '@/features/tours/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export interface HostInfoProps {
  host?: HostInfoType;
}

/** Reusable shape (photo, name, experience, phone, WhatsApp, bio) — will appear again on host profile pages once that feature exists. */
function HostInfo({ host }: HostInfoProps) {
  if (!host) return null;

  const initials = host.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  return (
    <div className="border-border bg-card flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-start">
      <Avatar className="size-16">
        <AvatarImage src={host.photo} alt="" />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col gap-2">
        <div>
          <h4 className="font-display text-foreground text-base font-semibold">{host.name}</h4>
          <p className="text-muted-foreground text-xs">
            {host.experienceYears} years hosting tours
          </p>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">{host.bio}</p>
        <div className="mt-1 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <a href={`tel:${host.phone}`}>
              <Phone className="size-3.5" />
              {host.phone}
            </a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-success-600 text-success-600 hover:bg-success-50 gap-1.5"
            asChild
          >
            <a href={host.whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-3.5" />
              WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export { HostInfo };
