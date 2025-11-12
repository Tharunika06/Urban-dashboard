// src/services/reviewService.js
import api from '../utils/api';

/**
 * Review Service
 * Centralized API calls for all review-related operations
 */
const reviewService = {
  /**
   * Get all reviews
   * @returns {Promise} Response with array of reviews
   */
  getAllReviews: async () => {
    console.log("⭐ Fetching all reviews...");
    const response = await api.get('/api/reviews');
    return response.data;
  },

  /**
   * Get review by ID
   * @param {string} reviewId - Review ID
   * @returns {Promise} Response with review details
   */
  getReviewById: async (reviewId) => {
    console.log(`📄 Fetching review ${reviewId}...`);
    const response = await api.get(`/api/reviews/${reviewId}`);
    return response.data;
  },

  /**
   * Create new review
   * @param {Object} reviewData - Review data
   * @returns {Promise} Response with created review
   */
  createReview: async (reviewData) => {
    console.log("➕ Creating new review...");
    const response = await api.post('/api/reviews', reviewData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  /**
   * Update review
   * @param {string} reviewId - Review ID
   * @param {Object} reviewData - Updated review data
   * @returns {Promise} Response with updated review
   */
  updateReview: async (reviewId, reviewData) => {
    console.log(`✏️ Updating review ${reviewId}...`);
    const response = await api.put(
      `/api/reviews/${reviewId}`,
      reviewData
    );
    return response.data;
  },

  /**
   * Delete review
   * @param {string} reviewId - Review ID
   * @returns {Promise} Response indicating deletion success
   */
  deleteReview: async (reviewId) => {
    console.log(`🗑️ Deleting review ${reviewId}...`);
    const response = await api.delete(`/api/reviews/${reviewId}`);
    return response.data;
  },

  /**
   * Get reviews by property
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response with array of reviews
   */
  getReviewsByProperty: async (propertyId) => {
    console.log(`🏠 Fetching reviews for property ${propertyId}...`);
    const response = await api.get(`/api/reviews/property/${propertyId}`);
    return response.data;
  },

  /**
   * Get reviews by customer
   * @param {string} customerId - Customer ID
   * @returns {Promise} Response with array of reviews
   */
  getReviewsByCustomer: async (customerId) => {
    console.log(`👤 Fetching reviews for customer ${customerId}...`);
    const response = await api.get(`/api/reviews/customer/${customerId}`);
    return response.data;
  },

  /**
   * Get reviews by rating
   * @param {number} rating - Rating (1-5)
   * @returns {Promise} Response with filtered reviews
   */
  getReviewsByRating: async (rating) => {
    console.log(`⭐ Fetching reviews with rating ${rating}...`);
    const response = await api.get('/api/reviews', {
      params: { rating }
    });
    return response.data;
  },

  /**
   * Get reviews by date range
   * @param {string} startDate - Start date (ISO format)
   * @param {string} endDate - End date (ISO format)
   * @returns {Promise} Response with filtered reviews
   */
  getReviewsByDateRange: async (startDate, endDate) => {
    console.log(`📅 Fetching reviews from ${startDate} to ${endDate}...`);
    const response = await api.get('/api/reviews', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  /**
   * Search reviews
   * @param {string} query - Search query
   * @returns {Promise} Response with filtered reviews
   */
  searchReviews: async (query) => {
    console.log(`🔍 Searching reviews: ${query}...`);
    const response = await api.get('/api/reviews/search', {
      params: { q: query }
    });
    return response.data;
  },

  /**
   * Get review statistics
   * @returns {Promise} Response with review statistics
   */
  getReviewStats: async () => {
    console.log("📊 Fetching review statistics...");
    const response = await api.get('/api/reviews/stats');
    return response.data;
  },

  /**
   * Approve/Publish review
   * @param {string} reviewId - Review ID
   * @returns {Promise} Response with updated review
   */
  approveReview: async (reviewId) => {
    console.log(`✅ Approving review ${reviewId}...`);
    const response = await api.patch(`/api/reviews/${reviewId}/approve`);
    return response.data;
  },

  /**
   * Reject review
   * @param {string} reviewId - Review ID
   * @returns {Promise} Response with updated review
   */
  rejectReview: async (reviewId) => {
    console.log(`❌ Rejecting review ${reviewId}...`);
    const response = await api.patch(`/api/reviews/${reviewId}/reject`);
    return response.data;
  }
};

export default reviewService;

// Export individual functions for backward compatibility (if needed)
export const {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getReviewsByProperty,
  getReviewsByCustomer,
  getReviewsByRating,
  getReviewsByDateRange,
  searchReviews,
  getReviewStats,
  approveReview,
  rejectReview
} = reviewService;