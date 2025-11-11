// src/utils/dateUtils.js

/**
 * Get week label based on offset from current week
 * @param {number} offset - Number of weeks from current (0 = this week, -1 = last week, etc.)
 * @returns {string} Human-readable week label
 */
export const getWeekLabel = (offset) => {
  if (offset === 0) return "This Week";
  if (offset === -1) return "Last Week";
  if (offset === 1) return "Next Week";
  if (offset < -1) return `${Math.abs(offset)} Weeks Ago`;
  if (offset > 1) return `${offset} Weeks Ahead`;
  return "This Week";
};

/**
 * Get display text for selected time period
 * @param {string} period - Period identifier (e.g., 'All', 'January', etc.)
 * @param {string} allPeriodsValue - Value representing all periods (default 'All')
 * @returns {string} Display text
 */
export const getPeriodDisplayText = (period, allPeriodsValue = 'All') => {
  return period === allPeriodsValue ? "All Months" : period;
};

/**
 * Format date to display string
 * @param {Date|string|number} date - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
}) => {
  try {
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
};

/**
 * Get current week's date range
 * @returns {Object} { startDate, endDate }
 */
export const getCurrentWeekRange = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - dayOfWeek);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

/**
 * Get week range for a specific offset
 * @param {number} offset - Week offset from current week
 * @returns {Object} { startDate, endDate }
 */
export const getWeekRangeByOffset = (offset = 0) => {
  const { startDate, endDate } = getCurrentWeekRange();
  
  const offsetStartDate = new Date(startDate);
  offsetStartDate.setDate(startDate.getDate() + (offset * 7));
  
  const offsetEndDate = new Date(endDate);
  offsetEndDate.setDate(endDate.getDate() + (offset * 7));
  
  return { 
    startDate: offsetStartDate, 
    endDate: offsetEndDate 
  };
};

/**
 * Check if a date is in the current week
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} True if date is in current week
 */
export const isCurrentWeek = (date) => {
  const { startDate, endDate } = getCurrentWeekRange();
  const checkDate = new Date(date);
  
  return checkDate >= startDate && checkDate <= endDate;
};