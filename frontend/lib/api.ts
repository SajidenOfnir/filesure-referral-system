import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  AuthResponse,
  LoginFormData,
  RegisterFormData,
  DashboardResponse,
  PurchaseResponse,
  CreatePurchaseRequest,
  ApiResponse
} from '@/types';

/**
 * API client configuration
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Create axios instance with default config
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 15000
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    (config) => {
      // Get token from localStorage
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const { state } = JSON.parse(authStorage);
          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch (error) {
          console.error('Error parsing auth storage:', error);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiResponse>) => {
      // Handle 401 Unauthorized - clear auth and redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const api = createApiClient();

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      referralCode: data.referralCode || undefined
    });
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<ApiResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

// ============================================================================
// DASHBOARD API
// ============================================================================

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>('/dashboard/stats');
    return response.data;
  }
};

// ============================================================================
// PURCHASE API
// ============================================================================

export const purchaseApi = {
  /**
   * Create a new purchase
   */
  createPurchase: async (data: CreatePurchaseRequest): Promise<PurchaseResponse> => {
    const response = await api.post<PurchaseResponse>('/purchases', data);
    return response.data;
  },

  /**
   * Get user's purchase history
   */
  getPurchases: async (): Promise<ApiResponse> => {
    const response = await api.get('/purchases');
    return response.data;
  }
};

// ============================================================================
// ERROR HANDLER
// ============================================================================

/**
 * Extract error message from API error
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiResponse;
    
    if (!apiError?.success) {
      // Check for validation errors
      if (apiError.errors && apiError.errors.length > 0) {
        return apiError.errors.map(e => e.message).join(', ');
      }
      
      // Return general error message
      return apiError.message || 'An error occurred';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const referralApi = {
  /**
   * Validate a referral code
   */
  validateCode: async (code: string) => {
    const response = await api.get(`/referrals/validate/${code}`);
    return response.data;
  },

  /**
   * Get referral code details
   */
  getDetails: async (code: string) => {
    const response = await api.get(`/referrals/details/${code}`);
    return response.data;
  },

  /**
   * Get current user's referral stats
   */
  getStats: async () => {
    const response = await api.get('/referrals/stats');
    return response.data;
  }
};

export default api;