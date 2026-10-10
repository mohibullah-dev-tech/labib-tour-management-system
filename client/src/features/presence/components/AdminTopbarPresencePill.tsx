import { useState } from 'react';
import { useAdminPresence } from '../hooks/useAdminPresence';
import { AdminLivePresenceDrawer } from './AdminLivePresenceDrawer';
import { Button } from '@/components/ui/button';

export function AdminTopbarPresencePill() {
  const { summary } = useAdminPresence();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDrawerOpen(true)}
        className="h-8 gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/20 dark:text-emerald-400"
        title="View Real-Time Online Users"
      >
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <span>
          <strong>{summary.totalOnline}</strong> Online
        </span>
      </Button>

      <AdminLivePresenceDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
