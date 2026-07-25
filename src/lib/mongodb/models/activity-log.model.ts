import mongoose, { Schema, Document, Model } from 'mongoose';

export type ActivityAction =
  | 'form.created'
  | 'form.updated'
  | 'form.published'
  | 'form.deleted'
  | 'form.archived'
  | 'response.received'
  | 'response.starred'
  | 'response.status_changed'
  | 'version.saved'
  | 'version.restored';

export interface IActivityLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  action: ActivityAction;
  entity: string;
  entityId?: mongoose.Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

ActivityLogSchema.index({ userId: 1, createdAt: -1 });

export const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ||
  mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
