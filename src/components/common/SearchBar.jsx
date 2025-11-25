// src/components/common/SearchBar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { ASSET_PATHS, PLACEHOLDERS } from '../../utils/constants';
import '../../styles/SearchBar.css';

const SearchBar = ({ 
  data = [],
  onFilteredResults,
  searchFields = ['name', 'id'],
  placeholder = PLACEHOLDERS.SEARCH,
  className = '',
  width = '100%',
  debounceMs = 300,
  // Support for controlled component pattern
  value,
  onChange
}) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  
  // Use controlled value if provided, otherwise use internal state
  const searchTerm = value !== undefined ? value : internalSearchTerm;
  const setSearchTerm = onChange !== undefined ? onChange : setInternalSearchTerm;

  const filterData = useCallback((term) => {
    if (!term.trim()) {
      return data;
    }
    const lowerTerm = term.toLowerCase();
    
    return data.filter(item => {
      return searchFields.some(field => {
        const value = getNestedValue(item, field);
        if (value == null) return false;
        return String(value).toLowerCase().includes(lowerTerm);
      });
    });
  }, [data, searchFields]);

  useEffect(() => {
    // Only filter if we have onFilteredResults callback and data prop is provided
    if (onFilteredResults && data.length >= 0) {
      const timeoutId = setTimeout(() => {
        const filtered = filterData(searchTerm);
        onFilteredResults(filtered, searchTerm);
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, filterData, onFilteredResults, debounceMs, data.length]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (onChange) {
      // Controlled component - call parent onChange
      onChange(e);
    } else {
      // Uncontrolled component - update internal state
      setInternalSearchTerm(newValue);
    }
  };

  const handleClear = () => {
    if (onChange) {
      // Controlled component - create synthetic event
      onChange({ target: { value: '' } });
    } else {
      // Uncontrolled component
      setInternalSearchTerm('');
    }
  };

  return (
    <div 
      className={`search-bar ${className}`}
    >
      <img src={ASSET_PATHS.SEARCH_ICON} alt="search" className="search-icon" />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
        className="search-input"
      />
      {searchTerm && (
        <button 
          onClick={handleClear}
          className="search-clear-btn"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
};

const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

export default SearchBar;