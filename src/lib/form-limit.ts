import { connectDB } from '@/lib/mongodb/client';
import { Form } from '@/lib/mongodb/models/form.model';
import type { FormLimitResult } from '@/types/form';

const MONTHLY_LIMIT = 4;

export async function checkMonthlyFormLimit(
  userId: string,
): Promise<FormLimitResult> {
  await connectDB();

  const monthKey = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  const count = await Form.countDocuments({ userId, monthCreated: monthKey });

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1, 1);
  nextMonth.setHours(0, 0, 0, 0);

  return {
    allowed: count < MONTHLY_LIMIT,
    count,
    limit: MONTHLY_LIMIT,
    resetDate: nextMonth.toISOString().split('T')[0],
  };
}

export function getCurrentMonthKey(): string {
  return new Date().toISOString().slice(0, 7);
}
