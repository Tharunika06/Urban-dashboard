// src/utils/propertyHelpers.js
import React from 'react';
import { API_CONFIG, PROPERTY_STATUS, DEFAULTS } from './constants';

/**
 * Get status class for property status badge
 * @param {string} status - Property status
 * @returns {string} CSS class name
 */
export const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case PROPERTY_STATUS.RENT:
      return 'status-rent';
    case PROPERTY_STATUS.SALE:
      return 'status-sale';
    case PROPERTY_STATUS.BOTH:
      return 'status-both';
    case 'sold':
      return 'status-sold';
    default:
      return '';
  }
};

/**
 * Get the correct CSS class for status pill in property detail view
 * @param {string} status - Property status
 * @returns {string} CSS class name for status pill
 */
export const getStatusPillClass = (status) => {
  switch (status?.toLowerCase()) {
    case PROPERTY_STATUS.RENT:
      return 'rent';
    case PROPERTY_STATUS.SALE:
      return 'sale';
    case PROPERTY_STATUS.BOTH:
      return 'both';
    case 'sold':
      return 'sold';
    default:
      return '';
  }
};

/**
 * Format property price based on status and available prices (for property cards/list)
 * @param {Object} prop - Property object
 * @returns {string|JSX.Element} Formatted price
 */
export const formatPrice = (prop) => {
  const status = prop.status?.toLowerCase();

  // Handle sold properties
  if (status === 'sold') {
    return React.createElement(
      'span',
      {
        className: 'sold-badge-inline',
        style: { color: '#ef4444', fontWeight: 'bold', fontSize: '14px' }
      },
      'SOLD'
    );
  }

  // Handle properties available for both rent and sale
  if (status === PROPERTY_STATUS.BOTH && prop.rentPrice && prop.salePrice) {
    return React.createElement(
      'div',
      { className: 'price-dual' },
      React.createElement(
        'span',
        { className: 'price-rent' },
        `Rent: ₹${Number(prop.rentPrice).toLocaleString()} /mo`
      ),
      React.createElement('br'),
      React.createElement(
        'span',
        { className: 'price-sale' },
        `Sale: ₹${Number(prop.salePrice).toLocaleString()}`
      )
    );
  }

  // Handle rent-only properties
  if (status === PROPERTY_STATUS.RENT && prop.rentPrice) {
    return `₹${Number(prop.rentPrice).toLocaleString()} /month`;
  }

  // Handle sale-only properties
  if (status === PROPERTY_STATUS.SALE && prop.salePrice) {
    return `₹${Number(prop.salePrice).toLocaleString()}`;
  }

  // Fallback for older data with generic 'price'
  if (prop.price) {
    return `₹${Number(prop.price).toLocaleString()}`;
  }

  // Final fallback
  return 'N/A';
};

/**
 * Format price for property detail view (returns JSX for dual pricing)
 * @param {object} property - Property object containing price information
 * @returns {string|JSX.Element} - Formatted price string or JSX element for dual pricing
 */
export const formatPriceForDetail = (property) => {
  if (!property) return 'N/A';

  const status = property.status?.toLowerCase();

  // Case 1: Property is for BOTH rent and sale
  if (status === PROPERTY_STATUS.BOTH && property.rentPrice && property.salePrice) {
    return React.createElement(
      'div',
      { className: 'price-detail-dual' },
      React.createElement(
        'span',
        { className: 'price-detail-rent' },
        `Rent: ₹${Number(property.rentPrice).toLocaleString()} /mo`
      ),
      React.createElement('br'),
      React.createElement(
        'span',
        { className: 'price-detail-sale' },
        `Sale: ₹${Number(property.salePrice).toLocaleString()}`
      )
    );
  }
  
  // Case 2: Property is for RENT only
  if (status === PROPERTY_STATUS.RENT && property.rentPrice) {
    return `₹${Number(property.rentPrice).toLocaleString()} /month`;
  }

  // Case 3: Property is for SALE only
  if (status === PROPERTY_STATUS.SALE && property.salePrice) {
    return `₹${Number(property.salePrice).toLocaleString()}`;
  }
  
  // Fallback for older data or unpriced properties
  if (property.price) {
    return `₹${Number(property.price).toLocaleString()}`;
  }

  return 'N/A';
};

