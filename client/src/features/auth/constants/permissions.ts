import { Role } from '@/features/auth/types/role';

/**
 * Feature-area access per role, straight from the brief. This map
 * drives UI decisions ONLY — which nav links/sections to show, which
 * routes RoleGuard allows. It is explicitly NOT a security boundary;
 * see the SECURITY note in RoleGuard.tsx and docs/AUTHENTICATION.md.
 * The backend must independently re-check every one of these on every
 * request, because a browser's JavaScript (and therefore this map) is
 * fully under the visitor's control and can be bypassed trivially.
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
