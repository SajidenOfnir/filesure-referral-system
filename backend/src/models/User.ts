import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  referralCode: string;
  referredBy: mongoose.Types.ObjectId | null;
  totalCredits: number;
  hasMadePurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  referralCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  referredBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  totalCredits: {
    type: Number,
    default: 0,
    min: 0
  },
  hasMadePurchase: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
UserSchema.index({ email: 1 });
UserSchema.index({ referralCode: 1 });

export default mongoose.model<IUser>('User', UserSchema);