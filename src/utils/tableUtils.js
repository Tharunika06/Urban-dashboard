// src/utils/tableUtils.js

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default '₹')
 * @param {string} locale - Locale for formatting (default 'en-IN')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = '₹', locale = 'en-IN') => {
  if (amount === null || amount === undefined) return 'N/A';
  
  const formatted = Number(amount).toLocaleString(locale);
  return `${currency}${formatted}`;
};

/**
 * Format date for table display
 * @param {Date|string} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatTableDate = (date, options = {}) => {
  if (!date) return 'N/A';
  
  try {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return new Date(date).toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @param {string} format - Format pattern (default: 'xxx-xxx-xxxx')
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone, format = 'xxx-xxx-xxxx') => {
  if (!phone) return 'N/A';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }
  
  return phone;
};

/**
 * Get value from nested object property
 * @param {Object} obj - Object to get value from
 * @param {string} path - Property path (e.g., 'property.name')
 * @param {any} defaultValue - Default value if property not found
 * @returns {any} Property value or default
 */
export const getNestedValue = (obj, path, defaultValue = 'N/A') => {
  if (!obj || !path) return defaultValue;
  
  const value = path.split('.').reduce((current, prop) => current?.[prop], obj);
  return value !== undefined && value !== null ? value : defaultValue;
};

/**
 * Sort table data by column
 * @param {Array} data - Array of objects to sort
 * @param {string} column - Column property to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export const sortTableData = (data, column, direction = 'asc') => {
  if (!data || !data.length) return data;
  
  const sorted = [...data].sort((a, b) => {
    const aVal = getNestedValue(a, column, '');
    const bVal = getNestedValue(b, column, '');
    
    // Handle numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    // Handle dates
    if (aVal instanceof Date && bVal instanceof Date) {
      return direction === 'asc' 
        ? aVal.getTime() - bVal.getTime() 
        : bVal.getTime() - aVal.getTime();
    }
    
    // Handle strings
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    
    if (direction === 'asc') {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });
  
  return sorted;
};

/**
 * Generate table cell content based on column type
 * @param {any} value - Cell value
 * @param {string} type - Cell type ('currency', 'date', 'phone', 'text')
 * @param {Object} options - Formatting options
 * @returns {string} Formatted cell content
 */
export const formatTableCell = (value, type = 'text', options = {}) => {
  switch (type) {
    case 'currency':
      return formatCurrency(value, options.currency, options.locale);
    case 'date':
      return formatTableDate(value, options.dateOptions);
    case 'phone':
      return formatPhoneNumber(value, options.format);
    case 'text':
    default:
      return value !== null && value !== undefined ? String(value) : 'N/A';
  }
};

/**
 * Export table data to CSV
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Array of column definitions
 * @param {string} filename - Output filename
 */
export const exportToCSV = (data, columns, filename = 'export.csv') => {
  if (!data || !data.length) return;
  
  // Create header row
  const headers = columns.map(col => col.label || col.key).join(',');
  
  // Create data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = getNestedValue(item, col.key, '');
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    }).join(',');
  });
  
  // Combine and create blob
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  
  URL.revokeObjectURL(link.href);
};

/**
 * Validate table row data
 * @param {Object} row - Row data object
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export const validateTableRow = (row, requiredFields = []) => {
  const errors = [];
  
  requiredFields.forEach(field => {
    const value = getNestedValue(row, field, null);
    if (value === null || value === undefined || value === '') {
      errors.push(`${field} is required`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};