import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Referral from '../models/Referral';
import CreditTransaction from '../models/CreditTransaction';

/**
 * Get dashboard statistics for current user
 * GET /api/dashboard/stats
 */
export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Get referral statistics
    const totalReferrals = await Referral.countDocuments({ 
      referrerId: userId 
    });

    const convertedReferrals = await Referral.countDocuments({
      referrerId: userId,
      status: 'converted'
    });

    // Get referred users details
    const referredUsers = await Referral.find({ referrerId: userId })
      .populate('referredUserId', 'name email createdAt')
      .sort({ createdAt: -1 })
      .limit(20);

    // Get recent credit transactions
    const recentTransactions = await CreditTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          referralCode: user.referralCode,
          totalCredits: user.totalCredits
        },
        stats: {
          totalReferredUsers: totalReferrals,
          convertedUsers: convertedReferrals,
          totalCreditsEarned: user.totalCredits,
          conversionRate: totalReferrals > 0 
            ? ((convertedReferrals / totalReferrals) * 100).toFixed(1)
            : '0.0'
        },
        referredUsers: referredUsers.map(ref => ({
          id: ref._id,
          user: ref.referredUserId,
          status: ref.status,
          creditsAwarded: ref.creditsAwarded,
          createdAt: ref.createdAt,
          convertedAt: ref.convertedAt
        })),
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};