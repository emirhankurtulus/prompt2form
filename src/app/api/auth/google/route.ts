import { NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { connectDB } from '@/lib/mongodb/client';
import { User } from '@/lib/mongodb/models/user.model';
import { setSessionCookie } from '@/lib/auth/session';
import { apiSuccess, apiError } from '@/lib/utils';

// Read Client ID from env
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return apiError('Token is required.', 'TOKEN_REQUIRED', 400);
    }

    if (!GOOGLE_CLIENT_ID) {
      return apiError('Google OAuth is not configured on the server.', 'CONFIG_ERROR', 500);
    }

    // Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return apiError('Failed to verify token payload.', 'INVALID_TOKEN', 400);
    }

    const { email, name, picture } = payload;

    await connectDB();

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create user verified by Google without password
      user = await User.create({
        email,
        name: name || 'Google User',
        passwordHash: 'OAUTH_EXTERNAL_ACCOUNT', // Dummy hash for OAuth users
        avatarUrl: picture,
        emailVerified: true, // Google verifies emails automatically
      });
    } else {
      // Update avatar or verification status if necessary
      let hasUpdates = false;
      if (!user.emailVerified) {
        user.emailVerified = true;
        hasUpdates = true;
      }
      if (picture && user.avatarUrl !== picture) {
        user.avatarUrl = picture;
        hasUpdates = true;
      }
      if (hasUpdates) {
        await user.save();
      }
    }

    // Set JWT Session Cookie
    await setSessionCookie({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
    });

    return apiSuccess({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error: any) {
    console.error('[Google Auth API Error]:', error);
    return apiError(
      error?.message || 'Authentication with Google failed.',
      'GOOGLE_AUTH_FAILED',
      500
    );
  }
}
