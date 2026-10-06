import { useState } from 'react';
import { Users, Navigation, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { EventLifecycleStatus } from '@/features/host/types';

interface EventLifecycleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetAction: 'boarding' | 'start' | 'complete';
  tourName: string;
  destination: string;
  checkedInCount: number;
  totalGuests: number;
  onConfirm: (newStatus: EventLifecycleStatus) => void;
}

export function EventLifecycleDialog({
  open,
  onOpenChange,
  targetAction,
  tourName,
  destination,
  checkedInCount,
  totalGuests,
  onConfirm,
}: EventLifecycleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getActionConfig = () => {
    switch (targetAction) {
      case 'boarding':
        return {
          title: 'Start Passenger Boarding?',
          description: `Initiate the boarding call for ${tourName}. Passengers will receive arrival notices, and the check-in scanner will open.`,
          newStatus: 'boarding' as EventLifecycleStatus,
          btnText: 'Start Boarding Now',
          icon: Users,
          iconBg: 'bg-indigo-500/10 text-indigo-600',
        };
      case 'start':
        return {
          title: 'Start Tour & Highway Departure?',
          description: `Confirm coach departure from terminal to ${destination}. Tour will transition to "In Progress" and live location sharing will be prompted.`,
          newStatus: 'in-progress' as EventLifecycleStatus,
          btnText: 'Confirm Highway Departure',
          icon: Navigation,
          iconBg: 'bg-emerald-500/10 text-emerald-600',
        };
      case 'complete':
        return {
          title: 'Mark Tour as Completed?',
          description: `Conclude the tour event for ${destination}. Guests will automatically receive review invitations and completion digital badges.`,
          newStatus: 'completed' as EventLifecycleStatus,
          btnText: 'Mark Tour Completed',
          icon: CheckCircle2,
          iconBg: 'bg-purple-500/10 text-purple-600',
        };
    }
  };

  const config = getActionConfig();
  const Icon = config.icon;

  const handleAction = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirm(config.newStatus);
      onOpenChange(false);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-5 p-6">
        <DialogHeader>
          <div
            className={`flex size-12 items-center justify-center rounded-2xl ${config.iconBg} mb-2`}
          >
            <Icon className="size-6" />
          </div>
          <DialogTitle className="font-display text-xl">{config.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-1 text-xs leading-relaxed sm:text-sm">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        {/* Boarding Status Summary if starting tour */}
        {targetAction === 'start' && (
          <div className="border-border bg-card flex flex-col gap-2 rounded-xl border p-3.5 text-xs">
            <div className="text-muted-foreground flex items-center justify-between">
              <span>Boarding Check-In Status:</span>
              <span className="text-foreground font-bold">
                {checkedInCount} of {totalGuests} checked in
              </span>
            </div>
            {checkedInCount < totalGuests && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-3.5 shrink-0" />
                <span>
                  {totalGuests - checkedInCount} guest(s) are not yet checked in. Ensure roll-call
                  before departure!
                </span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse items-stretch justify-end gap-2 pt-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-2"
            onClick={handleAction}
            isLoading={isSubmitting}
          >
            <span>{config.btnText}</span>
            <ArrowRight className="size-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
