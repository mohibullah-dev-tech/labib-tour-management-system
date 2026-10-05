import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import type { Role } from '@/features/auth/types/role';
import type { Permission } from '@/features/auth/constants/permissions';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { AUTH_ROUTES } from '@/features/auth/constants/auth-routes';

export interface RoleGuardProps {
  /** Explicit roles permitted to access this route */
  allowedRoles?: readonly Role[];
  /** Optional required permissions */
  requiredPermissions?: readonly Permission[];
  /** Optional nested children when not used as a layout route */
  children?: ReactNode;
}

/**
 * Nests inside <ProtectedRoute> (so it can assume `user` already
 * exists) to add a role or permission check on top — used for /host (Host, Admin,
 * SuperAdmin) and /admin (Admin, SuperAdmin). An authenticated user
 * whose role isn't allowed is sent to /unauthorized, not
 * silently to login (they ARE logged in — the problem is permission,
 * not identity).
 *
 * SECURITY NOTE: This is a UX convenience, not final security enforcement.
 * Role checks and route gating exist so the UI matches what the backend
 * will actually allow, but the backend must re-check role and permissions
 * on every request regardless, because client-side state is fully visible
 * and modifiable in the browser.
 */
function RoleGuard({ allowedRoles, requiredPermissions, children }: RoleGuardProps) {
  const { role } = useAuth();
  const { hasAnyPermission } = usePermissions();

  let isAllowed = true;

  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      isAllowed = false;
    }
  }

  if (isAllowed && requiredPermissions && requiredPermissions.length > 0) {
    if (!hasAnyPermission(requiredPermissions)) {
      isAllowed = false;
    }
  }

  if (!isAllowed) {
    return <Navigate to={AUTH_ROUTES.unauthorized} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export { RoleGuard };
