// src/pages/Property/PropertyGrid.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Property.css';

// ✅ Status Badge - UPDATED to match PropertyList
const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'rent':
      return 'status-rent';
    case 'sale':
      return 'status-sale';
    case 'both':
      return 'status-both';
    case 'sold':
      return 'status-sold';
    default:
      return '';
  }
};

// ✅ Price Formatter - UPDATED to match PropertyList exactly
const formatPrice = (prop) => {
  const status = prop.status?.toLowerCase();
  
  // Priority 1: Handle properties available for both rent and sale
  if (status === 'both' && prop.rentPrice && prop.salePrice) {
    return (
      <div className="price-dual">
        <span className="price-rent">{`Rent: $${Number(prop.rentPrice).toLocaleString()} /mo`}</span>
        <br />
        <span className="price-sale">{`Sale: $${Number(prop.salePrice).toLocaleString()}`}</span>
      </div>
    );
  }

  // Priority 2: Handle rent-only properties
  if (status === 'rent' && prop.rentPrice) {
    return `$${Number(prop.rentPrice).toLocaleString()} /month`;
  } 
  
  // Priority 3: Handle sale-only properties
  else if (status === 'sale' && prop.salePrice) {
    return `$${Number(prop.salePrice).toLocaleString()}`;
  } 
  
  // Priority 4: Fallback for older data with a generic 'price'
  else if (prop.price) {
    return `$${Number(prop.price).toLocaleString()}`;
  } 
  
  // Final fallback
  else {
    return 'N/A';
  }
};

// ✅ Handle Image Sources
const getImageSrc = (photo) => {
  if (photo && photo.startsWith('data:image/')) {
    return photo;
  }
  if (photo && photo.startsWith('/uploads/')) {
    return `http://192.168.0.154:5000${photo}`;
  }
  return '/assets/placeholder.png';
};

// ✅ Fallback Image Handler
const handleImageError = (e) => {
  e.target.src = '/assets/placeholder.png';
  console.warn('Failed to load property image');
};

const PropertyGrid = ({ properties }) => {
  return (
    <div className="property-grid">
      {properties.map((prop) => (
        <div key={prop._id} className="property-card">
          {/* Image */}
          <div className="property-card-image">
            <img
              src={getImageSrc(prop.photo)}
              alt={prop.name || 'Property'}
              className="property-image"
              onError={handleImageError}
            />
          </div>

          {/* Info Section */}
          <div className="property-card-info">
            <div className="property-header">
              <div className="icon-title">
                <img
                  src="/assets/home-icon.png"
                  alt="icon"
                  style={{ width: '50px', marginRight: '8px', height: '50px' }}
                />
                <div>
                  <h4 className="property-title">{prop.name}</h4>
                  <p className="property-address">{prop.address || 'N/A'}</p>
                </div>
              </div>
              {/* Status Badge - Now matches PropertyList styling */}
              <span className={`status-badge ${getStatusClass(prop.status)}`}>
                {prop.status || 'N/A'}
              </span>
            </div>

            {/* Property Stats */}
            <div className="property-stats">
              <div className="stat-item">
                <img src="/assets/bed-icon.png" alt="bed" />
                {prop.bedrooms || 0} Bedroom
              </div>
              <div className="stat-item">
                <img src="/assets/bath-icon.png" alt="bath" />
                {prop.bath !== undefined ? prop.bath : 0} Bathroom
              </div>
              <div className="stat-item">
                <img src="/assets/size-icon.png" alt="area" />
                {prop.size || 'N/A'}
              </div>
              <div className="stat-item">
                <img src="/assets/floor-icon.png" alt="floor" />
                {prop.floor || '1'} Floor
              </div>
            </div>

            {/* Price + View More - Now displays dual prices like PropertyList */}
            <div className="property-footer">
              <div className="property-price">
                {formatPrice(prop)}
              </div>
              <Link to={`/property/${prop._id}`} className="view-more">
                View More →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropertyGrid;