import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROLE_LABELS } from '@/features/auth/types/role';
import { ROLE_FEATURE_ACCESS } from '@/features/auth/constants/permissions';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Section } from '@/components/layout/Section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface AuthenticatedPlaceholderProps {
  title: string;
  description: string;
}

/**
 * Shared placeholder for /dashboard, /host, /profile, /bookings —
 * these routes exist this phase purely to demonstrate ProtectedRoute +
 * RoleGuard actually gating something real (log in as different demo
 * accounts and watch access change), not to be finished feature pages.
 * Each one's real UI is a future module.
 */
function AuthenticatedPlaceholder({ title, description }: AuthenticatedPlaceholderProps) {
  const { user, role, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
  };

  if (!user || !role) return null;

  const initials = user.fullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');

  return (
    <PageWrapper>
      <Section>
        <div className="mx-auto flex max-w-lg flex-col gap-6">
          <div>
            <h1 className="font-display text-foreground text-2xl font-semibold">{title}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          </div>

          <Card>
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <Avatar className="size-12">
                <AvatarImage src={user.avatarUrl} alt="" />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{user.fullName}</CardTitle>
                <p className="text-muted-foreground text-xs">{user.email}</p>
              </div>
              <Badge className="ml-auto">{ROLE_LABELS[role]}</Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div>
                <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                  Accessible Features
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_FEATURE_ACCESS[role].map((feature) => (
                    <Badge key={feature} variant="secondary">
                      {feature.replace('-', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="gap-2" onClick={handleLogout}>
                <LogOut className="size-4" />
                Log Out
              </Button>
            </CardContent>
          </Card>

          <p className="border-border bg-muted/40 text-muted-foreground rounded-md border border-dashed p-3 text-xs">
            This page exists to demonstrate route protection and role-based access — its real UI
            (bookings, profile editing, host tools, etc.) is a future module.
          </p>
        </div>
      </Section>
    </PageWrapper>
  );
}

export { AuthenticatedPlaceholder };
