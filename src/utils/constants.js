// src/utils/constants.js

export const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'
];

export const MONTHS_ABBREVIATED = MONTHS_SHORT.map(m => m.slice(0, 3).toLowerCase());

/**
 * Chart-related constants
 */
export const CHART_COLORS = {
  PRIMARY: '#0075FF',
  GRADIENT_START: '#FF4995',
  GRADIENT_END: '#D6034F',
  EMPTY: '#E6E8F0',
  BACKGROUND: '#f0f0f0',
  HIGHLIGHT: '#e52c82ff',
};

export const PIE_CHART_COLORS = ['url(#gradientColor)', '#f0f0f0'];

/**
 * Status-related constants
 */
export const STATUS_CLASSES = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

/**
 * Customer Status
 */
export const CUSTOMER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

/**
 * Utility function to get status class
 */
export const getStatusClass = (status) => (status ? status.toLowerCase() : '');

/**
 * Utility function to convert various month formats to full month name
 */
export const toFullMonthName = (raw) => {
  if (raw === null || raw === undefined) return null;
  
  // Handle numeric input (1-12)
  if (typeof raw === 'number' || (/^\d+$/.test(String(raw).trim()))) {
    const idx = Number(raw) - 1;
    if (idx >= 0 && idx < 12) return MONTHS_FULL[idx];
    return null;
  }
  
  const s = String(raw).trim().toLowerCase();
  
  // Check for exact full month name match
  const full = MONTHS_FULL.find(m => m.toLowerCase() === s);
  if (full) return full;
  
  // Check for abbreviated month name match
  const shortIdx = MONTHS_ABBREVIATED.indexOf(s.length >= 3 ? s.slice(0, 3) : s);
  if (shortIdx !== -1) return MONTHS_FULL[shortIdx];
  
  return null;
};

/**
 * Formatter functions
 */
export const formatters = {
  currency: (value, locale = 'en-US') => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  },
  
  date: (dateString) => {
    return new Date(dateString).toLocaleDateString();
  },
  
  amount: (amount, locale = 'en-IN') => {
    return `$${amount.toLocaleString(locale)}`;
  }
};

/**
 * ✅ API Configuration - UPDATED
 * Use environment variable or fallback to local network IP
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  TIMEOUT: 30000, // 30 seconds
  MAX_CONTENT_LENGTH: Infinity,
  MAX_BODY_LENGTH: Infinity,
  AUTO_REFRESH_INTERVAL: 30000, // 30 seconds - auto-refresh interval
};

/**
 * Socket configuration - UPDATED to match API_CONFIG
 */
export const SOCKET_CONFIG = {
  URL: import.meta.env.VITE_SOCKET_URL || API_CONFIG.BASE_URL,
  OPTIONS: { 
    withCredentials: true,
    transports: ['websocket', 'polling']
  }
};

/**
 * API endpoints (relative to BASE_URL/api)
 */
export const API_ENDPOINTS = {
  STATS: '/api/stats',
  TRANSACTIONS: '/api/payment/transactions',
  BUYERS: '/api/payment/buyers',
  SALES_MONTHLY: '/api/sales/monthly',
  PROPERTY: '/api/property',
  OWNERS: '/api/owners',
  CUSTOMER: '/api/payment/customer',
  AUTH: '/api', // Base auth endpoint
  ADMIN_PROFILE: '/api/admin/profile', // Admin profile endpoint
};

/**
 * Socket.io Events
 */
export const SOCKET_EVENTS = {
  UPDATE_ANALYTICS: 'update-analytics',
  TRANSACTION_UPDATED: 'transaction-updated',
  OWNER_STATS_UPDATED: 'owner-stats-updated',
  CUSTOMER_UPDATED: 'customer-updated',
};

/**
 * Default values
 */
export const DEFAULTS = {
  MONTH: 'All',
  PLACEHOLDER_IMAGE: '/assets/placeholder.png',
  TRANSACTION_LIMIT: 3,
  VIEW_MODE: 'list', // Default view mode for Property page
  SEARCH_TERM: '',
  SELECTED_MONTH: '',
  DEFAULT_PROPERTY_TYPE: 'Apartment',
};

export const PROPERTY_TYPES = ['Villas', 'Apartment', 'Residences', 'Guest House', 'House'];

export const PROPERTY_STATUS = {
  SALE: 'sale',
  RENT: 'rent',
  BOTH: 'both',
};

export const PROPERTY_STATUS_OPTIONS = [
  { value: 'sale', label: 'Sale' },
  { value: 'rent', label: 'Rent' },
  { value: 'both', label: 'Both (Rent & Sale)' },
];

export const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];
export const BATHROOM_OPTIONS = [1, 2, 3, 4, 5];

export const COUNTRIES = ['India', 'USA', 'UK', 'Canada'];
export const CITIES = ['Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'New York', 'London', 'Austin'];

export const STATIC_FACILITIES = [
  'Big Swimming Pool',
  'Near Airport',
  'Car Parking',
  '24/7 Electricity'
];

/**
 * Property View Constants
 */
export const PROPERTY_VIEW = {
  LIST: 'list',
  GRID: 'grid',
};

export const PROPERTY_PAGE_TITLES = {
  LIST: 'All Property List',
  GRID: 'All Property Grid',
};

/**
 * Image paths and icons
 */
export const ASSET_PATHS = {
  SEARCH_ICON: '/assets/search-icon.png',
  LIST_ACTIVE: '/assets/list-active.png',
  LIST_INACTIVE: '/assets/list-inactive.png',
  GRID_ACTIVE: '/assets/grid-active.png',
  GRID_INACTIVE: '/assets/grid-inactive.png',
  REMOVE_ICON: '/assets/remove.png',
  SUCCESS_ICON: '/assets/success.png',
  ERROR_ICON: '/assets/error.png',
  WARNING_ICON: '/assets/warning.png',
  INFO_ICON: '/assets/info.png',
  VIEW_ICON: '/assets/view-icon.png',
  DELETE_ICON: '/assets/delete-icon.png',
  EDIT_ICON: '/assets/edit-icon.png',
};

/**
 * UI Messages
 */
export const UI_MESSAGES = {
  // Loading states
  LOADING_PROPERTIES: 'Loading properties...',
  LOADING_ORDERS: 'Loading orders...',
  LOADING_CUSTOMERS: 'Loading customers...',
  
  // Empty states
  NO_PROPERTIES_FOUND: 'No properties found',
  NO_ORDERS_FOUND: 'No orders found.',
  NO_CUSTOMERS_FOUND: 'No customers found.',
  
  // Page titles
  ALL_ORDER_LIST: 'All Order List',
  ALL_CUSTOMERS_LIST: 'All Customers List',
  
  // Success messages
  PROPERTY_DELETED: 'Property deleted successfully',
  PROPERTIES_DELETED: 'properties deleted successfully',
  ORDER_DELETED: 'Order deleted successfully',
  CUSTOMER_DELETED: 'Customer deleted successfully',
  
  // Error messages
  DELETE_FAILED: 'Failed to delete property. Please try again.',
  CUSTOMER_DELETE_FAILED: 'Failed to delete customer',
  FETCH_FAILED: 'Failed to fetch properties',
  FETCH_CUSTOMER_FAILED: 'Failed to fetch customer data',
  
  // Confirmation messages
  DELETE_SINGLE_TITLE: 'Delete Property',
  DELETE_SINGLE_MESSAGE: 'Are you sure you want to delete this property? This action cannot be undone.',
  DELETE_BULK_TITLE: 'Delete Multiple Properties',
  DELETE_BULK_MESSAGE_PREFIX: 'Are you sure you want to delete',
  DELETE_BULK_MESSAGE_SUFFIX: 'properties? This action cannot be undone.',
  
  // Socket messages
  SOCKET_CONNECTED: '🔌 Socket.io connected',
  SOCKET_DISCONNECTED: '🔌 Socket.io disconnected',
  SOCKET_UPDATE_RECEIVED: '🔔 Received update event:',
};

/**
 * Image upload constants
 */
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  MAX_SIZE_MB: 5,
  VALID_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ACCEPT_STRING: 'image/jpeg,image/jpg,image/png,image/gif,image/webp',
};

/**
 * Form validation messages
 */
export const VALIDATION_MESSAGES = {
  PROPERTY_NAME_REQUIRED: 'Property name is required',
  OWNER_ID_REQUIRED: 'Owner ID is required',
  RENT_PRICE_REQUIRED: 'Rent price is required for rental properties',
  SALE_PRICE_REQUIRED: 'Sale price is required for sale properties',
  BOTH_PRICES_REQUIRED: 'Both rent and sale prices are required',
};

/**
 * Popup/Alert messages
 */
