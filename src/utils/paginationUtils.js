// src/utils/paginationUtils.js

/**
 * Calculate pagination details
 * @param {number} totalItems - Total number of items
 * @param {number} currentPage - Current page number (1-indexed)
 * @param {number} itemsPerPage - Number of items per page
 * @returns {Object} Pagination details
 */
export const calculatePagination = (totalItems, currentPage, itemsPerPage) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  return {
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages
  };
};

/**
 * Get paginated items from array
 * @param {Array} items - Array of items to paginate
 * @param {number} currentPage - Current page number (1-indexed)
 * @param {number} itemsPerPage - Number of items per page
 * @returns {Array} Paginated items
 */
export const getPaginatedItems = (items, currentPage, itemsPerPage) => {
  if (!items || !items.length) return [];
  
  const { startIndex, endIndex } = calculatePagination(items.length, currentPage, itemsPerPage);
  return items.slice(startIndex, endIndex);
};

/**
 * Generate page numbers array for pagination UI
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @param {number} maxVisible - Maximum number of page buttons to show
 * @returns {Array} Array of page numbers to display
 */
export const generatePageNumbers = (currentPage, totalPages, maxVisible = 5) => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const halfVisible = Math.floor(maxVisible / 2);
  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  // Adjust start if we're near the end
  if (endPage === totalPages) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );
};

/**
 * Validate and normalize page number
 * @param {number} page - Page number to validate
 * @param {number} totalPages - Total number of pages
 * @returns {number} Valid page number
 */
export const validatePageNumber = (page, totalPages) => {
  const pageNum = parseInt(page, 10);
  
  if (isNaN(pageNum) || pageNum < 1) return 1;
  if (pageNum > totalPages) return totalPages;
  
  return pageNum;
};

/**
 * Get pagination info text (e.g., "Showing 1-10 of 50")
 * @param {number} startIndex - Start index (0-based)
 * @param {number} endIndex - End index (0-based)
 * @param {number} totalItems - Total number of items
 * @returns {string} Pagination info text
 */
export const getPaginationInfo = (startIndex, endIndex, totalItems) => {
  if (totalItems === 0) return 'No items to display';
  
  const displayStart = startIndex + 1;
  const displayEnd = endIndex;
  
  return `Showing ${displayStart}-${displayEnd} of ${totalItems}`;
};

/**
 * Calculate optimal items per page based on screen size
 * @param {number} screenHeight - Screen height in pixels
 * @param {number} itemHeight - Average item height in pixels
 * @param {number} reservedSpace - Reserved space for headers/footers
 * @returns {number} Optimal items per page
 */
export const calculateOptimalItemsPerPage = (
  screenHeight = window.innerHeight,
  itemHeight = 60,
  reservedSpace = 300
) => {
  const availableSpace = screenHeight - reservedSpace;
  const itemsPerPage = Math.floor(availableSpace / itemHeight);
  
  // Ensure minimum of 5 items per page
  return Math.max(5, itemsPerPage);
};