'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { useRequireAuth } from '@/lib/auth';
import { dashboardApi, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ReferralLink } from '@/components/dashboard/ReferralLink';
import { ReferralsList } from '@/components/dashboard/ReferralsList';
import { TransactionHistory } from '@/components/dashboard/TransactionHistory';
import { PurchaseModal } from '@/components/purchase/PurchaseModal';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useRequireAuth();
  const { user, logout } = useAuthStore();
  const {
    dashboardData,
    isLoading,
    setDashboardData,
    setLoading,
    setError,
    clearDashboard
  } = useDashboardStore();

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getStats();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    clearDashboard();
    router.push('/login');
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your referrals and track your earnings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="primary"
                onClick={() => setIsPurchaseModalOpen(true)}
              >
                Make Purchase
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Credits"
            value={dashboardData.stats.totalCreditsEarned}
            icon={
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            iconColor="bg-blue-500"
            delay={0}
          />

          <StatsCard
            title="Referred Users"
            value={dashboardData.stats.totalReferredUsers}
            icon={
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
            iconColor="bg-green-500"
            delay={0.1}
          />

          <StatsCard
            title="Converted Users"
            value={dashboardData.stats.convertedUsers}
            icon={
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
            iconColor="bg-purple-500"
            delay={0.2}
          />

          <StatsCard
            title="Conversion Rate"
            value={`${dashboardData.stats.conversionRate}%`}
            icon={
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            }
            iconColor="bg-orange-500"
            delay={0.3}
          />
        </div>

        {/* Referral Link */}
        <div className="mb-8">
          <ReferralLink referralCode={dashboardData.user.referralCode} />
        </div>

        {/* Referrals List and Transactions */}
        <div className="grid lg:grid-cols-2 gap-8">
          <ReferralsList referrals={dashboardData.referredUsers} />
          <TransactionHistory transactions={dashboardData.recentTransactions} />
        </div>
      </main>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}