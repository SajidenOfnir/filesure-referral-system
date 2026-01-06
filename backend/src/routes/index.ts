import express from 'express';
import authRoutes from './auth.routes';
import purchaseRoutes from './purchase.routes';
import dashboardRoutes from './dashboard.routes';
import referralRoutes from './referral.routes';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/referrals', referralRoutes);

export default router;