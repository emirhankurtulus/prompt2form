import { getSessionUser } from '@/lib/auth/session';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return apiError('Not authenticated.', 'UNAUTHORIZED', 401);
  }
  return apiSuccess({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
  });
}
