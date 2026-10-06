import { Award, Compass, MessageSquare, Edit3, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { GuestProfile } from '@/features/guest/types';

interface GuestProfileCardProps {
  profile: GuestProfile;
  onEditProfile?: () => void;
  className?: string;
}

export function GuestProfileCard({ profile, onEditProfile, className }: GuestProfileCardProps) {
  const initials = profile.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  const memberYear = new Date(profile.memberSince).getFullYear();

  return (
    <Card className={`border-border bg-card overflow-hidden shadow-xs ${className || ''}`}>
      <CardContent className="flex flex-col gap-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <Avatar className="border-primary/20 size-14 border-2 shadow-xs">
              <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
              <AvatarFallback className="text-base font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-display text-foreground text-base leading-tight font-bold sm:text-lg">
                  {profile.fullName}
                </h3>
                <ShieldCheck
                  className="size-4 shrink-0 text-emerald-500"
                  aria-label="Verified Account"
                />
              </div>
              <p className="text-muted-foreground text-xs">{profile.email}</p>
              <p className="text-muted-foreground mt-0.5 font-mono text-xs">{profile.phone}</p>
            </div>
          </div>

          <Badge variant="secondary" className="text-[11px] font-medium capitalize">
            Guest Member
          </Badge>
        </div>

        {/* Quick Stats Badges */}
        <div className="bg-muted/40 border-border/80 grid grid-cols-3 gap-2 rounded-xl border p-3 text-center">
          <div>
            <span className="text-muted-foreground flex items-center justify-center gap-1 text-[10px] font-medium uppercase">
              <Compass className="text-primary size-3" />
              <span>Tours</span>
            </span>
            <span className="font-display text-foreground mt-0.5 block text-lg font-bold">
              {profile.totalToursCompleted}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground flex items-center justify-center gap-1 text-[10px] font-medium uppercase">
              <MessageSquare className="text-primary size-3" />
              <span>Reviews</span>
            </span>
            <span className="font-display text-foreground mt-0.5 block text-lg font-bold">
              {profile.totalReviewsGiven}
            </span>
          </div>

          <div>
            <span className="text-muted-foreground flex items-center justify-center gap-1 text-[10px] font-medium uppercase">
              <Award className="text-primary size-3" />
              <span>Points</span>
            </span>
            <span className="font-display text-primary mt-0.5 block text-lg font-bold">
              {profile.rewardPoints}
            </span>
          </div>
        </div>

        <div className="text-muted-foreground flex items-center justify-between pt-1 text-xs">
          <span>Member since {memberYear}</span>
          {onEditProfile && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary-600 hover:bg-primary/10 h-8 gap-1.5 text-xs"
              onClick={onEditProfile}
            >
              <Edit3 className="size-3.5" />
              <span>Edit Profile</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
