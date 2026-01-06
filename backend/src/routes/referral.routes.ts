import express from 'express';
import { param } from 'express-validator';
import { 
  getReferralDetails, 
  validateReferralCode,
  getReferralStats
} from '../controllers/referral.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

/**
 * @route   GET /api/referrals/validate/:code
 * @desc    Validate if a referral code exists and is valid
 * @access  Public
 */
router.get(
  '/validate/:code',
  validateRequest([
    param('code')
      .trim()
      .notEmpty()
      .withMessage('Referral code is required')
      .isLength({ min: 3, max: 20 })
      .withMessage('Referral code must be between 3 and 20 characters')
      .toUpperCase()
  ]),
  validateReferralCode
);

/**
 * @route   GET /api/referrals/details/:code
 * @desc    Get details about a referral code (referrer info)
 * @access  Public
 */
router.get(
  '/details/:code',
  validateRequest([
    param('code')
      .trim()
      .notEmpty()
      .withMessage('Referral code is required')
      .toUpperCase()
  ]),
  getReferralDetails
);

/**
 * @route   GET /api/referrals/stats
 * @desc    Get current user's referral statistics
 * @access  Private
 */
router.get('/stats', authenticate, getReferralStats);

export default router;