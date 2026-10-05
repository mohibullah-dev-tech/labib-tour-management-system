import { useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  type Permission,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@/features/auth/constants/permissions';

/**
 * Custom hook to cleanly check authorization permissions for the current user.
 *
 * Example usage in components:
 * ```tsx
 * const { hasPermission, canAccess } = usePermissions();
 * if (hasPermission(Permission.Tours)) {
 *   // render tours management buttons
 * }
 * ```
 */
export function usePermissions() {
  const { role, user, isAuthenticated } = useAuth();

  const permissions = useMemo<readonly Permission[]>(() => {
    if (!role) return [];
    return ROLE_PERMISSIONS[role] ?? [];
  }, [role]);

  return {
    role,
    user,
    isAuthenticated,
    permissions,
    hasPermission: (permission: Permission) => hasPermission(role, permission),
    hasAnyPermission: (requiredPermissions: readonly Permission[]) =>
      hasAnyPermission(role, requiredPermissions),
    hasAllPermissions: (requiredPermissions: readonly Permission[]) =>
      hasAllPermissions(role, requiredPermissions),
    canAccess: (permission: Permission) => hasPermission(role, permission),
  };
}
