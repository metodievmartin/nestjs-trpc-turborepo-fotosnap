import { createAuthClient } from 'better-auth/react';

// The auth client is a browser-side helper provided by better-auth.
// It exposes methods like authClient.signIn(), authClient.signOut(), and
// authClient.useSession() for interacting with the auth API from React components.
// Requests are sent to /api/auth/*, which Next.js proxies to the backend.
export const authClient = createAuthClient({
  basePath: '/api/auth',
});

/**
 * Extract the username from a better-auth session user object.
 *
 * better-auth's core schema has a required `name` field. We remap it to the
 * `username` DB column via `user.fields: { name: 'username' }` in the server
 * config. At runtime `session.user.name` therefore contains the username, NOT
 * a display name. This helper makes that mapping explicit so callers don't
 * have to know about the field alias.
 */
export function getSessionUsername(
  session: { user: { name: string } } | null | undefined
): string | undefined {
  return session?.user.name;
}
