// src/pages/Property/PropertyGrid.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Property.css';

// ✅ Status Badge
const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'rent':
      return 'for-rent';
    case 'sale':
      return 'for-sale';
    case 'sold':
      return 'sold';
    case 'both':
      return 'for-both';
    default:
      return '';
  }
};

// ✅ Price Formatter
const formatPriceForGrid = (prop) => {
  if (!prop) return 'N/A';
  const status = prop.status?.toLowerCase();

  if (status === 'both' && prop.rentPrice && prop.salePrice) {
    return (
      <div className="grid-price-dual">
        <span className="grid-price-rent">
          Rent: ${Number(prop.rentPrice).toLocaleString()} /mo
        </span><br />
        <span className="grid-price-sale">
          Sale: ${Number(prop.salePrice).toLocaleString()}
        </span>
      </div>
    );
  }

  if (status === 'rent' && prop.rentPrice) {
    return `$${Number(prop.rentPrice).toLocaleString()} /mo`;
  }

  if (status === 'sale' && prop.salePrice) {
    return `$${Number(prop.salePrice).toLocaleString()}`;
  }

  if (prop.price) {
    return `$${Number(prop.price).toLocaleString()}`;
  }

  return 'N/A';
};

// ✅ Handle Image Sources (same as PropertyList)
const getImageSrc = (photo) => {
  if (photo && photo.startsWith('data:image/')) {
    return photo;
  }
  if (photo && photo.startsWith('/uploads/')) {
    return `http://192.168.0.152:5000${photo}`;
  }
  return '/assets/placeholder-property.png';
};

// ✅ Fallback Image Handler
const handleImageError = (e) => {
  e.target.src = '/assets/placeholder-property.png';
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
              <span className={`badge ${getStatusClass(prop.status)}`}>
                {prop.status === 'rent'
                  ? 'For Rent'
                  : prop.status === 'sale'
                  ? 'For Sale'
                  : prop.status === 'both'
                  ? 'For Rent & Sale'
                  : prop.status || 'Unknown'}
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
                {prop.floors || '1'} Floor
              </div>
            </div>

            {/* Price + View More */}
            <div className="property-footer">
              <div className="property-price">
                {formatPriceForGrid(prop)}
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
