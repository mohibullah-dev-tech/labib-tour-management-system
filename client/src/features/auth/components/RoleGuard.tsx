import { Navigate, Outlet } from 'react-router';
import type { Role } from '@/features/auth/types/role';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AUTH_ROUTES } from '@/features/auth/constants/auth-routes';

export interface RoleGuardProps {
  allowedRoles: Role[];
}

/**
 * Nests inside <ProtectedRoute> (so it can assume `user` already
 * exists) to add a role check on top — used for /host (Host, Admin,
 * SuperAdmin) and /admin (Admin, SuperAdmin). An authenticated user
 * whose role isn't in `allowedRoles` is sent to /unauthorized, not
 * silently to login (they ARE logged in — the problem is permission,
 * not identity).
 *
 * SECURITY NOTE: identical caveat to ProtectedRoute — this is a UX
 * convenience, not enforcement. `ROUTE_ROLE_REQUIREMENTS` and every
 * role check like this one exist so the UI matches what the backend
 * will actually allow, but the backend re-checks role on every request
 * regardless, because this check (and the role value itself) is fully
 * visible and editable by the visitor via devtools.
 */
function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={AUTH_ROUTES.unauthorized} replace />;
  }

  return <Outlet />;
}

export { RoleGuard };
