import React, { useState, useEffect } from 'react';
import '../../styles/MonthlyDropdown.css';

const months = [
  'All',
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];

const MonthDropdown = ({ onChange }) => {
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Default: "All"
    if (onChange) onChange('All');
  }, []);

  const handleSelectMonth = (month) => {
    setSelectedMonth(month);
    setShowDropdown(false);
    if (onChange) onChange(month);
  };

  const displayText =
    selectedMonth === 'All'
      ? 'All'
      : selectedMonth === months[new Date().getMonth() + 1] // +1 because "All" is at index 0
      ? 'This Month'
      : selectedMonth;

  return (
    <div className="month-dropdown-wrapper" style={{ position: 'relative' }}>
      <div
        className="filter-dropdown"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {displayText} ▼
      </div>
      {showDropdown && (
        <div className="month-dropdown-list">
          {months.map((month, index) => (
            <div
              key={month}
              className="month-dropdown-item"
              onClick={() => handleSelectMonth(month)}
            >
              {month}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonthDropdown;
