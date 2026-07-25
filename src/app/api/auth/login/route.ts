import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb/client';
import { User } from '@/lib/mongodb/models/user.model';
import { comparePassword } from '@/lib/auth/password';
import { setSessionCookie } from '@/lib/auth/session';
import { apiSuccess, apiError } from '@/lib/utils';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError('Invalid email or password.', 'VALIDATION_ERROR', 400);
    }

    const { email, password } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email });

    // Constant-time response — never reveal whether the email exists
    if (!user) {
      await new Promise((r) => setTimeout(r, 200));
      return apiError('Invalid email or password.', 'INVALID_CREDENTIALS', 401);
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return apiError('Invalid email or password.', 'INVALID_CREDENTIALS', 401);
    }

    if (!user.emailVerified) {
      return apiError(
        'Please verify your email address before logging in.',
        'EMAIL_NOT_VERIFIED',
        403,
      );
    }

    // Issue JWT cookie
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
  } catch (error) {
    console.error('[Login] Error:', error);
    return apiError('Failed to login. Please try again.', 'INTERNAL_ERROR', 500);
  }
}
