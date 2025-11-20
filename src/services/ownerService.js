// src/services/ownerService.js
import api from '../utils/api';

/**
 * Owner Service
 * Centralized API calls for all owner-related operations
 */
const ownerService = {
  /**
   * Get all owners
   * @returns {Promise} Response with array of owners
   */
  getAllOwners: async () => {
    const response = await api.get('/api/owners');
    return response.data;
  },

  /**
   * Get owner by ID
   * @param {string} ownerId - Owner ID
   * @returns {Promise} Response with owner details
   */
  getOwnerById: async (ownerId) => {
    const response = await api.get(`/api/owners/${ownerId}`);
    return response.data;
  },

  /**
   * Create new owner
   * @param {Object} ownerData - Owner data including photo (base64)
   * @returns {Promise} Response with created owner
   */
  createOwner: async (ownerData) => {
    const response = await api.post('/api/owners/add-owner', ownerData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  /**
   * Update owner
   * @param {string} ownerId - Owner ID
   * @param {Object} ownerData - Updated owner data
   * @returns {Promise} Response with updated owner
   */
  updateOwner: async (ownerId, ownerData) => {
    const response = await api.put(`/api/owners/${ownerId}`, ownerData);
    return response.data;
  },

  /**
   * Delete owner
   * @param {string} ownerId - Owner ID
   * @returns {Promise} Response indicating deletion success
   */
  deleteOwner: async (ownerId) => {
    const response = await api.delete(`/api/owners/${ownerId}`);
    return response.data;
  },

  /**
   * Get properties owned by specific owner
   * ✅ FIXED: Now calls the correct endpoint
   * @param {string} ownerId - Owner ID
   * @returns {Promise} Response with array of properties
   */
  getOwnerProperties: async (ownerId) => {
    const response = await api.get(`/api/owners/${ownerId}/properties`);
    return response.data;
  },

  /**
   * Recalculate owner statistics
   * @param {string} ownerId - Owner ID
   * @returns {Promise} Response with updated statistics
   */
  recalculateStats: async (ownerId) => {
    const response = await api.post(`/api/owners/${ownerId}/recalculate-stats`);
    return response.data;
  },

  /**
   * Recalculate all owner statistics
   * @returns {Promise} Response with recalculation results
   */
  recalculateAllStats: async () => {
    const response = await api.post(`/api/owners/utils/recalculate-all`);
    return response.data;
  }
};

export default ownerService;