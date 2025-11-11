// src/utils/ownerHelpers.js
import { API_CONFIG, DEFAULTS } from './constants';

/**
 * Get the correct owner photo source URL
 * @param {string} photo - Photo path or base64 string
 * @returns {string} - Valid photo URL
 */
export const getOwnerPhotoSrc = (photo) => {
  if (photo && photo.startsWith('data:image/')) {
    return photo;
  }
  if (photo && photo.startsWith('/uploads/')) {
    return `${API_CONFIG.BASE_URL}${photo}`;
  }
  return DEFAULTS.PLACEHOLDER_IMAGE;
};

/**
 * Get the correct property photo source URL
 * @param {string} photo - Photo path or base64 string
 * @returns {string} - Valid photo URL
 */
export const getPropertyPhotoSrc = (photo) => {
  if (photo && photo.startsWith('data:image/')) {
    return photo;
  }
  if (photo && photo.startsWith('/uploads/')) {
    return `${API_CONFIG.BASE_URL}${photo}`;
  }
  return '/assets/default-property.png';
};

/**
 * Handle image loading errors with fallback
 * @param {Event} e - Error event
 * @param {string} fallbackSrc - Fallback image source
 */
export const handleImageError = (e, fallbackSrc = '/assets/default-avatar.png') => {
  e.target.src = fallbackSrc;
  console.warn('Failed to load image, using fallback');
};

/**
 * Calculate available properties (total - sold)
 * @param {Object} owner - Owner object
 * @returns {number} - Number of available properties
 */
export const getAvailableProperties = (owner) => {
  const total = owner.propertyOwned || 0;
  const sold = owner.propertySold || 0;
  return Math.max(0, total - sold);
};

/**
 * Filter owners by month
 * @param {Array} owners - Array of owner objects
 * @param {string} selectedMonth - Month name (e.g., "January")
 * @param {Array} monthsList - Array of month names
 * @returns {Array} - Filtered owners
 */
export const filterOwnersByMonth = (owners, selectedMonth, monthsList) => {
  if (!selectedMonth || selectedMonth === '') {
    return owners;
  }

  const monthIndex = monthsList.indexOf(selectedMonth);
  if (monthIndex === -1) {
    return owners;
  }

  return owners.filter(owner => {
    const ownerDate = new Date(owner.doj || owner.createdAt);
    return ownerDate.getMonth() === monthIndex;
  });
};

/**
 * Filter owners by search term
 * @param {Array} owners - Array of owner objects
 * @param {string} searchTerm - Search query
 * @returns {Array} - Filtered owners
 */
export const filterOwnersBySearch = (owners, searchTerm) => {
  if (!searchTerm) {
    return owners;
  }

  const term = searchTerm.toLowerCase();
  return owners.filter(
    (owner) =>
      owner.name?.toLowerCase().includes(term) ||
      owner.email?.toLowerCase().includes(term) ||
      owner.address?.toLowerCase().includes(term) ||
      owner.contact?.toLowerCase().includes(term)
  );
};

/**
 * Format property price for display
 * @param {Object} property - Property object
 * @returns {string} - Formatted price string
 */
export const formatPropertyPrice = (property) => {
  if (property.status === 'rent' && property.rentPrice) {
    return `₹${property.rentPrice}/month`;
  }
  if (property.status === 'sale' && property.salePrice) {
    return `₹${property.salePrice}`;
  }
  if (property.status === 'both' && property.rentPrice && property.salePrice) {
    return `₹${property.rentPrice}/month | ₹${property.salePrice}`;
  }
  if (property.price) {
    return `₹${property.price}`;
  }
  return 'Price not specified';
};

/**
 * Validate phone number
 * @param {string} phone - Phone number
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) {
    return { isValid: true, error: '' };
  }

  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length > 0 && digitsOnly.length < 10) {
    return { isValid: false, error: 'Phone number must be exactly 10 digits' };
  }
  
  if (digitsOnly.length === 10) {
    return { isValid: true, error: '' };
  }

  return { isValid: false, error: 'Invalid phone number format' };
};

/**
 * Sanitize phone number input (digits only, max 10)
 * @param {string} value - Input value
 * @returns {string} - Sanitized phone number
 */
export const sanitizePhoneNumber = (value) => {
  const digitsOnly = value.replace(/\D/g, '');
  return digitsOnly.slice(0, 10);
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '-';
  try {
    return new Date(date).toLocaleDateString();
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};