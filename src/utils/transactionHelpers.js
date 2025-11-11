// src/utils/transactionHelpers.js
import { MONTHS_FULL } from './constants';
import { 
  calculatePagination as calcPaginationDetails, 
  getPaginatedItems 
} from './paginationUtils';

/**
 * Filter transactions by month
 * @param {Array} transactions - Array of transactions
 * @param {string} selectedMonth - Selected month name
 * @returns {Array} Filtered transactions
 */
export const filterTransactionsByMonth = (transactions, selectedMonth) => {
  if (!selectedMonth || selectedMonth === '') {
    return transactions;
  }

  const monthIndex = MONTHS_FULL.indexOf(selectedMonth);
  if (monthIndex === -1) {
    return transactions;
  }

  return transactions.filter((transaction) => {
    if (!transaction.createdAt) return true;
    const transactionDate = new Date(transaction.createdAt);
    return transactionDate.getMonth() === monthIndex;
  });
};

/**
 * Filter transactions by search term
 * @param {Array} transactions - Array of transactions
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered transactions
 */
export const filterTransactionsBySearch = (transactions, searchTerm) => {
  if (!searchTerm) {
    return transactions;
  }

  const term = searchTerm.toLowerCase();
  return transactions.filter(
    (t) =>
      t.customTransactionId?.toLowerCase().includes(term) ||
      t.customerName?.toLowerCase().includes(term) ||
      t.customerPhone?.includes(term) ||
      t.ownerName?.toLowerCase().includes(term)
  );
};

/**
 * Apply all filters to transactions
 * @param {Array} transactions - Array of transactions
 * @param {Object} filters - Filter options
 * @param {string} filters.searchTerm - Search term
 * @param {string} filters.month - Selected month
 * @returns {Array} Filtered transactions
 */
export const applyTransactionFilters = (transactions, filters = {}) => {
  let filtered = Array.isArray(transactions) ? transactions : [];

  // Apply month filter
  if (filters.month) {
    filtered = filterTransactionsByMonth(filtered, filters.month);
  }

  // Apply search filter
  if (filters.searchTerm) {
    filtered = filterTransactionsBySearch(filtered, filters.searchTerm);
  }

  return filtered;
};

/**
 * Calculate pagination data for transactions
 * @param {Array} items - Array of items to paginate
 * @param {number} currentPage - Current page number
 * @param {number} itemsPerPage - Items per page
 * @returns {Object} Pagination data
 */
export const calculateTransactionPagination = (items, currentPage, itemsPerPage) => {
  const paginationDetails = calcPaginationDetails(items.length, currentPage, itemsPerPage);
  const currentItems = getPaginatedItems(items, currentPage, itemsPerPage);

  return {
    totalPages: paginationDetails.totalPages,
    startIndex: paginationDetails.startIndex,
    endIndex: paginationDetails.endIndex,
    currentItems,
    hasNextPage: paginationDetails.hasNextPage,
    hasPrevPage: paginationDetails.hasPreviousPage
  };
};

/**
 * Get purchase type CSS class
 * @param {string} purchaseType - Purchase type
 * @returns {string} CSS class name
 */
export const getPurchaseTypeClass = (purchaseType) => {
  switch (purchaseType?.toLowerCase()) {
    case 'buy':
    case 'sale':
      return 'purchase-type-buy';
    case 'rent':
      return 'purchase-type-rent';
    default:
      return 'purchase-type-unknown';
  }
};

/**
 * Format purchase type for display
 * @param {string} purchaseType - Purchase type
 * @returns {string} Formatted purchase type
 */
export const formatPurchaseType = (purchaseType) => {
  switch (purchaseType?.toLowerCase()) {
    case 'buy':
    case 'sale':
      return 'Buy';
    case 'rent':
      return 'Rent';
    default:
      return 'N/A';
  }
};

/**
 * Get selected row IDs from checked rows object
 * @param {Object} checkedRows - Object with row IDs as keys and boolean values
 * @returns {Array} Array of selected IDs
 */
export const getSelectedIds = (checkedRows) => {
  return Object.keys(checkedRows).filter((id) => checkedRows[id]);
};

/**
 * Check if all items in current page are selected
 * @param {Array} currentItems - Current page items
 * @param {Object} checkedRows - Checked rows object
 * @param {string} idKey - Key to use for item ID (default: '_id')
 * @returns {boolean} True if all items are selected
 */
export const areAllItemsSelected = (currentItems, checkedRows, idKey = '_id') => {
  if (currentItems.length === 0) return false;
  return currentItems.every((item) => checkedRows[item[idKey]]);
};

/**
 * Toggle all items selection
 * @param {Array} currentItems - Current page items
 * @param {boolean} selectAll - Current select all state
 * @param {string} idKey - Key to use for item ID (default: '_id')
 * @returns {Object} Updated checked rows object
 */
export const toggleAllItems = (currentItems, selectAll, idKey = '_id') => {
  const updated = {};
  currentItems.forEach((item) => {
    updated[item[idKey]] = !selectAll;
  });
  return updated;
};

/**
 * Toggle single item selection
 * @param {Object} checkedRows - Current checked rows object
 * @param {string} id - Item ID to toggle
 * @param {Array} currentItems - Current page items
 * @param {string} idKey - Key to use for item ID (default: '_id')
 * @returns {Object} Object with updated checkedRows and selectAll state
 */
export const toggleSingleItem = (checkedRows, id, currentItems, idKey = '_id') => {
  const newChecked = { ...checkedRows, [id]: !checkedRows[id] };
  const allSelected = areAllItemsSelected(currentItems, newChecked, idKey);
  
  return {
    checkedRows: newChecked,
    selectAll: allSelected
  };
};

/**
 * Get image source with fallback
 * @param {string} photo - Photo path or data URL
 * @param {string} baseUrl - API base URL
 * @param {string} placeholder - Placeholder image path
 * @returns {string} Image source URL
 */
export const getImageSrc = (photo, baseUrl, placeholder) => {
  if (photo && photo.startsWith('data:image/')) return photo;
  if (photo && photo.startsWith('/uploads/')) return `${baseUrl}${photo}`;
  return placeholder;
};

/**
 * Handle image load error
 * @param {Event} e - Error event
 * @param {string} placeholder - Placeholder image path
 */
export const handleImageError = (e, placeholder) => {
  e.target.src = placeholder;
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatTransactionDate = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format amount with currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: '₹')
 * @returns {string} Formatted amount string
 */
export const formatAmount = (amount, currency = '₹') => {
  if (typeof amount !== 'number') return 'N/A';
  return `${currency}${amount.toLocaleString('en-IN')}`;
};