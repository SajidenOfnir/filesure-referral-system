import { Request, Response } from 'express';
import User from '../models/User';
import Referral from '../models/Referral';
import { AuthRequest } from '../middleware/auth';

/**
 * Validate if a referral code exists
 * GET /api/referrals/validate/:code
 */
export const validateReferralCode = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.params;

    // Find user with this referral code
    const referrer = await User.findOne({ 
      referralCode: code.toUpperCase() 
    }).select('name referralCode');

    if (!referrer) {
      res.status(404).json({
        success: false,
        message: 'Invalid referral code',
        data: {
          valid: false
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Valid referral code',
      data: {
        valid: true,
        referrerName: referrer.name,
        referralCode: referrer.referralCode
      }
    });
  } catch (error) {
    console.error('Validate referral code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate referral code',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get referral code details
 * GET /api/referrals/details/:code
 */
export const getReferralDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { code } = req.params;

    // Find referrer
    const referrer = await User.findOne({ 
      referralCode: code.toUpperCase() 
    }).select('name email referralCode totalCredits createdAt');

    if (!referrer) {
      res.status(404).json({
        success: false,
        message: 'Referral code not found'
      });
      return;
    }

    // Get referrer's stats
    const totalReferrals = await Referral.countDocuments({
      referrerId: referrer._id
    });

    const convertedReferrals = await Referral.countDocuments({
      referrerId: referrer._id,
      status: 'converted'
    });

    res.status(200).json({
      success: true,
      data: {
        referrer: {
          name: referrer.name,
          referralCode: referrer.referralCode,
          memberSince: referrer.createdAt
        },
        stats: {
          totalReferrals,
          convertedReferrals,
          successRate: totalReferrals > 0 
            ? ((convertedReferrals / totalReferrals) * 100).toFixed(1)
            : '0.0'
        }
      }
    });
  } catch (error) {
    console.error('Get referral details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get current user's referral statistics
 * GET /api/referrals/stats
 */
export const getReferralStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    // Get user info
    const user = await User.findById(userId).select('name referralCode totalCredits');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Get referral counts
    const totalReferrals = await Referral.countDocuments({
      referrerId: userId
    });

    const pendingReferrals = await Referral.countDocuments({
      referrerId: userId,
      status: 'pending'
    });

    const convertedReferrals = await Referral.countDocuments({
      referrerId: userId,
      status: 'converted'
    });

    // Get recent referrals with user details
    const recentReferrals = await Referral.find({ referrerId: userId })
      .populate('referredUserId', 'name email createdAt hasMadePurchase')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate total credits earned from referrals
    const referralCredits = convertedReferrals * 2; // 2 credits per conversion

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          referralCode: user.referralCode,
          totalCredits: user.totalCredits
        },
        stats: {
          totalReferrals,
          pendingReferrals,
          convertedReferrals,
          conversionRate: totalReferrals > 0 
            ? ((convertedReferrals / totalReferrals) * 100).toFixed(1)
            : '0.0',
          creditsFromReferrals: referralCredits
        },
        recentReferrals: recentReferrals.map(ref => ({
          id: ref._id,
          referredUser: ref.referredUserId,
          status: ref.status,
          creditsAwarded: ref.creditsAwarded,
          createdAt: ref.createdAt,
          convertedAt: ref.convertedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get referral stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};