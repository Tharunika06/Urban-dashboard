// src/utils/chartUtils.js
import React from 'react';

/**
 * Calculate Y-axis domain with padding for line charts
 * @param {Array} data - Array of data objects
 * @param {string} dataKey - Key to extract values from data objects
 * @param {number} paddingPercent - Padding percentage (default 0.1 = 10%)
 * @returns {Array} [min, max] domain values
 */
export const getYAxisDomain = (data, dataKey = 'earnings', paddingPercent = 0.1) => {
  if (!data || !data.length) return [0, 100];
  
  const values = data.map(d => d[dataKey] || 0);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  
  const padding = (maxValue - minValue) * paddingPercent || maxValue * paddingPercent || 10;
  
  return [
    Math.max(0, minValue - padding),
    maxValue + padding
  ];
};

/**
 * Calculate padded maximum for bar charts
 * @param {Array} data - Array of data objects
 * @param {string} dataKey - Key to extract values from data objects
 * @param {number} paddingPercent - Padding percentage (default 0.2 = 20%)
 * @returns {number} Padded maximum value
 */
export const getPaddedMaxValue = (data, dataKey = 'sales', paddingPercent = 0.2) => {
  if (!data || !data.length) return 10;
  
  const maxCount = Math.max(...data.map(d => Number(d[dataKey] || 0)), 1);
  return Math.ceil(maxCount * (1 + paddingPercent));
};

/**
 * Format data for pie charts with buyers/remaining split
 * @param {number} totalValue - Total value to split
 * @param {number} buyersPercent - Percentage for buyers (default 0.75 = 75%)
 * @returns {Array} Chart data array
 */
export const formatPieChartData = (totalValue, buyersPercent = 0.75) => {
  const hasData = totalValue > 0;
  
  if (!hasData) {
    return [{ name: "No Data", value: 100 }];
  }
  
  return [
    { name: "Buyers", value: buyersPercent * totalValue },
    { name: "Remaining", value: (1 - buyersPercent) * totalValue },
  ];
};

/**
 * Custom dot renderer for line charts with highlight support
 * @param {string} selectedMonth - Currently selected month
 * @param {Function} toFullMonthName - Function to convert month abbreviation to full name
 * @param {string} highlightColor - Color for highlighted dot
 * @param {string} defaultColor - Default dot color
 * @param {string} allMonthsValue - Value representing "all months"
 * @returns {Function} Dot renderer function
 */
export const createCustomDotRenderer = (
  selectedMonth,
  toFullMonthName,
  highlightColor = '#FF6B6B',
  defaultColor = 'var(--chart-line-1)',
  allMonthsValue = 'All'
) => {
  return (props) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined) return null;

    const sel = selectedMonth && String(selectedMonth).toLowerCase();
    const payloadName = String(payload?.name || "").trim().toLowerCase();

    const selFull = toFullMonthName(selectedMonth);
    const selCompare = selFull ? selFull.toLowerCase() : sel;

    const isHighlighted = 
      selectedMonth && 
      selectedMonth !== allMonthsValue && 
      payloadName === selCompare;

    if (isHighlighted) {
      return React.createElement('circle', {
        cx: cx,
        cy: cy,
        r: 7,
        stroke: highlightColor,
        strokeWidth: 2.5,
        fill: '#fff'
      });
    }

    return React.createElement('circle', {
      cx: cx,
      cy: cy,
      r: 4,
      stroke: defaultColor,
      strokeWidth: 2,
      fill: '#fff'
    });
  };
};

/**
 * Calculate total from data array
 * @param {Array} data - Array of data objects
 * @param {string} valueKey - Key to sum from data objects
 * @returns {number} Total sum
 */
export const calculateTotal = (data, valueKey = 'earnings') => {
  if (!data || !data.length) return 0;
  return data.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0);
};

/**
 * Get data for specific month
 * @param {Array} data - Array of data objects
 * @param {string} month - Month to filter by
 * @param {Function} toFullMonthName - Function to convert month abbreviation
 * @param {string} nameKey - Key for month name in data objects
 * @returns {Object|null} Data object for the month or null
 */
export const getMonthData = (data, month, toFullMonthName, nameKey = 'name') => {
  if (!data || !month) return null;
  
  const monthFull = toFullMonthName(month);
  
  if (monthFull) {
    return data.find(d => 
      String(d[nameKey]).toLowerCase() === monthFull.toLowerCase()
    );
  }
  
  const searchTerm = String(month).trim().toLowerCase();
  return data.find(d => 
    String(d[nameKey]).trim().toLowerCase() === searchTerm
  );
};

/**
 * Custom tooltip formatter for currency values
 * @param {number} value - Value to format
 * @param {string} label - Label for the value
 * @returns {Array} [formattedValue, label]
 */
export const currencyTooltipFormatter = (value, label = 'Earnings') => {
  return [`$${Number(value).toLocaleString()}`, label];
};

/**
 * Custom label formatter for tooltips
 * @param {string} label - Label to format
 * @param {string} prefix - Prefix to add (default 'Month: ')
 * @returns {string} Formatted label
 */
export const tooltipLabelFormatter = (label, prefix = 'Month: ') => {
  return `${prefix}${label}`;
};