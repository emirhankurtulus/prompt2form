import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb/client';
import { Form } from '@/lib/mongodb/models/form.model';
import { User } from '@/lib/mongodb/models/user.model';
import { Response } from '@/lib/mongodb/models/response.model';
import { FormAnalytic } from '@/lib/mongodb/models/form-analytic.model';
import { ActivityLog } from '@/lib/mongodb/models/activity-log.model';
import { getSessionUser } from '@/lib/auth/session';
import { IntegrationConfig } from '@/lib/mongodb/models/integration-config.model';
import { sendFormResponseNotification } from '@/lib/email/mailer';
import { apiSuccess, apiError } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ formId: string }>;
}

// ─── GET: List responses for a form (Authenticated) ───────────────────────────

export async function GET(request: NextRequest, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) return apiError('Unauthorized', 'UNAUTHORIZED', 401);

  const { formId } = await params;
  await connectDB();

  const form = await Form.findOne({ _id: formId, userId: user.id });
  if (!form) return apiError('Form not found', 'NOT_FOUND', 404);

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '50', 10));
  const starredOnly = searchParams.get('starred') === 'true';

  const filter: Record<string, unknown> = { formId };
  if (starredOnly) filter.starred = true;

  const [responses, total] = await Promise.all([
    Response.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),
    Response.countDocuments(filter),
  ]);

  return apiSuccess(responses, { total, page, pageSize });
}

// ─── POST: Submit a form response (Public) ────────────────────────────────────

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { formId } = await params;
  await connectDB();

  const form = await Form.findById(formId);
  if (!form) return apiError('Form not found', 'NOT_FOUND', 404);

  const body = await request.json();
  const { answers, completionTimeSeconds } = body;

  if (!answers || typeof answers !== 'object') {
    return apiError('Answers are required', 'VALIDATION_ERROR', 400);
  }

  // Create response document
  const responseDoc = await Response.create({
    formId: form._id,
    data: answers,
    duration: completionTimeSeconds ?? 0,
  });

  // Increment response counts
  await FormAnalytic.findOneAndUpdate(
    { formId: form._id, date: new Date().toISOString().slice(0, 10) },
    { $inc: { responseCount: 1 }, $setOnInsert: { viewCount: 1 } },
    { upsert: true },
  );

  // Log activity for form owner
  await ActivityLog.create({
    userId: form.userId,
    action: 'response.received',
    entityId: form._id,
    entity: 'Form',
    metadata: { description: `New response received for "${form.title}"` },
  });

  // ─── Trigger Active Integrations (Email, Webhook, Google Sheets) ─────────────
  try {
    const owner = await User.findById(form.userId).lean();
    const config = await IntegrationConfig.findOne({ userId: form.userId }).lean();

    const payload = {
      event: 'response.submitted',
      formId: form._id.toString(),
      formTitle: form.title,
      answers,
      submittedAt: new Date().toISOString(),
    };

    // 1. Email Notification Trigger (Default enabled if no config present or emailEnabled is true)
    const isEmailEnabled = config ? config.emailEnabled : true;
    const recipientEmails = config?.notificationEmails?.length
      ? config.notificationEmails
      : owner?.email
      ? [owner.email]
      : [];

    if (isEmailEnabled && recipientEmails.length > 0) {
      await Promise.allSettled(
        recipientEmails.map((email) =>
          sendFormResponseNotification(email, form.title, answers, form._id.toString()).catch((err) => {
            console.error('[Email Notification Send Error]:', err);
          }),
        ),
      );
    }

    if (config) {
      // 2. Custom Webhook Trigger
      if (config.webhookEnabled && config.webhookUrl) {
        await fetch(config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch((e) => console.error('[Webhook Trigger Error]:', e));
      }

      // 3. Google Sheets Trigger (Web App Script Sync)
      if (config.googleSheetsEnabled && config.googleSheetsWebhookUrl) {
        await fetch(config.googleSheetsWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch((e) => console.error('[Google Sheets Sync Error]:', e));
      }
    }
  } catch (integrationErr) {
    console.error('[Integration Trigger Error]:', integrationErr);
  }

  return apiSuccess(responseDoc, undefined, 201);
}