/**
 * Get image source for property photo (supports base64 and uploads)
 * @param {string} photo - Photo URL or data URI
 * @returns {string} Image source URL
 */
export const getPropertyImageSrc = (photo) => {
  if (photo && photo.startsWith('data:image/')) {
    return photo;
  }
  if (photo && photo.startsWith('/uploads/')) {
    return `${API_CONFIG.BASE_URL}${photo}`;
  }
  return DEFAULTS.PLACEHOLDER_IMAGE;
};

/**
 * Get the correct image source for property photos (detail view specific)
 * @param {string} photo - The photo data (base64 or URL)
 * @returns {string} - Valid image source or default fallback
 */
export const getImageSrc = (photo) => {
  if (photo && photo.startsWith('data:image/')) {
    return photo;
  }
  return '/assets/default-house.jpg';
};

/**
 * Get the correct image source for owner photos
 * @param {string} photo - The photo data (base64 or URL)
 * @returns {string} - Valid image source or placeholder
 */
export const getOwnerPhotoSrc = (photo) => {
  if (photo && photo.startsWith('data:image/')) {
    return photo;
  }
  return DEFAULTS.PLACEHOLDER_IMAGE;
};

/**
 * Get owner information from property object
 * @param {Object} property - Property object
 * @returns {Object} Owner information object
 */
export const getOwnerInfo = (property) => {
  if (!property) {
    return {
      photo: DEFAULTS.PLACEHOLDER_IMAGE,
      name: 'Owner Not Found',
      phone: null
    };
  }

  // First try to get from ownerDetails (populated by backend)
  if (property.ownerDetails) {
    return {
      photo: getOwnerPhotoSrc(property.ownerDetails.photo),
      name: property.ownerDetails.name || 'Owner Not Found',
      phone: property.ownerDetails.phone
    };
  }
  
  // Fallback to property's stored owner data
  return {
    photo: getOwnerPhotoSrc(property.ownerPhoto),
    name: property.ownerName || 'Owner Not Found',
    email: null,
    phone: null
  };
};

/**
 * Handle property image load error
 * @param {Event} e - Image error event
 * @param {string} fallbackSrc - Fallback image source
 */
export const handlePropertyImageError = (e, fallbackSrc = DEFAULTS.PLACEHOLDER_IMAGE) => {
  e.target.src = fallbackSrc;
  console.warn('Failed to load image, using fallback');
};

/**
 * Filter properties by month
 * @param {Array} properties - Array of properties
 * @param {string} selectedMonth - Selected month name
 * @param {Array} monthsArray - Array of month names
 * @returns {Array} Filtered properties
 */
export const filterPropertiesByMonth = (properties, selectedMonth, monthsArray) => {
  if (!selectedMonth || selectedMonth === '') {
    return properties;
  }

  const monthIndex = monthsArray.indexOf(selectedMonth);
  if (monthIndex === -1) {
    return properties;
  }

  return properties.filter((property) => {
    const propertyDate = new Date(property.createdAt || property.dateAdded);
    return propertyDate.getMonth() === monthIndex;
  });
};

/**
 * Filter properties by search term
 * @param {Array} properties - Array of properties
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered properties
 */
export const filterPropertiesBySearch = (properties, searchTerm) => {
  if (!searchTerm) {
    return properties;
  }

  const term = searchTerm.toLowerCase();
  return properties.filter(
    (p) =>
      p.name?.toLowerCase().includes(term) ||
      p.address?.toLowerCase().includes(term) ||
      p.type?.toLowerCase().includes(term) ||
      p.city?.toLowerCase().includes(term) ||
      p.ownerName?.toLowerCase().includes(term)
  );
};

/**
 * Apply all filters to properties
 * @param {Array} properties - Array of properties
 * @param {Object} filters - Filter options
 * @param {string} filters.searchTerm - Search term
 * @param {string} filters.month - Selected month
 * @param {Array} filters.monthsArray - Array of month names
 * @returns {Array} Filtered properties
 */
export const applyPropertyFilters = (properties, filters = {}) => {
  let filtered = Array.isArray(properties) ? properties : [];

  // Apply month filter
  if (filters.month) {
    filtered = filterPropertiesByMonth(filtered, filters.month, filters.monthsArray);
  }

  // Apply search filter
  if (filters.searchTerm) {
    filtered = filterPropertiesBySearch(filtered, filters.searchTerm);
  }

  return filtered;
}