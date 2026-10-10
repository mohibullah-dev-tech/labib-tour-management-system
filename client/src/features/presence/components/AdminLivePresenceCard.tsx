import { useState } from 'react';
import { Users, ArrowRight, UserCheck, Compass, Shield, Globe } from 'lucide-react';
import { useAdminPresence } from '../hooks/useAdminPresence';
import { AdminLivePresenceDrawer } from './AdminLivePresenceDrawer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function AdminLivePresenceCard() {
  const { summary } = useAdminPresence();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Card className="border-border from-card via-card overflow-hidden bg-gradient-to-br to-emerald-500/5 shadow-sm">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Indicator & Headline */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                  Real-Time Live Operations
                </span>
              </div>
              <h3 className="text-foreground flex items-center gap-2 text-xl font-bold tracking-tight">
                <span>{summary.totalOnline} Active Users Online</span>
              </h3>
              <p className="text-muted-foreground text-xs">
                Travelers currently viewing tour packages, guests in checkout, and field tour
                guides.
              </p>
            </div>

            {/* Right: Action Button */}
            <Button
              onClick={() => setDrawerOpen(true)}
              className="shrink-0 gap-2 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
              size="sm"
            >
              <Users className="size-4" />
              <span>Inspect Connected Users</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>

          {/* Breakdown Badges Bar */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                <UserCheck className="size-4" />
              </div>
              <div>
                <p className="text-foreground text-lg leading-tight font-bold">
                  {summary.guestsCount}
                </p>
                <p className="text-muted-foreground text-xs">Guests Online</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-500">
                <Compass className="size-4" />
              </div>
              <div>
                <p className="text-foreground text-lg leading-tight font-bold">
                  {summary.hostsCount}
                </p>
                <p className="text-muted-foreground text-xs">Tour Guides</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
              <div className="rounded-lg bg-rose-500/10 p-2 text-rose-500">
                <Shield className="size-4" />
              </div>
              <div>
                <p className="text-foreground text-lg leading-tight font-bold">
                  {summary.adminsCount}
                </p>
                <p className="text-muted-foreground text-xs">Central Admins</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-500/20 bg-slate-500/5 p-3">
              <div className="rounded-lg bg-slate-500/10 p-2 text-slate-500">
                <Globe className="size-4" />
              </div>
              <div>
                <p className="text-foreground text-lg leading-tight font-bold">
                  {summary.visitorsCount}
                </p>
                <p className="text-muted-foreground text-xs">Public Visitors</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AdminLivePresenceDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
