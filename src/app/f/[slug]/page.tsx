import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb/client';
import { Form } from '@/lib/mongodb/models/form.model';
import { FormAnalytic } from '@/lib/mongodb/models/form-analytic.model';
import FormViewerClient from './FormViewerClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const form = await Form.findOne({ slug }).select('title description seoTitle seoDescription').lean();
  if (!form) return { title: 'Form Not Found' };

  return {
    title: form.seoTitle || form.title,
    description: form.seoDescription || form.description,
  };
}

export default async function PublicFormPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();

  const form = await Form.findOne({ slug }).lean();
  if (!form) notFound();

  // Track view count asynchronously
  try {
    const today = new Date().toISOString().slice(0, 10);
    await FormAnalytic.findOneAndUpdate(
      { formId: form._id, date: today },
      { $inc: { viewCount: 1 } },
      { upsert: true },
    );
  } catch (err) {
    console.error('[Track View Error]:', err);
  }

  // Convert Mongoose doc to plain JSON
  const plainForm = JSON.parse(JSON.stringify(form));

  return <FormViewerClient form={plainForm} />;
}
