import mongoose from 'mongoose';
import User from '../models/User';
import Referral from '../models/Referral';
import Purchase from '../models/Purchase';
import CreditTransaction from '../models/CreditTransaction';

/**
 * Manages credit distribution for referral rewards
 * Uses MongoDB transactions to ensure atomicity and prevent double-crediting
 */
export class CreditManager {
  private static REFERRAL_CREDIT = 2;
  private static PURCHASE_CREDIT = 2;

  /**
   * Process referral credits when a referred user makes their first purchase
   * Awards credits to both referrer and referred user
   * 
   * @param purchaseId - ID of the purchase triggering the reward
   * @param userId - ID of the user making the purchase
   * @returns Success status and message
   */
  static async processReferralCredits(
    purchaseId: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId
  ): Promise<{ success: boolean; message: string }> {
    const session = await mongoose.startSession();
    
    try {
      await session.startTransaction();

      // 1. Find the purchase and verify it hasn't been processed
      const purchase = await Purchase.findById(purchaseId).session(session);
      
      if (!purchase) {
        throw new Error('Purchase not found');
      }

      if (purchase.referralCreditProcessed) {
        await session.abortTransaction();
        return { 
          success: false, 
          message: 'Credits already processed for this purchase' 
        };
      }

      // 2. Check if this is the user's first purchase
      if (!purchase.isFirstPurchase) {
        // Mark as processed but don't award credits
        purchase.referralCreditProcessed = true;
        await purchase.save({ session });
        await session.commitTransaction();
        
        return { 
          success: true, 
          message: 'Not first purchase, no credits awarded' 
        };
      }

      // 3. Find referral record
      const referral = await Referral.findOne({ 
        referredUserId: userId 
      }).session(session);

      if (!referral) {
        // No referral exists, just mark purchase as processed
        purchase.referralCreditProcessed = true;
        await purchase.save({ session });
        
        // Update user's purchase status
        await User.findByIdAndUpdate(
          userId,
          { hasMadePurchase: true },
          { session }
        );
        
        await session.commitTransaction();
        
        return { 
          success: true, 
          message: 'First purchase but no referral' 
        };
      }

      // 4. Check if credits already awarded for this referral
      if (referral.creditsAwarded) {
        await session.abortTransaction();
        return { 
          success: false, 
          message: 'Credits already awarded for this referral' 
        };
      }

      // 5. Award credits to referrer (the person who referred)
      const referrer = await User.findById(referral.referrerId).session(session);
      if (referrer) {
        referrer.totalCredits += this.REFERRAL_CREDIT;
        await referrer.save({ session });

        // Create credit transaction for referrer
        await CreditTransaction.create([{
          userId: referrer._id,
          amount: this.REFERRAL_CREDIT,
          type: 'referral_reward',
          description: `Earned ${this.REFERRAL_CREDIT} credits for successful referral`,
          relatedPurchaseId: purchaseId,
          relatedReferralId: referral._id
        }], { session });
      }

      // 6. Award credits to referred user (the person who was referred)
      const referredUser = await User.findById(userId).session(session);
      if (referredUser) {
        referredUser.totalCredits += this.PURCHASE_CREDIT;
        referredUser.hasMadePurchase = true;
        await referredUser.save({ session });

        // Create credit transaction for referred user
        await CreditTransaction.create([{
          userId: referredUser._id,
          amount: this.PURCHASE_CREDIT,
          type: 'purchase_reward',
          description: `Earned ${this.PURCHASE_CREDIT} credits for first purchase`,
          relatedPurchaseId: purchaseId,
          relatedReferralId: referral._id
        }], { session });
      }

      // 7. Update referral status
      referral.status = 'converted';
      referral.creditsAwarded = true;
      referral.convertedAt = new Date();
      await referral.save({ session });

      // 8. Mark purchase as processed
      purchase.referralCreditProcessed = true;
      await purchase.save({ session });

      // Commit transaction
      await session.commitTransaction();

      return { 
        success: true, 
        message: `Credits awarded: ${this.REFERRAL_CREDIT} to referrer, ${this.PURCHASE_CREDIT} to buyer` 
      };

    } catch (error) {
      await session.abortTransaction();
      console.error('Error processing referral credits:', error);
      
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to process credits' 
      };
    } finally {
      session.endSession();
    }
  }

  /**
   * Get credit statistics for a user
   */
  static async getUserCreditStats(userId: mongoose.Types.ObjectId) {
    const transactions = await CreditTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const totalEarned = await CreditTransaction.aggregate([
      { $match: { userId, amount: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return {
      recentTransactions: transactions,
      totalEarned: totalEarned[0]?.total || 0
    };
  }
}