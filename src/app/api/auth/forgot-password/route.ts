import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb/client';
import { User } from '@/lib/mongodb/models/user.model';
import { EmailToken } from '@/lib/mongodb/models/email-token.model';
import { generateRawToken, hashToken, getResetTokenExpiry } from '@/lib/auth/tokens';
import { sendResetPasswordEmail } from '@/lib/email/mailer';
import { apiSuccess, apiError } from '@/lib/utils';

const ForgotSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ForgotSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('Invalid email address.', 'VALIDATION_ERROR', 400);
    }

    const { email } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email });

    // Always return success even if user doesn't exist (prevents email enumeration)
    if (!user) {
      await new Promise((r) => setTimeout(r, 300));
      return apiSuccess({
        message: 'If an account with that email exists, you will receive a reset link shortly.',
      });
    }

    // Delete any existing reset tokens for this user
    await EmailToken.deleteMany({ userId: user._id, type: 'RESET_PASSWORD' });

    // Generate new reset token
    const rawToken = generateRawToken();
    const hashedToken = hashToken(rawToken);

    await EmailToken.create({
      userId: user._id,
      token: hashedToken,
      type: 'RESET_PASSWORD',
      expiresAt: getResetTokenExpiry(),
    });

    try {
      await sendResetPasswordEmail(email, user.name, rawToken);
    } catch (emailError) {
      console.error('[ForgotPassword] Email send failed:', emailError);
    }

    return apiSuccess({
      message: 'If an account with that email exists, you will receive a reset link shortly.',
    });
  } catch (error) {
    console.error('[ForgotPassword] Error:', error);
    return apiError('An error occurred. Please try again.', 'INTERNAL_ERROR', 500);
  }
}
