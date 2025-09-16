import React from 'react';

const SalesLocation = () => {
  return (
    <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="card-title">Most Sales Location</h3>
            <div className="filter-dropdown">Asia▼</div>
        </div>
        <img
          src="/assets/world-map.png"
          alt="World Map Sales Location"
          className="sales-location-map"
        />
    </div>
  );
};

export default SalesLocation;