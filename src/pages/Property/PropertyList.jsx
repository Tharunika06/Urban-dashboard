// src/pages/Property/PropertyList.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Property.css';

// UPDATED: Added a case for 'both' to handle dual-status properties
const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'rent':
      return 'status-rent';
    case 'sale':
      return 'status-sale';
    case 'both': // New class for properties available for both
      return 'status-both';
    case 'sold':
      return 'status-sold';
    default:
      return '';
  }
};

const ITEMS_PER_PAGE = 6;

const PropertyList = ({ properties, handleDelete }) => {
  const [selectAll, setSelectAll] = useState(false);
  const [checkedRows, setCheckedRows] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = properties.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSelectAll = () => {
    const updated = {};
    currentItems.forEach((p) => {
      updated[p._id] = !selectAll;
    });
    setCheckedRows(updated);
    setSelectAll(!selectAll);
  };

  const toggleCheckbox = (id) => {
    setCheckedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectAll(false);
    setCheckedRows({});
  };

  const formatPrice = (prop) => {
    const status = prop.status?.toLowerCase();
    
    // Priority 1: Handle properties available for both rent and sale
    if (status === 'both' && prop.rentPrice && prop.salePrice) {
      return (
        <div className="price-dual">
          <span className="price-rent">{`$Rent Price:${Number(prop.rentPrice).toLocaleString()} /mo`}</span><br></br>
          <span className="price-sale">{`$Sale Price:${Number(prop.salePrice).toLocaleString()}`}</span>
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

  // NEW: Function to get the correct image source
  const getImageSrc = (photo) => {
    // If photo exists and is a base64 data URL, use it directly
    if (photo && photo.startsWith('data:image/')) {
      return photo;
    }
    
    // If photo is a file path (for backward compatibility)
    if (photo && photo.startsWith('/uploads/')) {
      return `http://192.168.0.152:5000${photo}`;
    }
    
    // Fallback to placeholder image
    return '/assets/placeholder-property.png'; // Make sure you have this placeholder image
  };

  // NEW: Function to handle image loading errors
  const handleImageError = (e) => {
    e.target.src = '/assets/placeholder-property.png'; // Fallback image
    console.warn('Failed to load property image');
  };

  return (
    <>
      <div className="table-container">
        <table className="property-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
              </th>
              <th>Properties Photo & Name</th>
              <th>Owner</th>
              <th>Size</th>
              <th>Property Type</th>
              <th>Rent/Sale</th>
              <th>Bedrooms</th>
              <th>Location</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((prop) => (
              <tr key={prop._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={checkedRows[prop._id] || false}
                    onChange={() => toggleCheckbox(prop._id)}
                  />
                </td>

                <td>
                  <Link to={`/property/${prop._id}`}>
                    <div className="prop-name-cell">
                      <img
                        src={getImageSrc(prop.photo)}
                        alt={prop.name || 'Property'}
                        className="prop-photo"
                        onError={handleImageError}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          marginRight: '10px'
                        }}
                      />
                      <span>{prop.name}</span>
                    </div>
                  </Link>
                </td>

                <td>
                  {prop.ownerId && prop.ownerName ? (
                    <Link to={`/owners/${prop.ownerId}`} className="owner-link">
                      {prop.ownerName}
                    </Link>
                  ) : (
                    'N/A'
                  )}
                </td>

                <td>
                  <Link to={`/property/${prop._id}`}>{prop.size || 'N/A'}</Link>
                </td>

                <td>
                  <Link to={`/property/${prop._id}`}>{prop.type || 'N/A'}</Link>
                </td>

                <td>
                  <Link to={`/property/${prop._id}`}>
                    <span className={`status-badge ${getStatusClass(prop.status)}`}>
                      {prop.status || 'N/A'}
                    </span>
                  </Link>
                </td>

                <td>
                  <Link to={`/property/${prop._id}`}>{prop.bedrooms || 'N/A'}</Link>
                </td>

                <td>
                  <Link to={`/property/${prop._id}`}>{prop.city || prop.address || 'N/A'}</Link>
                </td>
                
                <td>
                  <Link to={`/property/${prop._id}`}>{formatPrice(prop)}</Link>
                </td>

                <td className="action-icons">
                  <Link to={`/property/${prop._id}`}>
                    <img src="/assets/view-icon.png" alt="View" />
                  </Link>
                  <img
                    src="/assets/delete-icon.png"
                    alt="Delete"
                    onClick={() => handleDelete(prop._id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <img src="/assets/edit-icon.png" alt="Edit" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          className="page-link"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          « Back
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`page-link ${currentPage === index + 1 ? 'active' : ''}`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          className="page-link"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next »
        </button>
      </div>
    </>
  );
};

export default PropertyList;