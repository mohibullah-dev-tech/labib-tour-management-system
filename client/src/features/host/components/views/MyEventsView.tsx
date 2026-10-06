import { Calendar, Clock, MapPin, Bus, Users, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EventLifecycleBadge } from '@/features/host/components/EventLifecycleBadge';
import type { AssignedEvent, HostDashboardTab } from '@/features/host/types';

interface MyEventsViewProps {
  events: AssignedEvent[];
  onSelectEvent: (event: AssignedEvent) => void;
  onNavigateTab: (tab: HostDashboardTab) => void;
  onStartTourAction?: (event: AssignedEvent) => void;
}

export function MyEventsView({
  events,
  onSelectEvent,
  onNavigateTab,
  onStartTourAction,
}: MyEventsViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="font-display text-foreground text-lg font-bold sm:text-xl">
            Assigned Tour Events ({events.length})
          </h3>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Tours assigned to your leadership with operational manifests and vehicle details.
          </p>
        </div>
      </div>

      <div className="laptop:grid-cols-3 grid grid-cols-1 gap-5 md:grid-cols-2">
        {events.map((evt) => {
          const departureFormatted = new Date(evt.departureDate).toLocaleDateString('en-GB', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          return (
            <Card
              key={evt.id}
              className="border-border bg-card group hover:border-primary/40 flex flex-col justify-between overflow-hidden shadow-xs transition-colors"
            >
              <div>
                {/* Event Image & Badges */}
                <div className="bg-muted relative h-44 w-full overflow-hidden">
                  <img
                    src={evt.coverImage}
                    alt={evt.destination}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
                    <span className="rounded border border-white/20 bg-black/60 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase backdrop-blur-md">
                      {evt.id}
                    </span>
                    <EventLifecycleBadge status={evt.status} size="sm" />
                  </div>

                  <div className="absolute right-3 bottom-3 left-3 text-white">
                    <h4 className="font-display text-base leading-tight font-bold drop-shadow-sm sm:text-lg">
                      {evt.destination}
                    </h4>
                    <span className="mt-0.5 block text-xs text-white/90">
                      {evt.duration} • {evt.tourName}
                    </span>
                  </div>
                </div>

                {/* Event Information Grid */}
                <CardContent className="flex flex-col gap-3 p-4 text-xs">
                  <div className="border-border grid grid-cols-2 gap-2.5 border-b pb-3">
                    <div className="flex items-start gap-1.5">
                      <Calendar className="text-primary mt-0.5 size-3.5 shrink-0" />
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Event Date</span>
                        <span className="text-foreground font-semibold">{departureFormatted}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-1.5">
                      <Clock className="text-primary mt-0.5 size-3.5 shrink-0" />
                      <div>
                        <span className="text-muted-foreground block text-[10px]">
                          Departure Time
                        </span>
                        <span className="text-foreground font-semibold">{evt.departureTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="text-primary mt-0.5 size-3.5 shrink-0" />
                    <div>
                      <span className="text-muted-foreground block text-[10px]">
                        Departure Terminal
                      </span>
                      <span className="text-foreground font-medium">{evt.departureLocation}</span>
                    </div>
                  </div>

                  <div className="bg-muted/30 border-border grid grid-cols-2 gap-2 rounded-xl border p-2.5">
                    <div className="flex items-center gap-1.5">
                      <Bus className="size-3.5 text-indigo-600" />
                      <div>
                        <span className="text-muted-foreground block text-[10px]">
                          Assigned Coach
                        </span>
                        <span className="text-foreground font-mono font-bold">
                          {evt.bus.busNumber}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Users className="size-3.5 text-emerald-600" />
                      <div>
                        <span className="text-muted-foreground block text-[10px]">Passengers</span>
                        <span className="text-primary font-bold">
                          {evt.guestCount} / {evt.bus.totalSeats}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 p-4 pt-0">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={() => {
                      onSelectEvent(evt);
                      onNavigateTab('guests');
                    }}
                  >
                    <Users className="size-3" />
                    <span>Guest List</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={() => {
                      onSelectEvent(evt);
                      onNavigateTab('seats');
                    }}
                  >
                    <Bus className="size-3" />
                    <span>Bus Seats</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary h-8 flex-1 text-xs"
                    onClick={() => onSelectEvent(evt)}
                  >
                    <span>View Event Details</span>
                  </Button>

                  {evt.isToday && (
                    <Button
                      size="sm"
                      className="h-8 gap-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                      onClick={() => {
                        onSelectEvent(evt);
                        if (onStartTourAction) {
                          onStartTourAction(evt);
                        } else {
                          onNavigateTab('today');
                        }
                      }}
                    >
                      <Navigation className="size-3" />
                      <span>Start Tour</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
