import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth/session';
import { connectDB } from '@/lib/mongodb/client';
import { Form } from '@/lib/mongodb/models/form.model';
import { Response } from '@/lib/mongodb/models/response.model';
import { FormAnalytic } from '@/lib/mongodb/models/form-analytic.model';
import { ActivityLog } from '@/lib/mongodb/models/activity-log.model';
import { checkMonthlyFormLimit, getCurrentMonthKey } from '@/lib/form-limit';
import { generateFormSlug, apiSuccess, apiError } from '@/lib/utils';
import { generateId } from '@/lib/utils';
import type { FormSchema, FormTheme, FormSettings } from '@/types/form';

// ─── GET: List user's forms ────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return apiError('Unauthorized', 'UNAUTHORIZED', 401);

  await connectDB();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const pageSize = Math.min(50, parseInt(searchParams.get('pageSize') ?? '20', 10));
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const filter: Record<string, unknown> = { userId: user.id };
  if (status) filter.status = status.toUpperCase();
  if (search) filter.title = { $regex: search, $options: 'i' };

  const [forms, total] = await Promise.all([
    Form.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .select('-formSchema')
      .lean(),
    Form.countDocuments(filter),
  ]);

  // Attach metrics (response count & view count) to each form
  const formIds = forms.map((f) => f._id);
  const [responseCounts, analytics] = await Promise.all([
    Response.aggregate([
      { $match: { formId: { $in: formIds } } },
      { $group: { _id: '$formId', count: { $sum: 1 } } },
    ]),
    FormAnalytic.aggregate([
      { $match: { formId: { $in: formIds } } },
      { $group: { _id: '$formId', totalViews: { $sum: '$viewCount' } } },
    ]),
  ]);

  const respMap = new Map(responseCounts.map((r) => [r._id.toString(), r.count]));
  const viewsMap = new Map(analytics.map((a) => [a._id.toString(), a.totalViews]));

  const formsWithMetrics = forms.map((f) => ({
    ...f,
    responsesCount: respMap.get(f._id.toString()) ?? 0,
    viewsCount: viewsMap.get(f._id.toString()) ?? 0,
  }));

  return apiSuccess(formsWithMetrics, { total, page, pageSize });
}

// ─── POST: Create a new form manually ─────────────────────────────────────────

const CreateFormSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return apiError('Unauthorized', 'UNAUTHORIZED', 401);

  await connectDB();

  const limit = await checkMonthlyFormLimit(user.id);
  if (!limit.allowed) {
    return apiError(
      `You've reached your monthly limit of ${limit.limit} forms. Limit resets on ${limit.resetDate}.`,
      'FORM_LIMIT_EXCEEDED',
      429,
    );
  }

  const body = await request.json();
  const parsed = CreateFormSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
  }

  const { title, description } = parsed.data;

  const defaultTheme: FormTheme = {
    primaryColor: '#7c3aed',
    secondaryColor: '#6d28d9',
    backgroundColor: '#ffffff',
    textColor: '#09090b',
    borderRadius: '8px',
    fontFamily: 'Inter, sans-serif',
    fontSize: '15px',
    inputBg: '#fafafa',
    inputBorder: '#e4e4e7',
    buttonBg: '#7c3aed',
    buttonText: '#ffffff',
    animation: 'fade',
    spacing: 'comfortable',
  };

  const defaultSettings: FormSettings = {
    submitButtonText: 'Submit',
    successMessage: 'Thank you! Your response has been recorded.',
    progressBar: false,
    progressStyle: 'bar',
  };

  const defaultFormSchema: FormSchema = {
    version: '1.0',
    title,
    description,
    pages: [{ id: generateId(), fields: [] }],
    multiStep: false,
    theme: defaultTheme,
    settings: defaultSettings,
    metadata: { generatedBy: 'manual' },
  };

  const form = await Form.create({
    userId: user.id,
    title,
    description,
    slug: generateFormSlug(title),
    formSchema: defaultFormSchema,
    monthCreated: getCurrentMonthKey(),
  });

  await ActivityLog.create({
    userId: user.id,
    action: 'form.created',
    entityId: form._id,
    entity: 'Form',
    metadata: { description: `Created form "${title}"` },
  });

  return apiSuccess(form, undefined, 201);
}
