import mongoose, { Schema, Document, Model } from 'mongoose';
import type { FormSchema, FormTheme, FormSettings } from '@/types/form';

export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'PAUSED';

export interface IForm extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  slug: string;
  status: FormStatus;
  formSchema: FormSchema;
  theme?: Partial<FormTheme>;
  settings?: Partial<FormSettings>;
  publishedAt?: Date;
  expiresAt?: Date;
  responseLimit?: number;
  passwordHash?: string;
  seoTitle?: string;
  seoDescription?: string;
  /** 'YYYY-MM' — used for the 4-forms-per-month enforcement */
  monthCreated: string;
  createdAt: Date;
  updatedAt: Date;
}

const FormSchemaMongoose = new Schema<IForm>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'PAUSED'],
      default: 'DRAFT',
    },
    formSchema: { type: Schema.Types.Mixed, required: true },
    theme: { type: Schema.Types.Mixed },
    settings: { type: Schema.Types.Mixed },
    publishedAt: { type: Date },
    expiresAt: { type: Date },
    responseLimit: { type: Number },
    passwordHash: { type: String },
    seoTitle: { type: String },
    seoDescription: { type: String },
    monthCreated: { type: String, required: true },
  },
  { timestamps: true, autoIndex: false },
);

FormSchemaMongoose.index({ userId: 1 });
FormSchemaMongoose.index({ userId: 1, monthCreated: 1 }); // fast 4/month check

export const Form: Model<IForm> =
  mongoose.models.Form || mongoose.model<IForm>('Form', FormSchemaMongoose);
