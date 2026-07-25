import { clearSessionCookie } from '@/lib/auth/session';
import { apiSuccess } from '@/lib/utils';

export async function POST() {
  await clearSessionCookie();
  return apiSuccess({ message: 'Logged out successfully.' });
}
