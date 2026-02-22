import { createAuthClient } from 'better-auth/react';

// The auth client is a browser-side helper provided by better-auth.
// It exposes methods like authClient.signIn(), authClient.signOut(), and
// authClient.useSession() for interacting with the auth API from React components.
// Requests are sent to /api/auth/*, which Next.js proxies to the backend.
export const authClient = createAuthClient({
  basePath: '/api/auth',
});
