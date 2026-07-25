import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb/client';
import { User } from '@/lib/mongodb/models/user.model';
import { EmailToken } from '@/lib/mongodb/models/email-token.model';
import { generateRawToken, hashToken, getVerifyTokenExpiry } from '@/lib/auth/tokens';
import { sendVerifyEmail } from '@/lib/email/mailer';
import { apiSuccess, apiError } from '@/lib/utils';

const ResendSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ResendSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('Invalid email address.', 'VALIDATION_ERROR', 400);
    }

    const { email } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email });

    if (!user) {
      // Return generic success to avoid email enumeration
      return apiSuccess({
        message: 'If an unverified account exists with this email, a verification link has been sent.',
      });
    }

    if (user.emailVerified) {
      return apiError('This email is already verified. Please sign in.', 'ALREADY_VERIFIED', 400);
    }

    // Delete existing verification tokens for this user
    await EmailToken.deleteMany({ userId: user._id, type: 'VERIFY_EMAIL' });

    // Generate new token
    const rawToken = generateRawToken();
    const hashedToken = hashToken(rawToken);

    await EmailToken.create({
      userId: user._id,
      token: hashedToken,
      type: 'VERIFY_EMAIL',
      expiresAt: getVerifyTokenExpiry(),
    });

    // Send email
    try {
      await sendVerifyEmail(email, user.name, rawToken);
    } catch (emailError: any) {
      console.error('[ResendVerification] Failed to send email:', emailError);
      return apiError(
        emailError?.message || 'Failed to send verification email. Please check SMTP settings.',
        'EMAIL_SEND_FAILED',
        500,
      );
    }

    return apiSuccess({
      message: 'Verification email resent successfully. Please check your inbox.',
    });
  } catch (error) {
    console.error('[ResendVerification] Error:', error);
    return apiError('Failed to resend verification email. Please try again.', 'INTERNAL_ERROR', 500);
  }
}
