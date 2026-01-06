import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Purchase from '../models/Purchase';
import User from '../models/User';
import { CreditManager } from '../utils/creditManager';

/**
 * Create a new purchase (simulation)
 * POST /api/purchases
 */
export const createPurchase = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { productName, amount } = req.body;
    const userId = req.userId!;

    // Check if user has already made a purchase
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const isFirstPurchase = !user.hasMadePurchase;

    // Create purchase record
    const purchase = await Purchase.create({
      userId,
      productName,
      amount,
      isFirstPurchase
    });

    // Process referral credits if this is first purchase
    if (isFirstPurchase) {
      const creditResult = await CreditManager.processReferralCredits(
        purchase._id,
        user._id
      );

      res.status(201).json({
        success: true,
        message: 'Purchase completed successfully',
        data: {
          purchase: {
            id: purchase._id,
            productName: purchase.productName,
            amount: purchase.amount,
            isFirstPurchase: purchase.isFirstPurchase,
            createdAt: purchase.createdAt
          },
          creditInfo: creditResult
        }
      });
    } else {
      res.status(201).json({
        success: true,
        message: 'Purchase completed successfully',
        data: {
          purchase: {
            id: purchase._id,
            productName: purchase.productName,
            amount: purchase.amount,
            isFirstPurchase: purchase.isFirstPurchase,
            createdAt: purchase.createdAt
          },
          creditInfo: {
            success: true,
            message: 'Not first purchase, no credits awarded'
          }
        }
      });
    }
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Purchase failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get user's purchase history
 * GET /api/purchases
 */
export const getPurchases = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    const purchases = await Purchase.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: {
        purchases
      }
    });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchases'
    });
  }
};