import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb/client';
import { User } from '@/lib/mongodb/models/user.model';
import { EmailToken } from '@/lib/mongodb/models/email-token.model';
import { hashPassword } from '@/lib/auth/password';
import { hashToken } from '@/lib/auth/tokens';
import { apiSuccess, apiError } from '@/lib/utils';

const ResetSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ResetSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { token: rawToken, password } = parsed.data;

    await connectDB();

    const hashedToken = hashToken(rawToken);
    const tokenDoc = await EmailToken.findOne({
      token: hashedToken,
      type: 'RESET_PASSWORD',
      usedAt: { $exists: false },
    });

    if (!tokenDoc) {
      return apiError(
        'This reset link is invalid or has already been used.',
        'INVALID_TOKEN',
        400,
      );
    }

    if (tokenDoc.expiresAt < new Date()) {
      return apiError(
        'This reset link has expired. Please request a new one.',
        'TOKEN_EXPIRED',
        400,
      );
    }

    const passwordHash = await hashPassword(password);

    await User.findByIdAndUpdate(tokenDoc.userId, { passwordHash });
    await EmailToken.findByIdAndUpdate(tokenDoc._id, { usedAt: new Date() });

    return apiSuccess({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (error) {
    console.error('[ResetPassword] Error:', error);
    return apiError('Failed to reset password. Please try again.', 'INTERNAL_ERROR', 500);
  }
}
