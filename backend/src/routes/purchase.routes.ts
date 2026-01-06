import express from 'express';
import { body } from 'express-validator';
import { createPurchase, getPurchases } from '../controllers/purchase.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

/**
 * @route   POST /api/purchases
 * @desc    Create a new purchase
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  validateRequest([
    body('productName')
      .trim()
      .notEmpty()
      .withMessage('Product name is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Product name must be between 3 and 100 characters'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number')
  ]),
  createPurchase
);

/**
 * @route   GET /api/purchases
 * @desc    Get user's purchase history
 * @access  Private
 */
router.get('/', authenticate, getPurchases);

export default router;