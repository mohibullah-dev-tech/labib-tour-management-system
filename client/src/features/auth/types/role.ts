/**
 * Strongly-typed role system — every role check in the app imports
 * `Role` from here, never compares against a raw string literal. This
 * is what "Do NOT use arbitrary strings throughout the application"
 * means in practice: `role === Role.Admin`, never `role === 'admin'`.
 *
 * A `const` object (not a TS `enum`) is used deliberately — it produces
 * plain string values at runtime (easy to serialize in a JWT payload or
 * log, no enum-specific tooling quirks) while still giving full
 * type-safety via the derived `Role` union type below.
 */
export const Role = {
  Guest: 'guest',
  Host: 'host',
  Admin: 'admin',
  SuperAdmin: 'super_admin',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ALL_ROLES: Role[] = [Role.Guest, Role.Host, Role.Admin, Role.SuperAdmin];

export const ROLE_LABELS: Record<Role, string> = {
  [Role.Guest]: 'Guest',
  [Role.Host]: 'Host',
  [Role.Admin]: 'Admin',
  [Role.SuperAdmin]: 'Super Admin',
};

/** Type guard — useful when a role arrives as an unvalidated string (e.g. from a decoded token payload). */
export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ALL_ROLES as string[]).includes(value);
}
