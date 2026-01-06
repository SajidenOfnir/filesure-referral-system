import { create } from 'zustand';
import { DashboardState, DashboardData, DashboardStats } from '@/types';

/**
 * Dashboard store using Zustand
 * Manages dashboard data and statistics
 */
export const useDashboardStore = create<DashboardState>((set) => ({
  // Initial state
  dashboardData: null,
  isLoading: false,
  error: null,

  // Set complete dashboard data
  setDashboardData: (data: DashboardData) => {
    set({
      dashboardData: data,
      error: null
    });
  },

  // Update specific stats
  updateStats: (stats: Partial<DashboardStats>) => {
    set((state) => ({
      dashboardData: state.dashboardData
        ? {
            ...state.dashboardData,
            stats: {
              ...state.dashboardData.stats,
              ...stats
            }
          }
        : null
    }));
  },

  // Set loading state
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  // Set error message
  setError: (error: string | null) => {
    set({ error });
  },

  // Clear dashboard data (on logout)
  clearDashboard: () => {
    set({
      dashboardData: null,
      error: null
    });
  }
}));