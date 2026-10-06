import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Role } from '@/features/auth/types/role';
import {
  GuestLayout,
  OverviewView,
  BookingsView,
  UpcomingView,
  PastToursView,
  TicketsView,
  PaymentsView,
  ReviewsView,
  ProfileView,
  SupportCard,
  TicketModal,
  BookingDetailsDialog,
  ReviewForm,
  useGuestProfile,
  useGuestBookings,
  useUpcomingTour,
  useGuestPayments,
  useGuestReviews,
  useUpdateProfileMutation,
  useSubmitReviewMutation,
  useCancelBookingMutation,
  type GuestBooking,
  type GuestDashboardTab,
  type GuestProfile,
} from '@/features/guest';

const VALID_TABS: GuestDashboardTab[] = [
  'overview',
  'bookings',
  'upcoming',
  'past-tours',
  'tickets',
  'payments',
  'reviews',
  'profile',
  'support',
];

interface DashboardPageProps {
  initialTab?: GuestDashboardTab;
}

export function DashboardPage({ initialTab = 'overview' }: DashboardPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') as GuestDashboardTab | null;
  const activeTab: GuestDashboardTab = rawTab && VALID_TABS.includes(rawTab) ? rawTab : initialTab;

  // Selected Booking Modals
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<GuestBooking | null>(
    null,
  );
  const [selectedBookingForTicket, setSelectedBookingForTicket] = useState<GuestBooking | null>(
    null,
  );
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<GuestBooking | null>(
    null,
  );

  // Queries
  const { data: profile, isLoading: isProfileLoading } = useGuestProfile();
  const { data: bookings = [] } = useGuestBookings();
  const { data: upcomingTour = null } = useUpcomingTour();
  const { data: payments = [] } = useGuestPayments();
  const { data: reviews = [] } = useGuestReviews();

  // Mutations
  const updateProfileMutation = useUpdateProfileMutation();
  const submitReviewMutation = useSubmitReviewMutation();
  const cancelBookingMutation = useCancelBookingMutation();

  const handleTabChange = (tab: GuestDashboardTab) => {
    setSearchParams({ tab });
  };

  const handleCancelBooking = (booking: GuestBooking) => {
    if (
      window.confirm(
        `Are you sure you want to request cancellation for booking ${booking.id} (${booking.destination})?`,
      )
    ) {
      cancelBookingMutation.mutate(
        { id: booking.id, reason: 'Guest cancellation request from dashboard' },
        {
          onSuccess: () => {
            toast.success('Cancellation Request Submitted', {
              description: 'Our customer support operations team is reviewing your refund request.',
            });
          },
          onError: () => {
            toast.error('Failed to cancel booking. Please contact support.');
          },
        },
      );
    }
  };

  const handleSubmitReview = async (reviewData: {
    bookingId: string;
    destination: string;
    tourDate: string;
    rating: number;
    comment: string;
    photos?: string[];
  }) => {
    await submitReviewMutation.mutateAsync({
      bookingId: reviewData.bookingId,
      destination: reviewData.destination,
      tourDate: reviewData.tourDate,
      rating: reviewData.rating,
      comment: reviewData.comment,
      photos: reviewData.photos,
      reviewerName: profile?.fullName || 'Valued Guest',
      reviewerAvatar: profile?.avatarUrl,
    });
  };

  const handleUpdateProfile = async (patch: Partial<GuestProfile>) => {
    return await updateProfileMutation.mutateAsync(patch);
  };

  if (isProfileLoading && !profile) {
    return (
      <div className="bg-muted/20 flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="text-primary size-8 animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">
            Loading your guest dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Fallback profile if loading initial data
  const currentProfile: GuestProfile = profile || {
    id: 'guest-fallback',
    fullName: 'Farhana Akter',
    email: 'guest@labibtours.com',
    phone: '+880 1712-345678',
    address: 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    emergencyContact: '+880 1911-223344 (Brother - Tanvir Akter)',
    preferredPickupLocation: 'Sayedabad Bus Terminal, Dhaka',
    memberSince: '2024-03-15',
    totalToursCompleted: 2,
    totalReviewsGiven: 2,
    rewardPoints: 350,
    role: Role.Guest,
  };

  return (
    <GuestLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {/* Tab View Switcher */}
      {activeTab === 'overview' && (
        <OverviewView
          upcomingTour={upcomingTour}
          bookings={bookings}
          profile={currentProfile}
          onTabChange={handleTabChange}
          onViewBookingDetails={(b) => setSelectedBookingForDetails(b)}
          onViewTicket={(b) => setSelectedBookingForTicket(b)}
        />
      )}

      {activeTab === 'bookings' && (
        <BookingsView
          bookings={bookings}
          onViewDetails={(b) => setSelectedBookingForDetails(b)}
          onViewTicket={(b) => setSelectedBookingForTicket(b)}
          onCancelRequest={handleCancelBooking}
        />
      )}

      {activeTab === 'upcoming' && (
        <UpcomingView
          upcomingTour={upcomingTour}
          onViewTicket={(b) => setSelectedBookingForTicket(b)}
          onViewDetails={(b) => setSelectedBookingForDetails(b)}
        />
      )}

      {activeTab === 'past-tours' && (
        <PastToursView
          bookings={bookings}
          onViewDetails={(b) => setSelectedBookingForDetails(b)}
          onWriteReview={(b) => setSelectedBookingForReview(b)}
        />
      )}

      {activeTab === 'tickets' && <TicketsView bookings={bookings} />}

      {activeTab === 'payments' && <PaymentsView payments={payments} bookings={bookings} />}

      {activeTab === 'reviews' && (
        <ReviewsView
          bookings={bookings}
          reviews={reviews}
          onOpenReviewForm={(b) => setSelectedBookingForReview(b)}
        />
      )}

      {activeTab === 'profile' && (
        <ProfileView profile={currentProfile} onUpdateProfile={handleUpdateProfile} />
      )}

      {activeTab === 'support' && <SupportCard />}

      {/* Global Modals & Dialogs */}
      <BookingDetailsDialog
        booking={selectedBookingForDetails}
        open={!!selectedBookingForDetails}
        onOpenChange={(open) => {
          if (!open) setSelectedBookingForDetails(null);
        }}
        onViewTicket={(b) => {
          setSelectedBookingForDetails(null);
          setSelectedBookingForTicket(b);
        }}
        onCancelRequest={handleCancelBooking}
      />

      <TicketModal
        booking={selectedBookingForTicket}
        open={!!selectedBookingForTicket}
        onOpenChange={(open) => {
          if (!open) setSelectedBookingForTicket(null);
        }}
      />

      <ReviewForm
        booking={selectedBookingForReview}
        open={!!selectedBookingForReview}
        onOpenChange={(open) => {
          if (!open) setSelectedBookingForReview(null);
        }}
        onSubmit={handleSubmitReview}
      />
    </GuestLayout>
  );
}
