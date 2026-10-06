import { Phone, MessageCircle, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { HostContact } from '@/features/guest/types';

interface HostContactCardProps {
  host: HostContact;
  className?: string;
  tourName?: string;
}

export function HostContactCard({ host, className, tourName }: HostContactCardProps) {
  const initials = host.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <Card className={`border-border bg-card overflow-hidden shadow-xs ${className || ''}`}>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="border-border size-12 border">
              <AvatarImage src={host.avatarUrl} alt={host.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-foreground text-sm leading-none font-semibold sm:text-base">
                  {host.name}
                </h4>
                {host.rating && (
                  <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-[10px]">
                    <Star className="size-2.5 fill-amber-400 text-amber-400" />
                    <span>{host.rating}</span>
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {tourName ? `Lead Tour Guide &bull; ${tourName}` : 'Designated LTMS Tour Host'}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className="border-emerald-500/20 bg-emerald-500/10 text-[10px] font-semibold text-emerald-600 uppercase"
          >
            On Duty
          </Badge>
        </div>

        <div className="border-border flex flex-wrap items-center gap-2 border-t pt-2">
          <Button asChild size="sm" variant="outline" className="flex-1 gap-1.5 text-xs">
            <a href={`tel:${host.phone}`}>
              <Phone className="size-3.5" />
              <span>Call Host</span>
            </a>
          </Button>

          <Button
            asChild
            size="sm"
            className="flex-1 gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
          >
            <a href={host.whatsapp} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-3.5" />
              <span>WhatsApp</span>
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
