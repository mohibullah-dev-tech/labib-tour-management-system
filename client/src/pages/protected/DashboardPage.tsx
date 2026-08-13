import { AuthenticatedPlaceholder } from '@/features/auth/components/AuthenticatedPlaceholder';

export function DashboardPage() {
  return (
    <AuthenticatedPlaceholder
      title="Dashboard"
      description="Your bookings, reviews, and tickets at a glance."
    />
  );
}
