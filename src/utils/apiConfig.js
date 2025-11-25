// src/utils/apiConfig.js

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  TIMEOUT: 30000, // 30 seconds
  MAX_CONTENT_LENGTH: Infinity,
  MAX_BODY_LENGTH: Infinity,
  AUTO_REFRESH_INTERVAL: 30000, // 30 seconds - auto-refresh interval
};

/**
 * Socket configuration
 */
export const SOCKET_CONFIG = {
  URL: import.meta.env.VITE_SOCKET_URL || API_CONFIG.BASE_URL,
  OPTIONS: { 
    withCredentials: true,
    transports: ['websocket', 'polling']
  }
};

/**
 * API endpoints (relative to BASE_URL)
 */
export const API_ENDPOINTS = {
  // Stats & Analytics
  STATS: '/api/stats',
  
  // Sales
  SALES_MONTHLY: '/api/sales/monthly',
  SALES_WEEKLY: '/api/sales/weekly',
  
  // Payments & Transactions
  TRANSACTIONS: '/api/payment/transactions',
  BUYERS: '/api/payment/buyers',
  CUSTOMER: '/api/payment/customer',
  
  // Property
  PROPERTY: '/api/property',
  
  // Owners
  OWNERS: '/api/owners',
  
  // Auth
  AUTH: '/api',
  ADMIN_PROFILE: '/api/admin/profile',
  
  // Dashboard
  DASHBOARD_STATS: '/api/dashboard/stats',
};

/**
 * Socket.io Events
 */
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  
  // Data update events
  UPDATE_ANALYTICS: 'update-analytics',
  TRANSACTION_UPDATED: 'transaction-updated',
  OWNER_STATS_UPDATED: 'owner-stats-updated',
  CUSTOMER_UPDATED: 'customer-updated',
  PROPERTY_UPDATED: 'property-updated',
  NOTIFICATION: 'notification',
};

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

/**
 * API Response Messages
 */
export const API_MESSAGES = {
  // Success
  SUCCESS: 'Operation completed successfully',
  DATA_FETCHED: 'Data fetched successfully',
  DATA_SAVED: 'Data saved successfully',
  DATA_UPDATED: 'Data updated successfully',
  DATA_DELETED: 'Data deleted successfully',
  
  // Errors
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Validation error. Please check your input.',
};

/**
 * Request Configuration Defaults
 */
export const REQUEST_CONFIG = {
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  WITH_CREDENTIALS: true,
  TIMEOUT: API_CONFIG.TIMEOUT,
};

/**
 * Helper function to build full API URL
 */
export const buildApiUrl = (endpoint) => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

/**
 * Helper function to check if response is successful
 */
export const isSuccessResponse = (status) => {
  return status >= 200 && status < 300;
};

/**
 * Helper function to get error message from response
 */
export const getErrorMessage = (error) => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.message || error.response.data?.error || API_MESSAGES.SERVER_ERROR;
  } else if (error.request) {
    // Request made but no response
    return API_MESSAGES.NETWORK_ERROR;
  } else if (error.code === 'ECONNABORTED') {
    // Request timeout
    return API_MESSAGES.TIMEOUT_ERROR;
  }
  // Something else happened
  return error.message || API_MESSAGES.SERVER_ERROR;
};

export default {
  API_CONFIG,
  SOCKET_CONFIG,
  API_ENDPOINTS,
  SOCKET_EVENTS,
  HTTP_STATUS,
  API_MESSAGES,
  REQUEST_CONFIG,
  buildApiUrl,
  isSuccessResponse,
  getErrorMessage,
};