import { Link } from 'react-router';
import { ShieldAlert } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Section } from '@/components/layout/Section';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_HOME_PATH } from '@/features/auth/constants/permissions';

/** Reached when RoleGuard blocks an authenticated user whose role doesn't permit a route — distinct from /login, since the visitor IS identified, just not permitted. */
export function UnauthorizedPage() {
  const { role } = useAuth();

  return (
    <PageWrapper>
      <Section>
        <EmptyState
          icon={ShieldAlert}
          title="Access Denied"
          description="You don't have permission to view this page. If you think this is a mistake, contact support."
          action={
            <Button asChild>
              <Link to={role ? ROLE_HOME_PATH[role] : '/'}>Back to Safety</Link>
            </Button>
          }
        />
      </Section>
    </PageWrapper>
  );
}
