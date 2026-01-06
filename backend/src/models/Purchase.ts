import mongoose, { Document, Schema } from 'mongoose';

export interface IPurchase extends Document {
  userId: mongoose.Types.ObjectId;
  productName: string;
  amount: number;
  isFirstPurchase: boolean;
  referralCreditProcessed: boolean;
  createdAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  isFirstPurchase: {
    type: Boolean,
    required: true
  },
  referralCreditProcessed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Index for efficient queries
PurchaseSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IPurchase>('Purchase', PurchaseSchema);