// src/utils/dataUtils.js

/**
 * Calculate total value from object of month data
 * @param {Object} data - Object with month keys and count values
 * @param {string} selectedMonth - Selected month or 'All'
 * @param {string} allMonthsValue - Value representing all months
 * @returns {number} Total value
 */
export const calculateMonthlyTotal = (data, selectedMonth, allMonthsValue = 'All') => {
  if (!data || typeof data !== 'object') return 0;
  
  if (selectedMonth === allMonthsValue) {
    return Object.values(data).reduce((sum, count) => sum + (Number(count) || 0), 0);
  }
  
  return Number(data[selectedMonth]) || 0;
};

/**
 * Format sales data from API response
 * @param {Array} rawData - Raw data from API
 * @param {Function} monthConverter - Function to convert month names
 * @returns {Array} Formatted data array
 */
export const formatSalesData = (rawData, monthConverter) => {
  if (!Array.isArray(rawData)) return [];
  
  const formattedData = rawData.map((item) => {
    let name = item.month;
    const full = monthConverter(name);
    if (full) name = full;
    name = String(name).trim();

    const earnings = parseFloat(item.earnings) || 0;
    return { name, earnings };
  });

  return formattedData.filter(item => 
    item.name && !isNaN(item.earnings)
  );
};

/**
 * Format weekly sales data from API response
 * @param {Array|Object} data - Raw data from API
 * @returns {Array} Formatted weekly data
 */
export const formatWeeklySalesData = (data) => {
  if (!data) return [];
  
  if (Array.isArray(data)) {
    return data;
  }
  
  // Convert object to array format
  return Object.entries(data).map(([day, sales]) => ({
    day: day.charAt(0), // First letter of day
    sales: Number(sales) || 0,
  }));
};

/**
 * Validate and sanitize data array
 * @param {Array} data - Data to validate
 * @param {Array} requiredKeys - Required keys in each object
 * @returns {Array} Validated data array
 */
export const validateDataArray = (data, requiredKeys = []) => {
  if (!Array.isArray(data)) return [];
  
  return data.filter(item => {
    if (!item || typeof item !== 'object') return false;
    
    if (requiredKeys.length === 0) return true;
    
    return requiredKeys.every(key => key in item);
  });
};

/**
 * Get fallback data for weekly sales
 * @returns {Array} Fallback weekly data
 */
export const getWeeklySalesFallback = () => {
  return [
    { day: "S", sales: 4 },
    { day: "M", sales: 6 },
    { day: "T", sales: 3 },
    { day: "W", sales: 2 },
    { day: "T", sales: 5 },
    { day: "F", sales: 7 },
    { day: "S", sales: 3 },
  ];
};

/**
 * Safe number parsing with default value
 * @param {any} value - Value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed number or default
 */
export const safeParseNumber = (value, defaultValue = 0) => {
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Calculate percentage change between two values
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};