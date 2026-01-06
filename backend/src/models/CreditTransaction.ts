import mongoose, { Document, Schema } from 'mongoose';

export type CreditTransactionType = 'referral_reward' | 'purchase_reward' | 'deduction' | 'bonus';

export interface ICreditTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: CreditTransactionType;
  description: string;
  relatedPurchaseId: mongoose.Types.ObjectId | null;
  relatedReferralId: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const CreditTransactionSchema = new Schema<ICreditTransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['referral_reward', 'purchase_reward', 'deduction', 'bonus'],
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  relatedPurchaseId: {
    type: Schema.Types.ObjectId,
    ref: 'Purchase',
    default: null
  },
  relatedReferralId: {
    type: Schema.Types.ObjectId,
    ref: 'Referral',
    default: null
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Compound index for efficient queries
CreditTransactionSchema.index({ userId: 1, createdAt: -1 });
CreditTransactionSchema.index({ userId: 1, type: 1 });

export default mongoose.model<ICreditTransaction>('CreditTransaction', CreditTransactionSchema);