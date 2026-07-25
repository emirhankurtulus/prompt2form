import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/mongodb/client';
import { User } from '@/lib/mongodb/models/user.model';
import { EmailToken } from '@/lib/mongodb/models/email-token.model';
import { hashPassword } from '@/lib/auth/password';
import { generateRawToken, hashToken, getVerifyTokenExpiry } from '@/lib/auth/tokens';
import { sendVerifyEmail } from '@/lib/email/mailer';
import { apiSuccess, apiError } from '@/lib/utils';

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0].message,
        'VALIDATION_ERROR',
        400,
        parsed.error.issues,
      );
    }

    const { name, email, password } = parsed.data;

    await connectDB();

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      // If user is already verified, reject registration
      if (existing.emailVerified) {
        return apiError(
          'An account with this email already exists. Please sign in.',
          'EMAIL_EXISTS',
          409,
        );
      }

      // If user exists but is NOT verified yet, update their info and resend verification email
      const passwordHash = await hashPassword(password);
      existing.name = name;
      existing.passwordHash = passwordHash;
      await existing.save();

      // Delete existing verification tokens
      await EmailToken.deleteMany({ userId: existing._id, type: 'VERIFY_EMAIL' });

      // Generate new token
      const rawToken = generateRawToken();
      const hashedToken = hashToken(rawToken);

      await EmailToken.create({
        userId: existing._id,
        token: hashedToken,
        type: 'VERIFY_EMAIL',
        expiresAt: getVerifyTokenExpiry(),
      });

      // Send verification email
      try {
        await sendVerifyEmail(email, name, rawToken);
      } catch (emailError) {
        console.error('[Register] Failed to send verification email:', emailError);
      }

      return apiSuccess(
        {
          message: 'An unverified account with this email already existed. We updated your info and resent a new verification link.',
          emailSent: true,
          resent: true,
        },
        undefined,
        200,
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create new user
    const user = await User.create({ name, email, passwordHash });

    // Generate email verification token
    const rawToken = generateRawToken();
    const hashedToken = hashToken(rawToken);

    await EmailToken.create({
      userId: user._id,
      token: hashedToken,
      type: 'VERIFY_EMAIL',
      expiresAt: getVerifyTokenExpiry(),
    });

    // Send verification email
    try {
      await sendVerifyEmail(email, name, rawToken);
    } catch (emailError) {
      console.error('[Register] Failed to send verification email:', emailError);
    }

    return apiSuccess(
      {
        message: 'Account created successfully. Please check your email to verify your account.',
        emailSent: true,
      },
      undefined,
      201,
    );
  } catch (error) {
    console.error('[Register] Error:', error);
    return apiError('Failed to create account. Please try again.', 'INTERNAL_ERROR', 500);
  }
}
