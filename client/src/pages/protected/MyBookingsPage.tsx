import { AuthenticatedPlaceholder } from '@/features/auth/components/AuthenticatedPlaceholder';

export function MyBookingsPage() {
  return (
    <AuthenticatedPlaceholder
      title="My Bookings"
      description="Your upcoming and past tour bookings."
    />
  );
}
