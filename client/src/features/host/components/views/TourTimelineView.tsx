import { Clock, MapPin, CheckCircle2, Compass } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AssignedEvent } from '@/features/host/types';

interface TourTimelineViewProps {
  event: AssignedEvent | null;
  onUpdateMilestone: (
    eventId: string,
    milestoneId: string,
    status: 'completed' | 'current' | 'upcoming',
  ) => void;
}

export function TourTimelineView({ event, onUpdateMilestone }: TourTimelineViewProps) {
  const timeline = event?.timeline ?? [];

  if (!event || timeline.length === 0) {
    return (
      <Card className="border-dashed p-12 text-center">
        <Clock className="text-muted-foreground/30 mx-auto mb-3 size-12" />
        <h3 className="font-display text-lg font-bold">No Itinerary Milestones Configured</h3>
        <p className="text-muted-foreground mx-auto mt-1 max-w-md text-xs">
          The tour itinerary schedule has not been published yet.
        </p>
      </Card>
    );
  }

  const completedCount = timeline.filter((m) => m.status === 'completed').length;
  const currentMilestone = timeline.find((m) => m.status === 'current');

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Milestone Status */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-display text-foreground text-lg font-bold sm:text-xl">
            Tour Journey Timeline &amp; Milestones
          </h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {event.destination}: {completedCount} of {timeline.length} highway checkpoints
            completed.
          </p>
        </div>

        {currentMilestone && (
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span>Current Station: {currentMilestone.title}</span>
          </div>
        )}
      </div>

      {/* Visual Timeline Stepper */}
      <Card className="border-border bg-card p-4 shadow-xs sm:p-6">
        <div className="border-primary/20 relative ml-3 space-y-8 border-l-2 py-2 pl-6 sm:ml-6 sm:pl-8">
          {timeline.map((milestone, idx) => {
            const isCompleted = milestone.status === 'completed';
            const isCurrent = milestone.status === 'current';
            const isUpcoming = milestone.status === 'upcoming';

            return (
              <div key={milestone.id} className="group relative">
                {/* Milestone Node Marker */}
                <div
                  className={`absolute top-0 -left-[33px] flex size-8 items-center justify-center rounded-full border-2 transition-all sm:-left-[41px] sm:size-9 ${
                    isCompleted
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                        ? 'border-primary bg-background text-primary ring-primary/20 scale-110 shadow-md ring-4'
                        : 'border-border bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="size-4" />
                  ) : isCurrent ? (
                    <Compass
                      className="text-primary size-4 animate-spin"
                      style={{ animationDuration: '6s' }}
                    />
                  ) : (
                    <span className="font-mono text-xs font-bold">{idx + 1}</span>
                  )}
                </div>

                {/* Milestone Card Content */}
                <div
                  className={`rounded-2xl border p-4 transition-all ${
                    isCurrent
                      ? 'border-primary/40 bg-primary/5 shadow-xs'
                      : isCompleted
                        ? 'border-border/70 bg-card/60'
                        : 'border-border/60 bg-muted/20 opacity-80'
                  }`}
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-primary bg-primary/10 border-primary/20 rounded-md border px-2 py-0.5 font-mono text-xs font-bold">
                        {milestone.time}
                      </span>
                      <h4 className="font-display text-foreground text-base font-bold">
                        {milestone.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCompleted && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/40 bg-emerald-500/10 text-[10px] text-emerald-700"
                        >
                          Completed
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge className="bg-primary text-primary-foreground animate-pulse text-[10px]">
                          In Progress
                        </Badge>
                      )}
                      {isUpcoming && (
                        <Badge variant="secondary" className="text-[10px]">
                          Upcoming
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-muted-foreground mt-2 flex items-center gap-1.5 text-xs">
                    <MapPin className="text-primary size-3 shrink-0" />
                    <span className="text-foreground font-medium">{milestone.location}</span>
                    {milestone.estimatedArrival && (
                      <span className="text-muted-foreground/80">
                        • Est: {milestone.estimatedArrival}
                      </span>
                    )}
                  </div>

                  <p className="text-muted-foreground mt-2 text-xs leading-relaxed">
                    {milestone.description}
                  </p>

                  {/* Host Action Buttons for Milestone Progression */}
                  <div className="border-border/60 mt-4 flex items-center gap-2 border-t pt-3">
                    {!isCompleted && (
                      <Button
                        size="sm"
                        variant={isCurrent ? 'default' : 'outline'}
                        className={`h-7 gap-1.5 text-xs ${isCurrent ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                        onClick={() => onUpdateMilestone(event.id, milestone.id, 'completed')}
                      >
                        <CheckCircle2 className="size-3" />
                        <span>Mark Reached &amp; Done</span>
                      </Button>
                    )}

                    {!isCurrent && !isCompleted && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-primary h-7 gap-1.5 text-xs"
                        onClick={() => onUpdateMilestone(event.id, milestone.id, 'current')}
                      >
                        <Compass className="size-3" />
                        <span>Set as Current Stop</span>
                      </Button>
                    )}

                    {isCompleted && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-foreground h-7 text-xs"
                        onClick={() => onUpdateMilestone(event.id, milestone.id, 'upcoming')}
                      >
                        Reset Status
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
