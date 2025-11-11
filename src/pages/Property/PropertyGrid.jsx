// src/pages/Property/PropertyGrid.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  getStatusClass,
  formatPrice,
  getPropertyImageSrc,
  handlePropertyImageError,
} from '../../utils/propertyHelpers';
import '../../styles/Property.css';

const PropertyGrid = ({ properties }) => {
  return (
    <div className="property-grid">
      {properties.map((prop) => (
        <div key={prop._id} className="property-card">
          {/* Image */}
          <div className="property-card-image">
            <img
              src={getPropertyImageSrc(prop.photo)}
              alt={prop.name || 'Property'}
              className="property-image"
              onError={handlePropertyImageError}
            />
          </div>

          {/* Info Section */}
          <div className="property-card-info">
            <div className="property-header">
              <div className="icon-title">
                <img
                  src="/assets/home-icon.png"
                  alt="icon"
                  style={{ width: '40px', marginRight: '8px', height: '40px' }}
                />
                <div>
                  <h4 className="property-title">{prop.name}</h4>
                  <p className="property-address">{prop.address || 'N/A'}</p>
                </div>
              </div>
              {/* Status Badge */}
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
                {prop.size || 'N/A'}sq ft
              </div>
              <div className="stat-item">
                <img src="/assets/floor-icon.png" alt="floor" />
                {prop.floor || '1'} Floor
              </div>
            </div>

            {/* Price + View More */}
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