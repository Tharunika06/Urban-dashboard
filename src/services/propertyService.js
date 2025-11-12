// src/services/propertyService.js
import api from '../utils/api';

/**
 * Property Service
 * Centralized API calls for all property-related operations
 */
const propertyService = {
  /**
   * Get all properties
   * @param {boolean} includePhotos - Whether to include photos in response
   * @returns {Promise} Response with array of properties
   */
  getAllProperties: async (includePhotos = true) => {
    console.log("🏘️ Fetching all properties...");
    const response = await api.get('/api/property', {
      params: { includePhotos }
    });
    return response.data;
  },

  /**
   * Get available properties (excluding sold ones)
   * @returns {Promise} Response with array of available properties
   */
  getAvailableProperties: async () => {
    console.log("🏘️ Fetching available properties...");
    const response = await api.get('/api/property/available');
    return response.data;
  },

  /**
   * Get sold-out properties
   * @returns {Promise} Response with array of sold properties
   */
  getSoldOutProperties: async () => {
    console.log("🏘️ Fetching sold-out properties...");
    const response = await api.get('/api/property/sold-out');
    return response.data;
  },

  /**
   * Get property by ID
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response with property details
   */
  getPropertyById: async (propertyId) => {
    console.log(`🏠 Fetching property ${propertyId}...`);
    const response = await api.get(`/api/property/${propertyId}`);
    return response.data;
  },

  /**
   * Get properties by owner ID
   * @param {string} ownerId - Owner ID
   * @returns {Promise} Response with array of properties
   */
  getPropertiesByOwner: async (ownerId) => {
    console.log(`🏠 Fetching properties for owner ${ownerId}...`);
    const response = await api.get(`/api/property/owner/${ownerId}`);
    return response.data;
  },

  /**
   * Get properties by category/type
   * @param {string} type - Property type
   * @returns {Promise} Response with array of properties
   */
  getPropertiesByCategory: async (type) => {
    console.log(`🏠 Fetching properties of type ${type}...`);
    const response = await api.get(`/api/property/category/${type}`);
    return response.data;
  },

  /**
   * Get property with owner details
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response with property and owner details
   */
  getPropertyWithOwner: async (propertyId) => {
    console.log(`🏠 Fetching property with owner details ${propertyId}...`);
    const response = await api.get(`/api/property/${propertyId}/with-owner`);
    return response.data;
  },

  /**
   * Check property availability
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response with availability status
   */
  checkPropertyAvailability: async (propertyId) => {
    console.log(`🔍 Checking availability for property ${propertyId}...`);
    const response = await api.get(`/api/property/${propertyId}/availability`);
    return response.data;
  },

  /**
   * Create new property
   * @param {Object} propertyData - Property data including photo (base64)
   * @returns {Promise} Response with created property
   */
  createProperty: async (propertyData) => {
    console.log("➕ Creating new property...");
    const response = await api.post('/api/property', propertyData, {
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
    const response = await api.put(`/api/property/${propertyId}`, propertyData);
    return response.data;
  },

  /**
   * Delete property
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response indicating deletion success
   */
  deleteProperty: async (propertyId) => {
    console.log(`🗑️ Deleting property ${propertyId}...`);
    const response = await api.delete(`/api/property/${propertyId}`);
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
      api.delete(`/api/property/${id}`)
    );
    const responses = await Promise.all(deletePromises);
    return responses.map(r => r.data);
  }
};

export default propertyService;