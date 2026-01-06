import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt';
import User from '../models/User';
import Referral from '../models/Referral';
import { generateReferralCode } from '../utils/generateReferralCode';
import { AuthRequest } from '../middleware/auth';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, referralCode } = req.body;

    // Checks if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate unique referral code
    let userReferralCode = generateReferralCode(name);
    let codeExists = await User.findOne({ referralCode: userReferralCode });
    
    // Regenerate if code already exists
    while (codeExists) {
      userReferralCode = generateReferralCode(name);
      codeExists = await User.findOne({ referralCode: userReferralCode });
    }

    // Find referrer if referral code provided
    let referrerId = null;
    if (referralCode) {
      const referrer = await User.findOne({ 
        referralCode: referralCode.toUpperCase() 
      });
      
      if (referrer) {
        referrerId = referrer._id;
      }
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      referralCode: userReferralCode,
      referredBy: referrerId
    });

    // Create referral record if user was referred
    if (referrerId) {
      await Referral.create({
        referrerId,
        referredUserId: user._id,
        status: 'pending'
      });
    }

    // Generate JWT token
    const token = signToken({
        userId: user._id.toString()
    });


    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          referralCode: user.referralCode,
          totalCredits: user.totalCredits
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Generate JWT token
    const token = signToken({
        userId: user._id.toString()
    });


    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          referralCode: user.referralCode,
          totalCredits: user.totalCredits
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          referralCode: user.referralCode,
          totalCredits: user.totalCredits,
          hasMadePurchase: user.hasMadePurchase,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
};