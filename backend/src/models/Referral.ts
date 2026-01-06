import mongoose, { Document, Schema } from 'mongoose';

export interface IReferral extends Document {
  referrerId: mongoose.Types.ObjectId;
  referredUserId: mongoose.Types.ObjectId;
  status: 'pending' | 'converted';
  creditsAwarded: boolean;
  convertedAt: Date | null;
  createdAt: Date;
}

const ReferralSchema = new Schema<IReferral>({
  referrerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  referredUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Each user can only be referred once
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'converted'],
    default: 'pending',
    index: true
  },
  creditsAwarded: {
    type: Boolean,
    default: false
  },
  convertedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Compound index for efficient queries
ReferralSchema.index({ referrerId: 1, status: 1 });

export default mongoose.model<IReferral>('Referral', ReferralSchema);