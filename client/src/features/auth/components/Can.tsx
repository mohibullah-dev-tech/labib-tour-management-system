import type { ReactNode } from 'react';
import type { Role } from '@/features/auth/types/role';
import type { Permission } from '@/features/auth/constants/permissions';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

export interface CanProps {
  /** Check single permission */
  permission?: Permission;
  /** Check array of permissions */
  permissions?: readonly Permission[];
  /** When true with permissions array, all must match. When false (default), any match suffices. */
  matchAll?: boolean;
  /** Optional role constraint check */
  roles?: readonly Role[];
  /** Fallback content when user lacks permission */
  fallback?: ReactNode;
  /** Protected UI content */
  children: ReactNode;
}

/**
 * Enterprise `<Can>` component for granular in-page authorization guards.
 *
 * Example:
 * ```tsx
 * <Can permission={Permission.Tours}>
 *   <CreateTourButton />
 * </Can>
 * ```
 *
 * NOTE: Frontend UI authorization is only for UX! The backend must independently
 * enforce permissions on every API route and database mutation.
 */
export function Can({
  permission,
  permissions,
  matchAll = false,
  roles,
  fallback = null,
  children,
}: CanProps) {
  const { role, hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  if (roles && roles.length > 0) {
    if (!role || !roles.includes(role)) {
      return <>{fallback}</>;
    }
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (permissions && permissions.length > 0) {
    const isAllowed = matchAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);

    if (!isAllowed) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
