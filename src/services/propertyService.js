// src/services/propertyService.js
import api from '../utils/api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Property Service
 * Centralized API calls for all property-related operations
 */
const propertyService = {
  /**
   * Get all properties
   * @returns {Promise} Response with array of properties
   */
  getAllProperties: async () => {
    console.log("📋 Fetching all properties...");
    const response = await api.get(API_ENDPOINTS.PROPERTY);
    return response.data;
  },

  /**
   * Get property by ID
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response with property details
   */
  getPropertyById: async (propertyId) => {
    console.log(`🏠 Fetching property ${propertyId}...`);
    const response = await api.get(`${API_ENDPOINTS.PROPERTY}/${propertyId}`);
    return response.data;
  },

  /**
   * Create new property
   * @param {Object} propertyData - Property data including photo (base64)
   * @returns {Promise} Response with created property
   */
  createProperty: async (propertyData) => {
    console.log("➕ Creating new property...");
    const response = await api.post(API_ENDPOINTS.PROPERTY, propertyData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  /**
   * Update property
   * @param {string} propertyId - Property ID
   * @param {Object} propertyData - Updated property data
   * @returns {Promise} Response with updated property
   */
  updateProperty: async (propertyId, propertyData) => {
    console.log(`✏️ Updating property ${propertyId}...`);
    const response = await api.put(`${API_ENDPOINTS.PROPERTY}/${propertyId}`, propertyData);
    return response.data;
  },

  /**
   * Delete property
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response indicating deletion success
   */
  deleteProperty: async (propertyId) => {
    console.log(`🗑️ Deleting property ${propertyId}...`);
    const response = await api.delete(`${API_ENDPOINTS.PROPERTY}/${propertyId}`);
    return response.data;
  },

  /**
   * Bulk delete properties
   * @param {Array<string>} propertyIds - Array of property IDs
   * @returns {Promise} Response indicating bulk deletion success
   */
  bulkDeleteProperties: async (propertyIds) => {
    console.log(`🗑️ Bulk deleting ${propertyIds.length} properties...`);
    const deletePromises = propertyIds.map(id => 
      api.delete(`${API_ENDPOINTS.PROPERTY}/${id}`)
    );
    const responses = await Promise.all(deletePromises);
    return responses.map(r => r.data);
  },

  /**
   * Get all owners
   * @returns {Promise} Response with array of owners
   */
  getAllOwners: async () => {
    console.log("👥 Fetching all owners...");
    const response = await api.get(API_ENDPOINTS.OWNERS);
    return response.data;
  }
};

export default propertyService;