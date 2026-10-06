import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Role } from '@/features/auth/types/role';
import {
  HostLayout,
  HostOverviewView,
  MyEventsView,
  EventDetailsView,
  TodaysTourView,
  GuestListView,
  BusSeatsView,
  TourTimelineView,
  LiveLocationView,
  HostMessagesView,
  HostNotificationsView,
  HostProfileView,
  HostSupportView,
  GuestDetailsModal,
  LocationPermissionDialog,
  EventLifecycleDialog,
  ReportProblemModal,
  useHostProfile,
  useAssignedEvents,
  useTodayEvent,
  useEventGuests,
  useHostConversations,
  useHostNotifications,
  useHostLocation,
  useUpdateHostProfileMutation,
  useCheckInMutation,
  useUpdateEventStatusMutation,
  useUpdateTimelineMilestoneMutation,
  useSendMessageMutation,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useStartLocationSharingMutation,
  useStopLocationSharingMutation,
  useTogglePauseSharingMutation,
  type AssignedEvent,
  type HostGuest,
  type HostDashboardTab,
  type HostProfile,
  type CheckInStatus,
  type EventLifecycleStatus,
} from '@/features/host';

const VALID_TABS: HostDashboardTab[] = [
  'overview',
  'events',
  'today',
  'guests',
  'seats',
  'timeline',
  'location',
  'messages',
  'notifications',
  'profile',
  'support',
];

interface HostPageProps {
  initialTab?: HostDashboardTab;
}

