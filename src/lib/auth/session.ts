import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import type { SessionUser } from '@/types/form';

const COOKIE_NAME = 'p2f_token';
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'dev-secret-change-in-production-minimum-32-chars',
);
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

function daysToSeconds(duration: string): number {
  const match = duration.match(/^(\d+)d$/);
  if (match) return parseInt(match[1], 10) * 24 * 60 * 60;
  return 7 * 24 * 60 * 60; // default 7 days
}

export interface JwtPayload extends JWTPayload {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

export async function signToken(user: SessionUser): Promise<string> {
  const expiresIn = daysToSeconds(EXPIRES_IN);
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
  } satisfies Omit<JwtPayload, keyof JWTPayload>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

/** Sets the HttpOnly JWT cookie in a Route Handler or Server Action */
export async function setSessionCookie(user: SessionUser): Promise<void> {
  const token = await signToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: daysToSeconds(EXPIRES_IN),
  });
}

/** Clears the session cookie (logout) */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
}

/** Reads and verifies the JWT cookie from the current request */
export async function getSessionUser(): Promise<JwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}
