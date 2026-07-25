import mongoose, { Schema, Document, Model } from 'mongoose';

export type ResponseStatus = 'NEW' | 'REVIEWED' | 'ARCHIVED' | 'SPAM';

export interface IAttachment {
  fieldId: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface IResponse extends Document {
  _id: mongoose.Types.ObjectId;
  formId: mongoose.Types.ObjectId;
  data: Record<string, unknown>;
  metadata?: {
    ip?: string;
    userAgent?: string;
    referrer?: string;
    country?: string;
    device?: 'desktop' | 'mobile' | 'tablet';
  };
  status: ResponseStatus;
  duration?: number;
  completedAt?: Date;
  notes?: string;
  tags: string[];
  starred: boolean;
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    fieldId: { type: String, required: true },
    url: { type: String, required: true },
    filename: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
  },
  { _id: false },
);

const ResponseSchema = new Schema<IResponse>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    data: { type: Schema.Types.Mixed, required: true },
    metadata: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ['NEW', 'REVIEWED', 'ARCHIVED', 'SPAM'],
      default: 'NEW',
    },
    duration: { type: Number },
    completedAt: { type: Date },
    notes: { type: String },
    tags: [{ type: String }],
    starred: { type: Boolean, default: false },
    attachments: [AttachmentSchema],
  },
  { timestamps: true },
);

ResponseSchema.index({ formId: 1 });
ResponseSchema.index({ formId: 1, createdAt: -1 });

export const Response: Model<IResponse> =
  mongoose.models.Response ||
  mongoose.model<IResponse>('Response', ResponseSchema);