export function HostPage({ initialTab = 'overview' }: HostPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') as HostDashboardTab | null;
  const activeTab: HostDashboardTab = rawTab && VALID_TABS.includes(rawTab) ? rawTab : initialTab;

  // Modals & Selected Entities State
  const [detailedEvent, setDetailedEvent] = useState<AssignedEvent | null>(null);
  const [selectedGuestForDetails, setSelectedGuestForDetails] = useState<HostGuest | null>(null);
  const [locationPermissionOpen, setLocationPermissionOpen] = useState(false);
  const [lifecycleDialogConfig, setLifecycleDialogConfig] = useState<{
    open: boolean;
    targetAction: 'boarding' | 'start' | 'complete';
  }>({
    open: false,
    targetAction: 'boarding',
  });
  const [reportProblemOpen, setReportProblemOpen] = useState(false);

  // Queries
  const { data: profile, isLoading: isProfileLoading } = useHostProfile();
  const { data: events = [] } = useAssignedEvents();
  const { data: todayEvent = null } = useTodayEvent();
  const activeEvent = detailedEvent || todayEvent || events[0] || null;

  const { data: guests = [] } = useEventGuests(activeEvent?.id);
  const { data: conversations = [] } = useHostConversations();
  const { data: notifications = [] } = useHostNotifications();
  const {
    data: locationData = {
      latitude: 23.4607,
      longitude: 91.1809,
      accuracyMeters: 14.5,
      speedKmh: 68.2,
      headingDegrees: 124,
      lastUpdated: new Date().toISOString(),
      sharingStatus: 'inactive' as const,
      addressPlaceholder: 'Dhaka-Chittagong Expressway, Noorjahan Highway Segment, Cumilla',
    },
  } = useHostLocation(activeEvent?.id);

  // Mutations
  const updateProfileMutation = useUpdateHostProfileMutation();
  const checkInMutation = useCheckInMutation();
  const updateEventStatusMutation = useUpdateEventStatusMutation();
  const updateTimelineMilestoneMutation = useUpdateTimelineMilestoneMutation();
  const sendMessageMutation = useSendMessageMutation();
  const markNotificationReadMutation = useMarkNotificationReadMutation();
  const markAllNotificationsReadMutation = useMarkAllNotificationsReadMutation();
  const startSharingMutation = useStartLocationSharingMutation();
  const stopSharingMutation = useStopLocationSharingMutation();
  const togglePauseMutation = useTogglePauseSharingMutation();

  const handleTabChange = (tab: HostDashboardTab) => {
    setSearchParams({ tab });
    if (tab !== 'events') {
      setDetailedEvent(null);
    }
  };

  const handleCheckIn = (guestId: string, status: CheckInStatus) => {
    checkInMutation.mutate(
      { guestId, status },
      {
        onSuccess: (updated) => {
          if (status === 'checked-in') {
            toast.success(`Checked In: ${updated.fullName}`, {
              description: `Seat(s) ${updated.seatNumbers.join(', ')} marked present.`,
            });
          } else if (status === 'absent') {
            toast.warning(`Flagged Absent: ${updated.fullName}`, {
              description: 'Passenger marked as no-show for this departure.',
            });
          }
        },
        onError: () => {
          toast.error('Failed to update check-in status.');
        },
      },
    );
  };

  const handleStartSharing = () => {
    if (!activeEvent) return;
    startSharingMutation.mutate(activeEvent.id, {
      onSuccess: () => {
        toast.success('Live Location Sharing Activated', {
          description: `All ${guests.length} passengers of ${activeEvent.destination} can now view vehicle progress.`,
        });
      },
      onError: () => {
        toast.error('Failed to initiate live location sharing.');
      },
    });
  };

  const handleStopSharing = () => {
    if (!activeEvent) return;
    stopSharingMutation.mutate(activeEvent.id, {
      onSuccess: () => {
        toast.info('Live Location Sharing Deactivated', {
          description: 'Vehicle coordinates are no longer broadcasted to passengers.',
        });
      },
      onError: () => {
        toast.error('Failed to stop location sharing.');
      },
    });
  };

  const handleTogglePause = () => {
    if (!activeEvent) return;
    togglePauseMutation.mutate(activeEvent.id);
  };

  const handleTriggerLifecycle = (action: 'boarding' | 'start' | 'complete') => {
    setLifecycleDialogConfig({
      open: true,
      targetAction: action,
    });
  };

  const handleConfirmLifecycleStatus = (newStatus: EventLifecycleStatus) => {
    if (!activeEvent) return;
    updateEventStatusMutation.mutate(
      { eventId: activeEvent.id, status: newStatus },
      {
        onSuccess: () => {
          if (newStatus === 'boarding') {
            toast.success('Boarding Commenced', {
              description: 'Passenger roll-call scanner is now live.',
            });
          } else if (newStatus === 'in-progress' || newStatus === 'started') {
            toast.success('Tour Highway Departure Confirmed', {
              description: 'Safe journey! Remember to keep live location sharing on.',
            });
            // Automatically prompt location sharing if not active
            if (locationData.sharingStatus !== 'active') {
              setLocationPermissionOpen(true);
            }
          } else if (newStatus === 'completed') {
            toast.success('Tour Marked as Completed', {
              description: 'Review collection initiated for all travelers.',
            });
          }
        },
        onError: () => {
          toast.error('Failed to update event status.');
        },
      },
    );
  };

  const handleMilestoneUpdate = (
    eventId: string,
    milestoneId: string,
    status: 'completed' | 'current' | 'upcoming',
  ) => {
    updateTimelineMilestoneMutation.mutate(
      { eventId, milestoneId, status },
      {
        onSuccess: () => {
          toast.success('Itinerary Milestone Updated', {
            description: 'Guests can see updated highway position.',
          });
        },
      },
    );
  };

  const handleSendMessage = (conversationId: string, text: string) => {
    sendMessageMutation.mutate({ conversationId, text });
  };

  const handleUpdateProfile = async (patch: Partial<HostProfile>) => {
    return await updateProfileMutation.mutateAsync(patch);
  };

  const unreadMessagesCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (isProfileLoading && !profile) {
    return (
      <div className="bg-muted/20 flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-primary size-8 animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">
            Loading your tour leader mission control...
          </p>
        </div>
      </div>
    );
  }

  const currentProfile: HostProfile = profile || {
    id: 'u-host-1',
    fullName: 'Rahim Ahmed',
    email: 'host@labibtours.com',
    phone: '+880 1711-000010',
    whatsapp: '+8801711000010',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    experience: '5 Years Senior Tour Leader',
    bio: 'Certified wilderness tour leader with 5+ years of experience navigating the Chittagong Hill Tracts.',
    languages: ['Bangla', 'English', 'Sylheti', 'Chittagonian'],
    emergencyContact: 'Kabir Ahmed (Brother) - +880 1819-998877',
    totalToursGuided: 48,
    assignedEventCount: 3,
    rating: 4.95,
    role: Role.Host,
  };

  return (
    <HostLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      profile={currentProfile}
      notifications={notifications}
      unreadMessagesCount={unreadMessagesCount}
      isLocationSharingActive={locationData.sharingStatus === 'active'}
      onOpenNotifications={() => handleTabChange('notifications')}
      tourName={activeEvent?.destination}
      busNumber={activeEvent?.bus.busNumber}
    >
      {/* Tab View Router */}
      {activeTab === 'overview' && (
        <HostOverviewView
          todayEvent={todayEvent}
          events={events}
          guests={guests}
          profile={currentProfile}
          unreadMessagesCount={unreadMessagesCount}
          isLocationSharingActive={locationData.sharingStatus === 'active'}
          onNavigateTab={handleTabChange}
          onSelectEvent={(evt) => {
            setDetailedEvent(evt);
            handleTabChange('events');
          }}
          onTriggerLifecycle={handleTriggerLifecycle}
          onRequestLocationPermission={() => setLocationPermissionOpen(true)}
        />
      )}

      {activeTab === 'events' &&
        (detailedEvent ? (
          <EventDetailsView
            event={detailedEvent}
            onBack={() => setDetailedEvent(null)}
            onNavigateTab={handleTabChange}
          />
        ) : (
          <MyEventsView
            events={events}
            onSelectEvent={(evt) => setDetailedEvent(evt)}
            onNavigateTab={handleTabChange}
            onStartTourAction={(evt) => {
              setDetailedEvent(evt);
              handleTabChange('today');
            }}
          />
        ))}

      {activeTab === 'today' && (
        <TodaysTourView
          event={todayEvent}
          guests={guests}
          isLocationSharingActive={locationData.sharingStatus === 'active'}
          onUpdateCheckIn={handleCheckIn}
          onSelectGuest={(g) => setSelectedGuestForDetails(g)}
          onTriggerLifecycle={handleTriggerLifecycle}
          onRequestLocationPermission={() => setLocationPermissionOpen(true)}
          onNavigateTab={handleTabChange}
        />
      )}

      {activeTab === 'guests' && (
        <GuestListView
          guests={guests}
          onSelectGuest={(g) => setSelectedGuestForDetails(g)}
          onUpdateCheckIn={handleCheckIn}
        />
      )}

      {activeTab === 'seats' && (
        <BusSeatsView
          event={activeEvent}
          guests={guests}
          onSelectGuest={(g) => setSelectedGuestForDetails(g)}
          onUpdateCheckIn={handleCheckIn}
        />
      )}

      {activeTab === 'timeline' && (
        <TourTimelineView event={activeEvent} onUpdateMilestone={handleMilestoneUpdate} />
      )}

      {activeTab === 'location' && (
        <LiveLocationView
          locationData={locationData}
          event={activeEvent}
          onRequestPermission={() => setLocationPermissionOpen(true)}
          onStopSharing={handleStopSharing}
          onTogglePause={handleTogglePause}
        />
      )}

      {activeTab === 'messages' && (
        <HostMessagesView conversations={conversations} onSendMessage={handleSendMessage} />
      )}

      {activeTab === 'notifications' && (
        <HostNotificationsView
          notifications={notifications}
          onMarkAsRead={(id) => markNotificationReadMutation.mutate(id)}
          onMarkAllAsRead={() => {
            markAllNotificationsReadMutation.mutate();
            toast.success('All operational bulletins marked as read');
          }}
        />
      )}

      {activeTab === 'profile' && (
        <HostProfileView profile={currentProfile} onUpdateProfile={handleUpdateProfile} />
      )}

      {activeTab === 'support' && (
        <HostSupportView onOpenReportProblem={() => setReportProblemOpen(true)} />
      )}

      {/* Global Interactive Modals & Dialogs */}
      <GuestDetailsModal
        guest={selectedGuestForDetails}
        open={!!selectedGuestForDetails}
        onOpenChange={(open) => {
          if (!open) setSelectedGuestForDetails(null);
        }}
        onUpdateCheckIn={handleCheckIn}
        onOpenMessage={() => {
          setSelectedGuestForDetails(null);
          handleTabChange('messages');
        }}
      />

      <LocationPermissionDialog
        open={locationPermissionOpen}
        onOpenChange={setLocationPermissionOpen}
        onConfirmStartSharing={handleStartSharing}
        tourName={activeEvent?.destination ?? 'Sajek Valley'}
        guestCount={guests.length}
      />

      <EventLifecycleDialog
        open={lifecycleDialogConfig.open}
        onOpenChange={(open) => setLifecycleDialogConfig((prev) => ({ ...prev, open }))}
        targetAction={lifecycleDialogConfig.targetAction}
        tourName={activeEvent?.tourName ?? 'Current Tour'}
        destination={activeEvent?.destination ?? 'Sajek Valley'}
        checkedInCount={guests.filter((g) => g.checkInStatus === 'checked-in').length}
        totalGuests={guests.length}
        onConfirm={handleConfirmLifecycleStatus}
      />

      <ReportProblemModal
        open={reportProblemOpen}
        onOpenChange={setReportProblemOpen}
        eventId={activeEvent?.id}
        tourName={activeEvent?.destination}
      />
    </HostLayout>
  );
}
