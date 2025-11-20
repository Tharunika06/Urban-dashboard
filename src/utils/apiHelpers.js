// src/utils/apiHelpers.js
import axios from 'axios';
import { API_CONFIG } from './constants';

/**
 * Generic fetch data function
 * @param {string} url - API endpoint URL
 * @returns {Promise<Object>} - { success, data, error }
 */
export const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    return { success: true, data: response.data, error: null };
  } catch (err) {
    console.error('Failed to fetch data:', err);
    return { success: false, data: [], error: err.message };
  }
};

/**
 * Generic delete resource function
 * @param {string} baseUrl - Base API endpoint URL
 * @param {string} resourceId - Resource ID to delete
 * @returns {Promise<Object>} - { success, error }
 */
export const deleteResource = async (baseUrl, resourceId) => {
  try {
    await axios.delete(`${baseUrl}/${resourceId}`);
    return { success: true, error: null };
  } catch (err) {
    console.error('Failed to delete resource:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Failed to delete resource';
    return { success: false, error: errorMessage };
  }
};

/**
 * Generic error handler
 * @param {Error} error - Error object
 * @param {Function} setError - State setter function for error
 */
export const handleApiError = (error, setError) => {
  const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
  console.error('API Error:', errorMessage);
  if (setError) {
    setError(errorMessage);
  }
};

/**
 * Fetch all owners from API
 * @returns {Promise<Object>} - { success, data, error }
 */
export const fetchOwners = async () => {
  try {
    const res = await axios.get(`${API_CONFIG.BASE_URL}/api/owners`);
    const ownersArray = Array.isArray(res.data.owners) ? res.data.owners : [];
    return { success: true, data: ownersArray, error: null };
  } catch (err) {
    console.error('Failed to fetch owners:', err);
    return { success: false, data: [], error: err.message };
  }
};

/**
 * Fetch single owner details
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Object>} - { success, data, error }
 */
export const fetchOwnerById = async (ownerId) => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/owners/${ownerId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `Request failed with status: ${response.status}`;
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('Auto-calculated stats:', {
      propertyOwned: data.propertyOwned,
      propertyRent: data.propertyRent,
      propertySold: data.propertySold,
      totalListing: data.totalListing
    });
    
    return { success: true, data, error: null };
  } catch (err) {
    console.error(' Error fetching owner:', err);
    return { success: false, data: null, error: err.message };
  }
};

/**
 * Fetch properties for a specific owner
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Object>} - { success, data, error }
 */
export const fetchOwnerProperties = async (ownerId) => {
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/property/owner/${ownerId}`);
    
    if (!res.ok) {
      throw new Error("Failed to fetch owner properties");
    }
    
    const data = await res.json();
    console.log(`Found ${data.length} properties for this owner`);
    
    return { success: true, data, error: null };
  } catch (err) {
    console.error("Error fetching owner properties:", err);
    return { success: false, data: [], error: err.message };
  }
};

/**
 * Delete owner by ID
 * @param {string} ownerId - Owner ID
 * @returns {Promise<Object>} - { success, error }
 */
export const deleteOwner = async (ownerId) => {
  try {
    await axios.delete(`${API_CONFIG.BASE_URL}/api/owners/${ownerId}`);
    return { success: true, error: null };
  } catch (err) {
    console.error(' Failed to delete owner:', err);
    const errorMessage = err.response?.data?.message || 'Failed to delete owner';
    return { success: false, error: errorMessage };
  }
};

/**
 * Add new owner
 * @param {Object} ownerData - Owner data payload
 * @returns {Promise<Object>} - { success, data, error }
 */
export const addOwner = async (ownerData) => {
  try {
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Full payload:', ownerData);
    console.log('DOJ value:', ownerData.doj);
    console.log('Contact value:', ownerData.contact);
    console.log('Note: Property stats will be auto-calculated from actual properties');
    console.log('============================');

    const response = await axios.post(
      `${API_CONFIG.BASE_URL}/api/owners/add-owner`,
      ownerData,
      {
        headers: { 
          'Content-Type': 'application/json'
        },
        timeout: API_CONFIG.TIMEOUT
      }
    );

    console.log('Owner added successfully:', response.data);
    console.log('Initial stats (all 0):', {
      propertyOwned: response.data.owner?.propertyOwned || 0,
      propertyRent: response.data.owner?.propertyRent || 0,
      propertySold: response.data.owner?.propertySold || 0,
      totalListing: response.data.owner?.totalListing || 0
    });

    return { success: true, data: response.data, error: null };
  } catch (error) {
    console.error('Error saving owner:', error.response ? error.response.data : error.message);
    
    let errorMsg = 'Failed to save owner';
    
    if (error.response?.data?.error) {
      errorMsg = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error.response?.status) {
      errorMsg = `Server Error: ${error.response.status}`;
    } else if (error.request) {
      errorMsg = 'Network error. Please check your connection.';
    }
    
    return { success: false, data: null, error: errorMsg };
  }
};