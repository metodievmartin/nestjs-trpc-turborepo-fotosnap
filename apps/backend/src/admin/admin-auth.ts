import { IncomingHttpHeaders } from 'node:http';

import { ConfigService } from '@nestjs/config';
import { AuthService } from '@thallesp/nestjs-better-auth';

import { ADMIN_ROLES } from './admin.constants';

export type AdminAuthResult = 'ok' | 'unauthenticated' | 'forbidden';

/**
 * Normalise Node's `IncomingHttpHeaders` (values may be `string | string[] |
 * undefined`) into a standard `Headers` object suitable for passing to
 * Better Auth's fetch-flavoured APIs.
 *
 * Array-valued headers are joined with `, ` per RFC 7230 §3.2.2 — which is
 * what a well-behaved HTTP stack would have sent on the wire in the first
 * place, so downstream consumers see a single string.
 */
function toHeaders(src: IncomingHttpHeaders): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(src)) {
    if (typeof value === 'string') headers.set(key, value);
    else if (Array.isArray(value)) headers.set(key, value.join(', '));
  }
  return headers;
}

/**
 * Parse `ADMIN_USER_IDS` (comma-separated) into a set. Empty / unset → empty
 * set. This is the zero-DB-write bootstrap list — any user id in here is
 * treated as admin regardless of the DB `role` column.
 */
export function parseAdminUserIds(
  configService: ConfigService,
): ReadonlySet<string> {
  const raw = configService.get<string>('ADMIN_USER_IDS') ?? '';
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

// The DB schema stores `role` as a scalar `text`, so in practice we only ever
// see a string. The array branch here exists to match the library's declared
// `role?: string | string[]` type (@thallesp/nestjs-better-auth/UserSession)
// — staying defensive is cheaper than assuming the runtime narrows it.
function hasAdminRole(role: unknown): boolean {
  const roles = Array.isArray(role) ? role : role ? [role] : [];
  const allowed: readonly string[] = ADMIN_ROLES;
  return roles.some((r) => typeof r === 'string' && allowed.includes(r));
}

/**
 * Resolve the current request to an admin-auth result. Pure enough to unit
 * test with a fake `AuthService`; the callers (guard vs. middleware) decide
 * how to translate the result into a framework-specific response.
 *
 * Accepts Node's raw `IncomingHttpHeaders` and normalises internally — don't
 * pass `HeadersInit` here, the cast from Express's headers type is unsafe
 * when any header arrives as `string[]`.
 */
export async function checkAdminAccess(
  authService: AuthService,
  headers: IncomingHttpHeaders,
  adminUserIds: ReadonlySet<string>,
): Promise<AdminAuthResult> {
  const session = await authService.api.getSession({
    headers: toHeaders(headers),
  });

  if (!session?.user) return 'unauthenticated';

  const userId = session.user.id;
  const role = (session.user as { role?: string | string[] }).role;

  if (hasAdminRole(role) || adminUserIds.has(userId)) {
    return 'ok';
  }

  return 'forbidden';
}
