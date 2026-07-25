import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/session';

// Routes that DO NOT require authentication
const PUBLIC_PATHS = [
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/f/',          // public form viewer
  '/embed/',      // embeddable form
  '/api/auth/',   // auth API routes (login, register, etc.)
  '/api/responses', // form submission endpoint (public)
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths, static files, and Next.js internals
  if (
    isPublicPath(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Read the JWT cookie
  const token = request.cookies.get('p2f_token')?.value;

  if (!token) {
    // Redirect unauthenticated users to sign-in
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Verify the token
  const payload = await verifyToken(token);

  if (!payload) {
    // Invalid/expired token — clear cookie and redirect
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    response.cookies.set('p2f_token', '', { maxAge: 0, path: '/' });
    return response;
  }

  // Inject user ID into request headers for Route Handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.id);
  requestHeaders.set('x-user-email', payload.email);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public/ assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
