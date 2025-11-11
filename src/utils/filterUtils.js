// src/utils/filterUtils.js

/**
 * Filter transactions by month
 * @param {Array} transactions - Array of transaction objects
 * @param {string} monthName - Full month name (e.g., "January")
 * @param {Array} monthsArray - Array of month names to get index
 * @returns {Array} Filtered transactions
 */
export const filterByMonth = (transactions, monthName, monthsArray) => {
  if (!monthName || !transactions || !transactions.length) {
    return transactions;
  }

  const monthIndex = monthsArray.indexOf(monthName);
  
  if (monthIndex === -1) {
    return transactions;
  }

  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.createdAt);
    return transactionDate.getMonth() === monthIndex;
  });
};

/**
 * Filter transactions by search term
 * @param {Array} transactions - Array of transaction objects
 * @param {string} searchTerm - Search term to filter by
 * @returns {Array} Filtered transactions
 */
export const filterBySearchTerm = (transactions, searchTerm) => {
  if (!searchTerm || !transactions || !transactions.length) {
    return transactions;
  }

  const term = searchTerm.toLowerCase().trim();

  return transactions.filter(transaction => {
    const customerName = transaction.customerName?.toLowerCase() || '';
    const propertyName = transaction.property?.name?.toLowerCase() || '';
    const status = transaction.status?.toLowerCase() || '';
    const phone = transaction.customerPhone || '';

    return (
      customerName.includes(term) ||
      propertyName.includes(term) ||
      status.includes(term) ||
      phone.includes(term)
    );
  });
};

/**
 * Apply multiple filters to transactions
 * @param {Array} transactions - Array of transaction objects
 * @param {Object} filters - Filter configuration object
 * @param {string} filters.searchTerm - Search term
 * @param {string} filters.month - Month name
 * @param {Array} filters.monthsArray - Array of month names
 * @returns {Array} Filtered transactions
 */
export const applyFilters = (transactions, filters) => {
  let results = transactions;

  // Apply month filter
  if (filters.month) {
    results = filterByMonth(results, filters.month, filters.monthsArray);
  }

  // Apply search filter
  if (filters.searchTerm) {
    results = filterBySearchTerm(results, filters.searchTerm);
  }

  return results;
};

/**
 * Filter array by multiple properties
 * @param {Array} array - Array to filter
 * @param {string} searchTerm - Search term
 * @param {Array} searchProperties - Array of property names to search in
 * @returns {Array} Filtered array
 */
export const searchMultipleProperties = (array, searchTerm, searchProperties) => {
  if (!searchTerm || !array || !array.length) {
    return array;
  }

  const term = searchTerm.toLowerCase().trim();

  return array.filter(item => {
    return searchProperties.some(prop => {
      const value = getNestedProperty(item, prop);
      return value && String(value).toLowerCase().includes(term);
    });
  });
};

/**
 * Get nested property value from object
 * @param {Object} obj - Object to get property from
 * @param {string} path - Property path (e.g., "property.name")
 * @returns {any} Property value or undefined
 */
const getNestedProperty = (obj, path) => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
};

/**
 * Filter by date range
 * @param {Array} items - Array of items with date property
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} dateProperty - Property name containing the date
 * @returns {Array} Filtered items
 */
export const filterByDateRange = (items, startDate, endDate, dateProperty = 'createdAt') => {
  if (!items || !items.length || (!startDate && !endDate)) {
    return items;
  }

  return items.filter(item => {
    const itemDate = new Date(item[dateProperty]);
    
    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    
    return true;
  });
};

/**
 * Filter by status
 * @param {Array} items - Array of items
 * @param {string|Array} status - Status or array of statuses to filter by
 * @param {string} statusProperty - Property name containing status
 * @returns {Array} Filtered items
 */
export const filterByStatus = (items, status, statusProperty = 'status') => {
  if (!items || !items.length || !status) {
    return items;
  }

  const statuses = Array.isArray(status) ? status : [status];
  const normalizedStatuses = statuses.map(s => s.toLowerCase());

  return items.filter(item => {
    const itemStatus = item[statusProperty]?.toLowerCase() || '';
    return normalizedStatuses.includes(itemStatus);
  });
};