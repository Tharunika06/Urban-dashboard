// src/utils/reviewHelpers.js
import { MONTHS_FULL } from './constants';
import { 
  calculatePagination as calcPaginationDetails, 
  getPaginatedItems 
} from './paginationUtils';

/**
 * Filter reviews by month
 * @param {Array} reviews - Array of reviews
 * @param {string} selectedMonth - Selected month name
 * @returns {Array} Filtered reviews
 */
export const filterReviewsByMonth = (reviews, selectedMonth) => {
  if (!selectedMonth || selectedMonth === '') {
    return reviews;
  }

  const monthIndex = MONTHS_FULL.indexOf(selectedMonth);
  if (monthIndex === -1) {
    return reviews;
  }

  return reviews.filter((review) => {
    if (!review.createdAt) return true;
    const reviewDate = new Date(review.createdAt);
    return reviewDate.getMonth() === monthIndex;
  });
};

/**
 * Filter reviews by search term
 * @param {Array} reviews - Array of reviews
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered reviews
 */
export const filterReviewsBySearch = (reviews, searchTerm) => {
  if (!searchTerm) {
    return reviews;
  }

  const term = searchTerm.toLowerCase();
  return reviews.filter(
    (review) =>
      review.customerName?.toLowerCase().includes(term) ||
      review.propertyId?.name?.toLowerCase().includes(term) ||
      review.propertyId?.address?.toLowerCase().includes(term) ||
      review.comment?.toLowerCase().includes(term)
  );
};

/**
 * Apply all filters to reviews
 * @param {Array} reviews - Array of reviews
 * @param {Object} filters - Filter options
 * @param {string} filters.searchTerm - Search term
 * @param {string} filters.month - Selected month
 * @returns {Array} Filtered reviews
 */
export const applyReviewFilters = (reviews, filters = {}) => {
  let filtered = Array.isArray(reviews) ? reviews : [];

  // Apply month filter
  if (filters.month) {
    filtered = filterReviewsByMonth(filtered, filters.month);
  }

  // Apply search filter
  if (filters.searchTerm) {
    filtered = filterReviewsBySearch(filtered, filters.searchTerm);
  }

  return filtered;
};

/**
 * Calculate pagination data
 * @param {Array} items - Array of items to paginate
 * @param {number} currentPage - Current page number
 * @param {number} itemsPerPage - Items per page
 * @returns {Object} Pagination data
 */
export const calculatePagination = (items, currentPage, itemsPerPage) => {
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
 * @returns {boolean} True if all items are selected
 */
export const areAllItemsSelected = (currentItems, checkedRows) => {
  if (currentItems.length === 0) return false;
  return currentItems.every((item) => checkedRows[item._id]);
};

/**
 * Toggle all items selection
 * @param {Array} currentItems - Current page items
 * @param {boolean} selectAll - Current select all state
 * @returns {Object} Updated checked rows object
 */
export const toggleAllItems = (currentItems, selectAll) => {
  const updated = {};
  currentItems.forEach((item) => {
    updated[item._id] = !selectAll;
  });
  return updated;
};

/**
 * Toggle single item selection
 * @param {Object} checkedRows - Current checked rows object
 * @param {string} id - Item ID to toggle
 * @param {Array} currentItems - Current page items
 * @returns {Object} Object with updated checkedRows and selectAll state
 */
export const toggleSingleItem = (checkedRows, id, currentItems) => {
  const newChecked = { ...checkedRows, [id]: !checkedRows[id] };
  const allSelected = areAllItemsSelected(currentItems, newChecked);
  
  return {
    checkedRows: newChecked,
    selectAll: allSelected
  };
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatReviewDate = (date) => {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString();
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Get review status display text
 * @param {string} status - Review status
 * @returns {string} Display status
 */
export const getReviewStatus = (status) => {
  if (!status) return 'Published';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

/**
 * Validate review rating
 * @param {number} rating - Rating value
 * @returns {number} Valid rating between 0 and 5
 */
export const validateRating = (rating) => {
  const numRating = Number(rating);
  if (isNaN(numRating)) return 0;
  if (numRating < 0) return 0;
  if (numRating > 5) return 5;
  return numRating;
};