import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIntegrationConfig extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  // Email Integration
  emailEnabled: boolean;
  notificationEmails: string[];
  // Webhook Integration
  webhookEnabled: boolean;
  webhookUrl?: string;
  // Google Sheets Integration
  googleSheetsEnabled: boolean;
  googleSheetsWebhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationConfigSchema = new Schema<IIntegrationConfig>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    emailEnabled: { type: Boolean, default: true },
    notificationEmails: [{ type: String }],
    webhookEnabled: { type: Boolean, default: false },
    webhookUrl: { type: String, default: '' },
    googleSheetsEnabled: { type: Boolean, default: false },
    googleSheetsWebhookUrl: { type: String, default: '' },
  },
  { timestamps: true },
);

IntegrationConfigSchema.index({ userId: 1 }, { unique: true });

export const IntegrationConfig: Model<IIntegrationConfig> =
  mongoose.models.IntegrationConfig ||
  mongoose.model<IIntegrationConfig>('IntegrationConfig', IntegrationConfigSchema);
