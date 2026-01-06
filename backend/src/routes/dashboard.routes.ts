import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Get dashboard statistics for current user
 * @access  Private
 */
router.get('/stats', authenticate, getDashboardStats);

export default router;