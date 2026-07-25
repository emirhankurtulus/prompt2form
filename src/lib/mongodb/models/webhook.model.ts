import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWebhook extends Document {
  _id: mongoose.Types.ObjectId;
  formId: mongoose.Types.ObjectId;
  url: string;
  secret: string; // bcrypt hashed
  events: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookSchema = new Schema<IWebhook>(
  {
    formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
    url: { type: String, required: true },
    secret: { type: String, required: true },
    events: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

WebhookSchema.index({ formId: 1 });

export const Webhook: Model<IWebhook> =
  mongoose.models.Webhook || mongoose.model<IWebhook>('Webhook', WebhookSchema);
