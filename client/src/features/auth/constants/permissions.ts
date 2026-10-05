import { Role } from '@/features/auth/types/role';

/**
 * Strongly-typed permission tokens matching every capability outlined in the role matrix:
 * - Guest: Own Profile, Own Bookings, Reviews, Tickets
 * - Host: Assigned Tours, Assigned Guests, Live Tracking, Announcements
 * - Admin: Tours, Events, Buses, Hosts, Bookings, Guests, Reviews, Reports, Settings
 * - Super Admin: Everything, User Management, Role Management, System Settings, Audit Logs
 *
 * Use these constants throughout the UI instead of raw strings.
 */
export const Permission = {
  // Guest Capabilities
  OwnProfile: 'own_profile',
  OwnBookings: 'own_bookings',
  Reviews: 'reviews',
  Tickets: 'tickets',

  // Host Capabilities
  AssignedTours: 'assigned_tours',
  AssignedGuests: 'assigned_guests',
  LiveTracking: 'live_tracking',
  Announcements: 'announcements',

  // Admin Capabilities
  Tours: 'tours',
  Events: 'events',
  Buses: 'buses',
  Hosts: 'hosts',
  Bookings: 'bookings',
  Guests: 'guests',
  Reports: 'reports',
  Settings: 'settings',

  // Super Admin Capabilities
  Everything: 'everything',
  UserManagement: 'user_management',
  RoleManagement: 'role_management',
  SystemSettings: 'system_settings',
  AuditLogs: 'audit_logs',
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

/**
 * Strongly-typed permissions mapping for each role.
 * Super Admin has access to all capabilities via `Permission.Everything`.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  [Role.Guest]: [
    Permission.OwnProfile,
    Permission.OwnBookings,
    Permission.Reviews,
    Permission.Tickets,
  ],
  [Role.Host]: [
    Permission.AssignedTours,
    Permission.AssignedGuests,
    Permission.LiveTracking,
    Permission.Announcements,
  ],
  [Role.Admin]: [
    Permission.Tours,
    Permission.Events,
    Permission.Buses,
    Permission.Hosts,
    Permission.Bookings,
    Permission.Guests,
    Permission.Reviews,
    Permission.Reports,
    Permission.Settings,
  ],
  [Role.SuperAdmin]: [
    Permission.Everything,
    Permission.UserManagement,
    Permission.RoleManagement,
    Permission.SystemSettings,
    Permission.AuditLogs,
    Permission.Tours,
    Permission.Events,
    Permission.Buses,
    Permission.Hosts,
    Permission.Bookings,
    Permission.Guests,
    Permission.Reviews,
    Permission.Reports,
    Permission.Settings,
    Permission.AssignedTours,
    Permission.AssignedGuests,
    Permission.LiveTracking,
    Permission.Announcements,
    Permission.OwnProfile,
    Permission.OwnBookings,
    Permission.Tickets,
  ],
};

/**
 * UI Feature-area access strings for human-readable display badges.
 */
export const ROLE_FEATURE_ACCESS: Record<Role, string[]> = {
  [Role.Guest]: ['own-profile', 'own-bookings', 'reviews', 'tickets'],
  [Role.Host]: ['assigned-tours', 'assigned-guests', 'live-tracking', 'announcements'],
  [Role.Admin]: [
    'tours',
    'events',
    'buses',
    'hosts',
    'bookings',
    'guests',
    'reviews',
    'reports',
    'settings',
  ],
  [Role.SuperAdmin]: [
    'everything',
    'user-management',
    'role-management',
    'system-settings',
    'audit-logs',
  ],
};

/** Where each role lands after login — used by GuestRoute and the post-login redirect. */
export const ROLE_HOME_PATH: Record<Role, string> = {
  [Role.Guest]: '/dashboard',
  [Role.Host]: '/host',
  [Role.Admin]: '/admin',
  [Role.SuperAdmin]: '/admin',
};

/** Roles allowed into each protected route branch — consumed by <RoleGuard allowedRoles={...} />. */
export const ROUTE_ROLE_REQUIREMENTS: Record<string, Role[]> = {
  '/dashboard': [Role.Guest, Role.Host, Role.Admin, Role.SuperAdmin],
  '/profile': [Role.Guest, Role.Host, Role.Admin, Role.SuperAdmin],
  '/bookings': [Role.Guest, Role.Host, Role.Admin, Role.SuperAdmin],
  '/host': [Role.Host, Role.Admin, Role.SuperAdmin],
  '/admin': [Role.Admin, Role.SuperAdmin],
};

/**
 * Helper function to determine if a role has a specific permission.
 * SuperAdmin automatically has all permissions.
 *
 * NOTE: Frontend checks are for UI presentation ONLY.
 * The backend must independently enforce authorization on every API request.
 */
export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  if (role === Role.SuperAdmin) return true;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Check if role has at least one of the required permissions */
export function hasAnyPermission(
  role: Role | null | undefined,
  permissions: readonly Permission[],
): boolean {
  if (!role) return false;
  if (role === Role.SuperAdmin) return true;
  const userPermissions = ROLE_PERMISSIONS[role] ?? [];
  return permissions.some((p) => userPermissions.includes(p));
}

/** Check if role has all specified permissions */
export function hasAllPermissions(
  role: Role | null | undefined,
  permissions: readonly Permission[],
): boolean {
  if (!role) return false;
  if (role === Role.SuperAdmin) return true;
  const userPermissions = ROLE_PERMISSIONS[role] ?? [];
  return permissions.every((p) => userPermissions.includes(p));
}

/** Check if role can access a designated route path */
export function canAccessRoute(role: Role | null | undefined, path: string): boolean {
  if (!role) return false;
  const allowedRoles = ROUTE_ROLE_REQUIREMENTS[path];
  if (!allowedRoles) return true; // Unrestricted route
  return allowedRoles.includes(role);
}
