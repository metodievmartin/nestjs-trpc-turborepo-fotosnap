/**
 * Single source of truth for roles that grant admin access.
 *
 * Used in two places:
 *  - {@link ../app.module.ts} passes this to Better Auth's `admin` plugin as
 *    `adminRoles`, so the plugin treats these roles as elevated for its own
 *    built-in operations (user bans, impersonation, etc.).
 *  - {@link ./admin-auth.ts} uses this to gate our own admin HTTP surface
 *    (Bull Board via middleware, and `@UseGuards(AdminGuard)` routes).
 *
 * Add a role here (e.g. `'superadmin'`) and both paths pick it up; no string
 * literal lives elsewhere in the codebase.
 */
export const ADMIN_ROLES = ['admin'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const DEFAULT_USER_ROLE = 'user';
