// src/services/authService.js
import api from '../utils/api';

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
  }
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
 * Authentication Service
 * Centralized API calls for all auth-related operations
 * ✅ Now uses the centralized api instance from utils/api.js
 */
const authService = {
  /**
   * Admin Login
   * @param {string} email - Admin email
   * @param {string} password - Admin password
   * @returns {Promise} Response with user data and token (in httpOnly cookie)
   */
  adminLogin: async (email, password) => {
    const response = await api.post('/api/admin-login', { email, password });
    return response.data;
  },

  /**
   * User Signup
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Response indicating OTP sent
   */
  signup: async (email, password) => {
    const response = await api.post('/api/signup', { email, password });
    return response.data;
  },

  /**
   * Forgot Password - Send OTP
   * @param {string} email - User email
   * @returns {Promise} Response indicating OTP sent
   */
  forgotPassword: async (email) => {
    const response = await api.post('/api/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset Password
   * @param {string} email - User email
   * @param {string} password - New password
   * @returns {Promise} Response indicating password reset success
   */
  resetPassword: async (email, password) => {
    const response = await api.post('/api/reset-password', { email, password });
    return response.data;
  },

  /**
   * Verify Signup OTP
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @returns {Promise} Response indicating verification success
   */
  verifySignupOTP: async (email, otp) => {
    const response = await api.post('/api/verify-code', { email, otp });
    return response.data;
  },

  /**
   * Verify Reset Password OTP
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @returns {Promise} Response indicating verification success
   */
  verifyResetOTP: async (email, otp) => {
    const response = await api.post('/api/verify-reset-otp', { email, otp });
    return response.data;
  },

  /**
   * Generic Verify OTP (legacy - use specific methods above)
   * @param {string} email - User email
   * @param {string} otp - OTP code
   * @param {string} type - Verification type ('signup' or 'reset')
   * @returns {Promise} Response indicating verification success
   * @deprecated Use verifySignupOTP or verifyResetOTP instead
   */
  verifyOTP: async (email, otp, type = 'signup') => {
    const endpoint = type === 'reset' ? '/api/verify-reset-otp' : '/api/verify-code';
    const response = await api.post(endpoint, { email, otp });
    return response.data;
  },

  /**
   * User Login (regular user, not admin)
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Response with user data and token
   */
  login: async (email, password) => {
    const response = await api.post('/api/login', { email, password });
    return response.data;
  },

  /**
   * Logout
   * @returns {Promise} Response indicating logout success
   */
  logout: async () => {
    const response = await api.post('/api/logout', {});
    storage.clearAll(); // Clear local storage on logout
    return response.data;
  },

  /**
   * Refresh Token
   * @returns {Promise} Response with new token
   */
  refreshToken: async () => {
    const response = await api.post('/api/refresh-token', {});
    return response.data;
  },

  /**
   * Get Admin Profile
   * @returns {Promise} Response with admin profile data
   */
  getAdminProfile: async () => {
    // console.log("👨‍💼 Fetching admin profile...");
    // console.log("🍪 Cookies available:", document.cookie);
    
    try {
      const response = await api.get('/api/admin/profile');
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
    // console.log("💾 Updating admin profile...");
    const response = await api.put('/api/admin/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Delete Admin Photo
   * @returns {Promise} Response indicating photo deletion
   */
  deleteAdminPhoto: async () => {
    // console.log("🗑️ Deleting admin photo...");
    const response = await api.delete('/api/admin/profile/photo');
    return response.data;
  },

  /**
   * Get Current User
   * @returns {Promise} Response with current user data
   */
  getCurrentUser: async () => {
    // console.log("👤 Fetching current user profile...");
    const response = await api.get('/api/me');
    return response.data;
  },

  /**
   * Resend OTP
   * @param {string} email - User email
   * @param {string} type - OTP type ('signup' or 'reset')
   * @returns {Promise} Response indicating OTP resent
   */
  resendOTP: async (email, type = 'signup') => {
    const response = await api.post('/api/resend-otp', { email, type });
    return response.data;
  }
};

export default authService;