export const POPUP_MESSAGES = {
  // Success messages
  PROPERTY_ADDED: {
    title: 'Property Added Successfully',
    message: 'The property has been added to the database.',
    type: 'success',
  },
  
  // Error messages
  FAILED_TO_LOAD_OWNERS: {
    title: 'Failed to Load Owners',
    message: 'Please refresh and try again.',
    type: 'error',
  },
  
  VALIDATION_ERROR: {
    title: 'Validation Error',
    type: 'error',
  },
  
  IMAGE_TOO_LARGE: {
    title: 'Image Too Large',
    message: 'Please select an image smaller than 5MB.',
    type: 'error',
  },
  
  INVALID_IMAGE_TYPE: {
    title: 'Invalid Image Type',
    message: 'Please select a valid image file (JPEG, PNG, GIF, or WebP).',
    type: 'error',
  },
  
  IMAGE_PROCESSING_ERROR: {
    title: 'Image Processing Error',
    message: 'Failed to process the selected image. Please try a different image.',
    type: 'error',
  },
  
  IMAGE_FORMAT_ERROR: {
    title: 'Image Processing Error',
    message: 'Failed to process the image correctly. Please try another image.',
    type: 'error',
  },
  
  REQUEST_TIMEOUT: {
    title: 'Request Timeout',
    message: 'Request timeout. The image might be too large or the server is slow. Try a smaller image.',
    type: 'error',
  },
  
  NETWORK_ERROR: {
    title: 'Network Error',
    message: 'Network error. Please check your internet connection and server availability.',
    type: 'error',
  },
  
  PROPERTY_ADD_FAILED: {
    title: 'Failed to Add Property',
    message: 'Failed to add property. Please try again.',
    type: 'error',
  },
};

/**
 * Icon paths (legacy support - use ASSET_PATHS for new code)
 */
export const ICONS = {
  SUCCESS: '/assets/success.png',
  ERROR: '/assets/remove.png',
  WARNING: '/assets/warning.png',
  INFO: '/assets/info.png',
};

/**
 * Form placeholders
 */
export const PLACEHOLDERS = {
  SEARCH: 'Search',
  PROPERTY_NAME: 'Enter property name',
  RENT_PRICE: '25,000',
  SALE_PRICE: '50,00,000',
  SIZE: '1200 sq ft',
  FLOOR: 'Ground Floor / 2nd Floor',
  ADDRESS: 'Enter complete address',
  ZIP: '600001',
  CUSTOM_FACILITY: 'Add custom facility',
  ABOUT: 'Describe the property in detail',
};

/**
 * Form labels
 */
export const FORM_LABELS = {
  PROPERTY_NAME: 'Property Name',
  PROPERTY_TYPE: 'Property Type',
  PROPERTY_STATUS: 'Property Available For',
  RENT_PRICE: 'Rent Price (Monthly)',
  SALE_PRICE: 'Sale Price',
  BEDROOMS: 'Bedrooms',
  BATHROOMS: 'Bathrooms',
  SIZE: 'Area (Square Feet)',
  FLOOR: 'Floor',
  ADDRESS: 'Property Address',
  COUNTRY: 'Country',
  CITY: 'City',
  ZIP: 'Zip Code',
  PROPERTY_IMAGE: 'Property Image',
  OWNER_ID: 'Owner ID',
  OWNER_NAME: 'Owner Name',
  FACILITIES: 'Property Facilities',
  ABOUT: 'About Property',
};

/**
 * Button labels
 */
export const BUTTON_LABELS = {
  SAVE: 'Save Property',
  SAVING: 'Saving...',
  NEXT: 'Next →',
  BACK: '← Back',
  ADD: 'Add',
  ADD_PROPERTY: 'Add Property',
  ADD_CUSTOMER: 'Add Customer',
  OK: 'OK',
  CANCEL: 'Cancel',
  DELETE: 'Delete',
  CLOSE: '✖',
  RETRY: 'Retry',
};

/**
 * Modal/Form step titles
 */
export const FORM_STEPS = {
  BASIC_INFO: 'Add Property - Basic Info',
  FACILITIES_ABOUT: 'Add Property - Facilities & About',
};

/**
 * Styling constants
 */
export const STYLES = {
  LOADING_STATE: {
    textAlign: 'center',
    padding: '40px',
  },
  ERROR_STATE: {
    textAlign: 'center',
    padding: '40px',
    color: '#f44336',
  },
  RETRY_BUTTON: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  EMPTY_STATE: {
    textAlign: 'center',
    padding: '40px',
  },
};

/**
 * Helper function to convert file to base64
 */
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};