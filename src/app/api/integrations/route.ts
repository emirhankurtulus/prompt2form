import { NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { connectDB } from '@/lib/mongodb/client';
import { IntegrationConfig } from '@/lib/mongodb/models/integration-config.model';
import { apiSuccess, apiError } from '@/lib/utils';

// ─── GET: Fetch user's integrations settings ──────────────────────────────────

export async function GET() {
  const user = await getSessionUser();
  if (!user) return apiError('Unauthorized', 'UNAUTHORIZED', 401);

  await connectDB();

  let config = await IntegrationConfig.findOne({ userId: user.id }).lean();
  if (!config) {
    // Return default config
    config = {
      userId: user.id as any,
      emailEnabled: true,
      notificationEmails: [user.email],
      webhookEnabled: false,
      webhookUrl: '',
      googleSheetsEnabled: false,
      googleSheetsWebhookUrl: '',
    } as any;
  }

  return apiSuccess(config);
}

// ─── POST: Update user's integrations settings ────────────────────────────────

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return apiError('Unauthorized', 'UNAUTHORIZED', 401);

  await connectDB();

  const body = await request.json();
  const {
    emailEnabled,
    notificationEmails,
    webhookEnabled,
    webhookUrl,
    googleSheetsEnabled,
    googleSheetsWebhookUrl,
  } = body;

  const config = await IntegrationConfig.findOneAndUpdate(
    { userId: user.id },
    {
      userId: user.id,
      emailEnabled: !!emailEnabled,
      notificationEmails: Array.isArray(notificationEmails) ? notificationEmails : [user.email],
      webhookEnabled: !!webhookEnabled,
      webhookUrl: webhookUrl || '',
      googleSheetsEnabled: !!googleSheetsEnabled,
      googleSheetsWebhookUrl: googleSheetsWebhookUrl || '',
    },
    { upsert: true, new: true },
  );

  return apiSuccess(config);
}
