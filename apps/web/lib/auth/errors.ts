import { authClient } from './client';

/**
 * Union of all error codes exposed by better-auth.
 * Derived from the SDK client to stay in sync with upstream changes.
 */
type ErrorCode = keyof typeof authClient.$ERROR_CODES;

/**
 * User-facing messages for known auth error codes.
 * Only codes that need a custom message are listed — unmapped codes
 * fall through to {@link FALLBACK_MESSAGE}.
 */
const errorMessages: Partial<Record<ErrorCode, string>> = {
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    'An account with this email already exists',
  INVALID_EMAIL_OR_PASSWORD: 'The email or password is incorrect',
  EMAIL_NOT_VERIFIED: 'Please verify your email before signing in',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again',
};

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

/**
 * Resolves an auth error code to a user-facing message.
 * Returns a generic fallback for `undefined` or unmapped codes.
 */
export function getAuthErrorMessage(code: string | undefined): string {
  if (!code) {
    return FALLBACK_MESSAGE;
  }

  return errorMessages[code as ErrorCode] ?? FALLBACK_MESSAGE;
}
