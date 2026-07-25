import { getSessionUser } from '@/lib/auth/session';
import { connectDB } from '@/lib/mongodb/client';
import { Form } from '@/lib/mongodb/models/form.model';
import { Response } from '@/lib/mongodb/models/response.model';
import { ActivityLog } from '@/lib/mongodb/models/activity-log.model';
import { apiSuccess, apiError } from '@/lib/utils';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return apiError('Unauthorized', 'UNAUTHORIZED', 401);

  await connectDB();

  const userId = user.id;
  const monthKey = new Date().toISOString().slice(0, 7);
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [
    totalForms,
    formsThisMonth,
    totalResponses,
    responsesThisMonth,
    recentForms,
    recentActivity,
  ] = await Promise.all([
    Form.countDocuments({ userId }),
    Form.countDocuments({ userId, monthCreated: monthKey }),
    Response.countDocuments({
      formId: { $in: await Form.find({ userId }).distinct('_id') },
    }),
    Response.countDocuments({
      formId: { $in: await Form.find({ userId }).distinct('_id') },
      createdAt: { $gte: startOfMonth },
    }),
    Form.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('_id title status updatedAt monthCreated')
      .lean(),
    ActivityLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
  ]);

  return apiSuccess({
    totalForms,
    formsThisMonth,
    newFormsThisMonth: formsThisMonth,
    totalResponses,
    responsesThisMonth,
    avgConversion: 0, // Calculated later when analytics are built
    totalViews: 0,    // Calculated later when analytics are built
    recentForms,
    recentActivity,
  });
}
