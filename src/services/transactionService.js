// src/services/transactionService.js
import api from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Transaction/Order Service
 * Centralized API calls for all transaction/order-related operations
 */
const transactionService = {
  /**
   * Get all transactions
   * @returns {Promise} Response with array of transactions
   */
  getAllTransactions: async () => {

    const response = await api.get(API_ENDPOINTS.TRANSACTIONS);
    return response.data;
  },

  /**
   * Get transaction by ID
   * @param {string} transactionId - Transaction ID (customTransactionId)
   * @returns {Promise} Response with transaction details
   */
  getTransactionById: async (transactionId) => {
    const response = await api.get(`${API_ENDPOINTS.TRANSACTIONS}/${transactionId}`);
    return response.data;
  },

  /**
   * Create new transaction
   * @param {Object} transactionData - Transaction data
   * @returns {Promise} Response with created transaction
   */
  createTransaction: async (transactionData) => {
    const response = await api.post(API_ENDPOINTS.TRANSACTIONS, transactionData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  /**
   * Update transaction
   * @param {string} transactionId - Transaction ID
   * @param {Object} transactionData - Updated transaction data
   * @returns {Promise} Response with updated transaction
   */
  updateTransaction: async (transactionId, transactionData) => {
    const response = await api.put(
      `${API_ENDPOINTS.TRANSACTIONS}/${transactionId}`,
      transactionData
    );
    return response.data;
  },

  /**
   * Delete transaction
   * @param {string} transactionId - Transaction ID (customTransactionId)
   * @returns {Promise} Response indicating deletion success
   */
  deleteTransaction: async (transactionId) => {
    const response = await api.delete(`${API_ENDPOINTS.TRANSACTIONS}/${transactionId}`);
    return response.data;
  },

  /**
   * Get transactions by customer phone
   * @param {string} customerPhone - Customer phone number
   * @returns {Promise} Response with array of transactions
   */
  getTransactionsByCustomer: async (customerPhone) => {
    const response = await api.get(`${API_ENDPOINTS.TRANSACTIONS}/customer/${customerPhone}`);
    return response.data;
  },

  /**
   * Get transactions by property
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response with array of transactions
   */
  getTransactionsByProperty: async (propertyId) => {
    const response = await api.get(`${API_ENDPOINTS.TRANSACTIONS}/property/${propertyId}`);
    return response.data;
  },

  /**
   * Get transactions by date range
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @returns {Promise} Response with filtered transactions
   */
  getTransactionsByDateRange: async (startDate, endDate) => {
    const response = await api.get(API_ENDPOINTS.TRANSACTIONS, {
      params: { startDate, endDate }
    });
    return response.data;
  },

  /**
   * Search transactions
   * @param {string} query - Search query
   * @returns {Promise} Response with filtered transactions
   */
  searchTransactions: async (query) => {
    const response = await api.get(`${API_ENDPOINTS.TRANSACTIONS}/search`, {
      params: { q: query }
    });
    return response.data;
  },

  /**
   * Get transaction statistics
   * @returns {Promise} Response with transaction statistics
   */
  getTransactionStats: async () => {
    const response = await api.get(`${API_ENDPOINTS.TRANSACTIONS}/stats`);
    return response.data;
  }
};

export default transactionService;

// Export individual functions for backward compatibility (if needed)
export const {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByCustomer,
  getTransactionsByProperty,
  getTransactionsByDateRange,
  searchTransactions,
  getTransactionStats
} = transactionService;