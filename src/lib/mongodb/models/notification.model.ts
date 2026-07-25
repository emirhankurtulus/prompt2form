import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType = 'RESPONSE' | 'TEAM' | 'SYSTEM' | 'AI_INSIGHT';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ['RESPONSE', 'TEAM', 'SYSTEM', 'AI_INSIGHT'],
      required: true,
    },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true },
);

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
