// src/services/authService.js
import axios from 'axios';
import { API_CONFIG } from '../utils/constants';

// ✅ FIX: API_CONFIG is an object, use BASE_URL
const API_BASE_URL = `${API_CONFIG.BASE_URL}/api`;

/**
 * Configure axios defaults for authentication
 */
axios.defaults.withCredentials = true; // ✅ Enable cookies globally
axios.defaults.timeout = API_CONFIG.TIMEOUT;

// ✅ CRITICAL: Ensure we're using the same domain as the cookie
console.log("🌐 API Base URL:", API_BASE_URL);
console.log("🌐 Current origin:", window.location.origin);

// ✅ CRITICAL: Add axios interceptor to ensure credentials are always sent
axios.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    console.log("📤 API Request:", config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ FIXED: Response interceptor - DON'T auto-logout on 401
// Let individual components handle authentication errors
axios.interceptors.response.use(
  (response) => {
    console.log("📥 API Response:", response.status, response.config.url);
    return response;
  },
  (error) => {
    // Log the error but DON'T auto-logout
    if (error.response?.status === 401) {
      console.error("⚠️ 401 Unauthorized on:", error.config?.url);
      console.error("⚠️ Let the component handle this error");
    }
    // Just pass the error along - let components decide what to do
    return Promise.reject(error);
  }
);

/**
 * Authentication Service
 * Centralized API calls for all auth-related operations
 */

const authService = {
  /**
   * Admin Login
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Promise} Response with user data and token (in httpOnly cookie)
   */
  adminLogin: async (email, password) => {
    console.log("🔐 Attempting admin login...");
    const response = await axios.post(
      `${API_BASE_URL}/admin-login`,
      { email, password },
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("✅ Admin login successful, cookies:", document.cookie);
    return response.data;
  },

  /**
   * User Signup
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Response indicating OTP sent
   */
  signup: async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/signup`, {
      email,
      password
    });
    return response.data;
  },

  /**
   * Forgot Password - Send OTP
   * @param {string} email - User email
   * @returns {Promise} Response indicating OTP sent
   */
  forgotPassword: async (email) => {
    const response = await axios.post(`${API_BASE_URL}/forgot-password`, {
      email
    });
    return response.data;
  },

  /**
   * Reset Password
   * @param {string} email - User email
   * @param {string} password - New password
   * @returns {Promise} Response indicating password reset success
   */
  resetPassword: async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/reset-password`, {
      email,
      password
    });
    return response.data;
  },

  /**
   * Verify OTP
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @param {string} type - Verification type ('signup' or 'reset')
   * @returns {Promise} Response indicating verification success
   */
  verifyOTP: async (email, otp, type = 'signup') => {
    const response = await axios.post(`${API_BASE_URL}/verify-otp`, {
      email,
      otp,
      type
    });
    return response.data;
  },

  /**
   * User Login (regular user, not admin)
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Response with user data and token
   */
  login: async (email, password) => {
    const response = await axios.post(
      `${API_BASE_URL}/login`,
      { email, password },
      { withCredentials: true }
    );
    return response.data;
  },

  /**
   * Logout
   * @returns {Promise} Response indicating logout success
   */
  logout: async () => {
    const response = await axios.post(
      `${API_BASE_URL}/logout`,
      {},
      { withCredentials: true }
    );
    storage.clearAll(); // Clear local storage on logout
    return response.data;
  },

  /**
   * Refresh Token
   * @returns {Promise} Response with new token
   */
  refreshToken: async () => {
    const response = await axios.post(
      `${API_BASE_URL}/refresh-token`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  /**
   * Get Admin Profile
   * @returns {Promise} Response with admin profile data
   */
  getAdminProfile: async () => {
    console.log("👨‍💼 Fetching admin profile...");
    console.log("🍪 Cookies available:", document.cookie);
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/profile`,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching admin profile:", error.response?.status, error.response?.data);
      throw error; // Re-throw so component can handle it
    }
  },

  /**
   * Update Admin Profile
   * @param {FormData} formData - Form data with profile info
   * @returns {Promise} Response with updated profile
   */
  updateAdminProfile: async (formData) => {
    console.log("💾 Updating admin profile...");
    const response = await axios.put(
      `${API_BASE_URL}/admin/profile`,
      formData,
      { 
        withCredentials: true
        // Don't set Content-Type - browser sets it with boundary for FormData
      }
    );
    return response.data;
  },

  /**
   * Delete Admin Photo
   * @returns {Promise} Response indicating photo deletion
   */
  deleteAdminPhoto: async () => {
    console.log("🗑️ Deleting admin photo...");
    const response = await axios.delete(
      `${API_BASE_URL}/admin/profile/photo`,
      { 
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  /**
   * Get Current User
   * @returns {Promise} Response with current user data
   */
  getCurrentUser: async () => {
    console.log("👤 Fetching current user profile...");
    const response = await axios.get(
      `${API_BASE_URL}/me`,
      { withCredentials: true }
    );
    return response.data;
  },

  /**
   * Resend OTP
   * @param {string} email - User email
   * @param {string} type - OTP type ('signup' or 'reset')
   * @returns {Promise} Response indicating OTP resent
   */
  resendOTP: async (email, type = 'signup') => {
    const response = await axios.post(`${API_BASE_URL}/resend-otp`, {
      email,
      type
    });
    return response.data;
  }
};

/**
 * Error Handler Utility
 * Standardizes error handling across auth operations
 * @param {Error} error - Axios error object
 * @returns {string} User-friendly error message
 */
export const handleAuthError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message === "Network Error") {
    return "Cannot connect to server. Please check your connection.";
  }
  
  if (error.response?.status === 401) {
    return "Invalid credentials. Please try again.";
  }
  
  if (error.response?.status === 403) {
    return "Access denied. You don't have permission.";
  }
  
  if (error.response?.status === 429) {
    return "Too many requests. Please try again later.";
  }
  
  return "An unexpected error occurred. Please try again.";
};

/**
 * Password Validation Utility
 * @param {string} password - Password to validate
 * @returns {object} { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long."
    };
  }
  
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
  if (!regex.test(password)) {
    return {
      isValid: false,
      message: "Password must include a letter, number, and special character."
    };
  }
  
  return { isValid: true, message: "" };
};

/**
 * Email Validation Utility
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Local Storage Utilities for User Data (Non-sensitive only)
 * ⚠️ NEVER store tokens in localStorage - they're in httpOnly cookies
 */
export const storage = {
  saveUser: (userData) => {
    // Only save non-sensitive display data
    const safeData = {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isAuthenticated: userData.isAuthenticated || true
    };
    localStorage.setItem('user', JSON.stringify(safeData));
    console.log("💾 User saved to localStorage:", safeData);
  },
  
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  removeUser: () => {
    localStorage.removeItem('user');
  },
  
  saveRememberMe: (email) => {
    localStorage.setItem('rememberMe', 'true');
    localStorage.setItem('adminEmail', email);
  },
  
  clearRememberMe: () => {
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('adminEmail');
  },
  
  getRememberedEmail: () => {
    const remembered = localStorage.getItem('rememberMe');
    const email = localStorage.getItem('adminEmail');
    return remembered === 'true' ? email : null;
  },
  
  saveResetEmail: (email) => {
    localStorage.setItem('resetEmail', email);
  },
  
  getResetEmail: () => {
    return localStorage.getItem('resetEmail');
  },
  
  clearResetEmail: () => {
    localStorage.removeItem('resetEmail');
  },
  
  // Clear all auth-related data
  clearAll: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('resetEmail');
    localStorage.removeItem('adminProfile');
    console.log("🗑️ All storage cleared");
  }
};

export default authService;