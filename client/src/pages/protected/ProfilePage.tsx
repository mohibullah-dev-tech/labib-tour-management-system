import { AuthenticatedPlaceholder } from '@/features/auth/components/AuthenticatedPlaceholder';

export function ProfilePage() {
  return (
    <AuthenticatedPlaceholder
      title="My Profile"
      description="Manage your personal information and account settings."
    />
  );
}
