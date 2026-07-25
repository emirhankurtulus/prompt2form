import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFormVersion extends Document {
  _id: mongoose.Types.ObjectId;
  formId: mongoose.Types.ObjectId;
  formSchema: Record<string, unknown>;
  theme?: Record<string, unknown>;
  changelog?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FormVersionSchema = new Schema<IFormVersion>(
  {
    formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
    formSchema: { type: Schema.Types.Mixed, required: true },
    theme: { type: Schema.Types.Mixed },
    changelog: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

FormVersionSchema.index({ formId: 1, createdAt: -1 });

export const FormVersion: Model<IFormVersion> =
  mongoose.models.FormVersion ||
  mongoose.model<IFormVersion>('FormVersion', FormVersionSchema);
