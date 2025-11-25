// src/services/propertyService.js
import api from '../utils/authUtil';

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
    const response = await api.get('/api/property/available');
    return response.data;
  },

  /**
   * Get sold-out properties
   * @returns {Promise} Response with array of sold properties
   */
  getSoldOutProperties: async () => {
    const response = await api.get('/api/property/sold-out');
    return response.data;
  },

  /**
   * Get property by ID
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response with property details
   */
  getPropertyById: async (propertyId) => {
    const response = await api.get(`/api/property/${propertyId}`);
    return response.data;
  },

  /**
   * Get properties by owner ID
   * @param {string} ownerId - Owner ID
   * @returns {Promise} Response with array of properties
   */
  getPropertiesByOwner: async (ownerId) => {
    const response = await api.get(`/api/property/owner/${ownerId}`);
    return response.data;
  },

  /**
   * Get properties by category/type
   * @param {string} type - Property type
   * @returns {Promise} Response with array of properties
   */
  getPropertiesByCategory: async (type) => {
    const response = await api.get(`/api/property/category/${type}`);
    return response.data;
  },

  /**
   * Get property with owner details
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response with property and owner details
   */
  getPropertyWithOwner: async (propertyId) => {
    const response = await api.get(`/api/property/${propertyId}/with-owner`);
    return response.data;
  },

  /**
   * Check property availability
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response with availability status
   */
  checkPropertyAvailability: async (propertyId) => {
    const response = await api.get(`/api/property/${propertyId}/availability`);
    return response.data;
  },

  /**
   * Get all owners
   * @param {boolean} includePhotos - Whether to include photos in response
   * @returns {Promise} Response with array of owners
   */
  getAllOwners: async (includePhotos = false) => {
    const response = await api.get('/api/owners', {
      params: { includePhotos }
    });
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
   * Create new property
   * @param {Object} propertyData - Property data including photo (base64)
   * @returns {Promise} Response with created property
   */
  createProperty: async (propertyData) => {
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
    const response = await api.put(`/api/property/${propertyId}`, propertyData);
    return response.data;
  },

  /**
   * Delete property
   * @param {string} propertyId - Property ID
   * @returns {Promise} Response indicating deletion success
   */
  deleteProperty: async (propertyId) => {
    const response = await api.delete(`/api/property/${propertyId}`);
    return response.data;
  },

  /**
   * Bulk delete properties
   * @param {Array<string>} propertyIds - Array of property IDs
   * @returns {Promise} Response indicating bulk deletion success
   */
  bulkDeleteProperties: async (propertyIds) => {
    const deletePromises = propertyIds.map(id => 
      api.delete(`/api/property/${id}`)
    );
    const responses = await Promise.all(deletePromises);
    return responses.map(r => r.data);
  }
};

export default propertyService;