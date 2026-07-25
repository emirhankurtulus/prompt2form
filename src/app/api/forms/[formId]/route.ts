import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session';
import { connectDB } from '@/lib/mongodb/client';
import { Form } from '@/lib/mongodb/models/form.model';
import { ActivityLog } from '@/lib/mongodb/models/activity-log.model';
import { apiSuccess, apiError } from '@/lib/utils';

interface RouteParams {
  params: Promise<{ formId: string }>;
}

// ─── GET single form ──────────────────────────────────────────────────────────

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) return apiError('Unauthorized', 'UNAUTHORIZED', 401);

  const { formId } = await params;

  await connectDB();
  const form = await Form.findOne({ _id: formId, userId: user.id }).lean();
  if (!form) return apiError('Form not found', 'NOT_FOUND', 404);

  return apiSuccess(form);
}

// ─── PATCH update form ────────────────────────────────────────────────────────

const UpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'PAUSED']).optional(),
  formSchema: z.unknown().optional(),
  customDomain: z.string().optional(),
  password: z.string().optional(),
  maxResponses: z.number().optional(),
  closesAt: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) return apiError('Unauthorized', 'UNAUTHORIZED', 401);

  const { formId } = await params;

  await connectDB();
  const form = await Form.findOne({ _id: formId, userId: user.id });
  if (!form) return apiError('Form not found', 'NOT_FOUND', 404);

  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
  }

  const updates = parsed.data;

  // Track publish event
  if (updates.status === 'PUBLISHED' && form.status !== 'PUBLISHED') {
    await ActivityLog.create({
      userId: user.id,
      action: 'form.published',
      entityId: form._id,
      entity: 'Form',
      metadata: { description: `Published form "${form.title}"` },
    });
  }

  Object.assign(form, updates);
  await form.save();

  return apiSuccess(form);
}

// ─── DELETE form ──────────────────────────────────────────────────────────────

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) return apiError('Unauthorized', 'UNAUTHORIZED', 401);

  const { formId } = await params;

  await connectDB();
  const form = await Form.findOneAndDelete({ _id: formId, userId: user.id });
  if (!form) return apiError('Form not found', 'NOT_FOUND', 404);

  await ActivityLog.create({
    userId: user.id,
    action: 'form.deleted',
    entityId: formId,
    entity: 'Form',
    metadata: { description: `Deleted form "${form.title}"` },
  });

  return apiSuccess({ deleted: true });
}
