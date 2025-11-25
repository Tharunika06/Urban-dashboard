// src/services/dashboardService.js
import api from "../utils/authUtil";
import { API_ENDPOINTS } from "../utils/constants";

/**
 * Fetch monthly sales analytics data
 * @returns {Promise<Array>} Monthly sales data
 */
export const fetchMonthlySales = async () => {
  try {
    const response = await api.get("/api/sales/monthly");
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly sales:", error);
    throw error;
  }
};

/**
 * Fetch weekly sales data with optional week offset
 * @param {number} offset - Week offset (0 = current week, -1 = previous week, etc.)
 * @returns {Promise<Array>} Weekly sales data
 */
export const fetchWeeklySales = async (offset = 0) => {
  try {
    const response = await api.get(`/api/sales/weekly?offset=${offset}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching weekly sales:", error);
    throw error;
  }
};

/**
 * Fetch all transactions
 * @returns {Promise<Array>} Transactions data
 */
export const fetchTransactions = async () => {
  try {
    const response = await api.get("/api/payment/transactions");
    return response.data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};

/**
 * Delete a transaction by ID
 * @param {string} transactionId - Transaction ID to delete
 * @returns {Promise<Object>} Delete response
 */
export const deleteTransaction = async (transactionId) => {
  try {
    const response = await api.delete(`/api/payment/transactions/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};

/**
 * Fetch buyers/social source data
 * @returns {Promise<Object>} Buyers data grouped by month
 */
export const fetchBuyersData = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.BUYERS);
    console.log("Buyers data response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching buyers data:", error);
    // Return empty object on error to prevent crashes
    return {};
  }
};

/**
 * Fetch dashboard summary statistics
 * @returns {Promise<Object>} Dashboard stats (total sales, revenue, etc.)
 */
export const fetchDashboardStats = async () => {
  try {
    const response = await api.get("/api/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

export default {
  fetchMonthlySales,
  fetchWeeklySales,
  fetchTransactions,
  deleteTransaction,
  fetchBuyersData,
  fetchDashboardStats,
};