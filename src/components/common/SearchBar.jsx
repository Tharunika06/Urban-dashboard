// src/components/common/SearchBar.jsx
import React from 'react';
import { ASSET_PATHS, PLACEHOLDERS } from '../../utils/constants';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = PLACEHOLDERS.SEARCH,
  className = '',
  width = '100%'
}) => {
  return (
    <div 
      className={`search-bar ${className}`}
      style={{ width }}
    >
      <img src={ASSET_PATHS.SEARCH_ICON} alt="search" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchBar;