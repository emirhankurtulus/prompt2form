import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFormAnalytic extends Document {
  _id: mongoose.Types.ObjectId;
  formId: mongoose.Types.ObjectId;
  date: string; // 'YYYY-MM-DD'
  views: number;
  starts: number;
  completions: number;
  avgDuration?: number;
  deviceData?: { desktop: number; mobile: number; tablet: number };
  countryData?: Record<string, number>;
  referrerData?: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFieldAnalytic extends Document {
  _id: mongoose.Types.ObjectId;
  formId: mongoose.Types.ObjectId;
  fieldId: string;
  date: string; // 'YYYY-MM-DD'
  views: number;
  interactions: number;
  dropoffs: number;
  skips: number;
  createdAt: Date;
  updatedAt: Date;
}

const FormAnalyticSchema = new Schema<IFormAnalytic>(
  {
    formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
    date: { type: String, required: true },
    views: { type: Number, default: 0 },
    starts: { type: Number, default: 0 },
    completions: { type: Number, default: 0 },
    avgDuration: { type: Number },
    deviceData: { type: Schema.Types.Mixed },
    countryData: { type: Schema.Types.Mixed },
    referrerData: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

FormAnalyticSchema.index({ formId: 1, date: -1 });
FormAnalyticSchema.index({ formId: 1, date: 1 }, { unique: true });

const FieldAnalyticSchema = new Schema<IFieldAnalytic>(
  {
    formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
    fieldId: { type: String, required: true },
    date: { type: String, required: true },
    views: { type: Number, default: 0 },
    interactions: { type: Number, default: 0 },
    dropoffs: { type: Number, default: 0 },
    skips: { type: Number, default: 0 },
  },
  { timestamps: true },
);

FieldAnalyticSchema.index({ formId: 1, fieldId: 1, date: 1 }, { unique: true });

export const FormAnalytic: Model<IFormAnalytic> =
  mongoose.models.FormAnalytic ||
  mongoose.model<IFormAnalytic>('FormAnalytic', FormAnalyticSchema);

export const FieldAnalytic: Model<IFieldAnalytic> =
  mongoose.models.FieldAnalytic ||
  mongoose.model<IFieldAnalytic>('FieldAnalytic', FieldAnalyticSchema);
