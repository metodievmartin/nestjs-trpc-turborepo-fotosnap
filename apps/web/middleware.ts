import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest } from 'next/dist/server/web/spec-extension/request';
import { NextResponse } from 'next/dist/server/web/spec-extension/response';

const publicRoutes = ['/login', '/signup'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // We only check for the presence of the session cookie, not its validity.
  // The actual authentication is enforced by the backend on every API request.
  // This middleware is purely a UX guard to avoid loading protected pages for
  // users who clearly have no session.
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
