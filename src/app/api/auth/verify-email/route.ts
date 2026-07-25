import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb/client';
import { User } from '@/lib/mongodb/models/user.model';
import { EmailToken } from '@/lib/mongodb/models/email-token.model';
import { hashToken } from '@/lib/auth/tokens';
import { setSessionCookie } from '@/lib/auth/session';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawToken = searchParams.get('token');

    if (!rawToken) {
      return apiError('Invalid verification link.', 'INVALID_TOKEN', 400);
    }

    await connectDB();

    const hashedToken = hashToken(rawToken);
    const tokenDoc = await EmailToken.findOne({
      token: hashedToken,
      type: 'VERIFY_EMAIL',
      usedAt: { $exists: false },
    });

    if (!tokenDoc) {
      return apiError(
        'This verification link is invalid or has already been used.',
        'INVALID_TOKEN',
        400,
      );
    }

    if (tokenDoc.expiresAt < new Date()) {
      return apiError(
        'This verification link has expired. Please request a new one.',
        'TOKEN_EXPIRED',
        400,
      );
    }

    // Mark user as verified
    const user = await User.findByIdAndUpdate(
      tokenDoc.userId,
      { emailVerified: true },
      { new: true },
    );

    if (!user) {
      return apiError('User not found.', 'NOT_FOUND', 404);
    }

    // Mark token as used
    await EmailToken.findByIdAndUpdate(tokenDoc._id, { usedAt: new Date() });

    // Auto-login user
    await setSessionCookie({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      emailVerified: true,
    });

    return apiSuccess({ message: 'Email verified successfully. Welcome to Prompt2Form!' });
  } catch (error) {
    console.error('[VerifyEmail] Error:', error);
    return apiError('Verification failed. Please try again.', 'INTERNAL_ERROR', 500);
  }
}
