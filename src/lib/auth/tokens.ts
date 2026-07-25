import crypto from 'crypto';

/** Generate a cryptographically secure random token (hex string, 64 chars) */
export function generateRawToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/** Hash a raw token with SHA-256 before storing in DB */
export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/** Get expiry date: 1 hour from now (for password reset) */
export function getResetTokenExpiry(): Date {
  return new Date(Date.now() + 60 * 60 * 1000);
}

/** Get expiry date: 24 hours from now (for email verification) */
export function getVerifyTokenExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}
