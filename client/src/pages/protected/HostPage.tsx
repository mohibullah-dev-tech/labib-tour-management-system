import { AuthenticatedPlaceholder } from '@/features/auth/components/AuthenticatedPlaceholder';

export function HostPage() {
  return (
    <AuthenticatedPlaceholder
      title="Host Panel"
      description="Assigned tours, guests, live tracking, and announcements."
    />
  );
}
