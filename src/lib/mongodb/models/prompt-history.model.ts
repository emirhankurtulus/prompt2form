import mongoose, { Schema, Document, Model } from 'mongoose';

export type PromptType = 'GENERATE' | 'EDIT' | 'ANALYZE' | 'IMPROVE';

export interface IPromptHistory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  formId?: mongoose.Types.ObjectId;
  prompt: string;
  type: PromptType;
  result?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

const PromptHistorySchema = new Schema<IPromptHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    formId: { type: Schema.Types.ObjectId, ref: 'Form' },
    prompt: { type: String, required: true },
    type: {
      type: String,
      enum: ['GENERATE', 'EDIT', 'ANALYZE', 'IMPROVE'],
      required: true,
    },
    result: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

PromptHistorySchema.index({ userId: 1, createdAt: -1 });

export const PromptHistory: Model<IPromptHistory> =
  mongoose.models.PromptHistory ||
  mongoose.model<IPromptHistory>('PromptHistory', PromptHistorySchema);
