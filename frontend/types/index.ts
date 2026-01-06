// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  totalCredits: number;
  hasMadePurchase?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// ============================================================================
// REFERRAL TYPES
// ============================================================================

export interface ReferredUser {
  id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  status: 'pending' | 'converted';
  creditsAwarded: boolean;
  createdAt: string;
  convertedAt: string | null;
}

// ============================================================================
// PURCHASE TYPES
// ============================================================================

export interface Purchase {
  id: string;
  productName: string;
  amount: number;
  isFirstPurchase: boolean;
  referralCreditProcessed: boolean;
  createdAt: string;
}

export interface CreatePurchaseRequest {
  productName: string;
  amount: number;
}

export interface PurchaseResponse {
  success: boolean;
  message: string;
  data: {
    purchase: Purchase;
    creditInfo: {
      success: boolean;
      message: string;
    };
  };
}

// ============================================================================
// CREDIT TRANSACTION TYPES
// ============================================================================

export type CreditTransactionType = 
  | 'referral_reward' 
  | 'purchase_reward' 
  | 'deduction' 
  | 'bonus';

export interface CreditTransaction {
  _id: string;
  userId: string;
  amount: number;
  type: CreditTransactionType;
  description: string;
  relatedPurchaseId: string | null;
  relatedReferralId: string | null;
  createdAt: string;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardStats {
  totalReferredUsers: number;
  convertedUsers: number;
  totalCreditsEarned: number;
  conversionRate: string;
}

export interface DashboardData {
  user: User;
  stats: DashboardStats;
  referredUsers: ReferredUser[];
  recentTransactions: CreditTransaction[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ApiSuccess<T = any> {
  success: true;
  message?: string;
  data: T;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

// ============================================================================
// FORM TYPES
// ============================================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  referralCode?: string;
}

// ============================================================================
// STORE TYPES (for Zustand)
// ============================================================================

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface DashboardState {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setDashboardData: (data: DashboardData) => void;
  updateStats: (stats: Partial<DashboardStats>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearDashboard: () => void;
}