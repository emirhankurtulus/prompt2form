import mongoose, { Schema, Document, Model } from 'mongoose';

export type EmailTokenType = 'VERIFY_EMAIL' | 'RESET_PASSWORD';

export interface IEmailToken extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  token: string; // SHA-256 hashed — raw token travels in the email link
  type: EmailTokenType;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTokenSchema = new Schema<IEmailToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['VERIFY_EMAIL', 'RESET_PASSWORD'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// TTL index — MongoDB auto-deletes expired tokens (runs every 60 seconds)
EmailTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
EmailTokenSchema.index({ userId: 1 });

export const EmailToken: Model<IEmailToken> =
  mongoose.models.EmailToken ||
  mongoose.model<IEmailToken>('EmailToken', EmailTokenSchema);
