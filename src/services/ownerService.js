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
    console.log("👥 Fetching all owners...");
    const response = await api.get('/api/owners');
    return response.data;
  },

  /**
   * Get owner by ID
   * @param {string} ownerId - Owner ID
   * @returns {Promise} Response with owner details
   */
  getOwnerById: async (ownerId) => {
    console.log(`👤 Fetching owner ${ownerId}...`);
    const response = await api.get(`/api/owners/${ownerId}`);
    return response.data;
  },

  /**
   * Create new owner
   * @param {Object} ownerData - Owner data including photo (base64)
   * @returns {Promise} Response with created owner
   */
  createOwner: async (ownerData) => {
    console.log("➕ Creating new owner...");
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
    console.log(`✏️ Updating owner ${ownerId}...`);
    const response = await api.put(`/api/owners/${ownerId}`, ownerData);
    return response.data;
  },

  /**
   * Delete owner
   * @param {string} ownerId - Owner ID
   * @returns {Promise} Response indicating deletion success
   */
  deleteOwner: async (ownerId) => {
    console.log(`🗑️ Deleting owner ${ownerId}...`);
    const response = await api.delete(`/api/owners/${ownerId}`);
    return response.data;
  },

  /**
   * Get properties owned by specific owner
   * @param {string} ownerId - Owner ID
   * @returns {Promise} Response with array of properties
   */
  getOwnerProperties: async (ownerId) => {
    console.log(`🏠 Fetching properties for owner ${ownerId}...`);
    const response = await api.get(`/api/owners/${ownerId}/properties`);
    return response.data;
  },

  /**
   * Update owner statistics
   * @param {string} ownerId - Owner ID
   * @returns {Promise} Response with updated statistics
   */
  updateOwnerStats: async (ownerId) => {
    console.log(`📊 Updating stats for owner ${ownerId}...`);
    const response = await api.post(`/api/owners/${ownerId}/update-stats`);
    return response.data;
  }
};

export default ownerService;