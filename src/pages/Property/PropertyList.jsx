// src/pages/Property/PropertyList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PopupMessage from '../../components/common/PopupMessage';
import Checkbox from '../../components/common/Checkbox';
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

const PropertyList = ({ properties, handleDelete, handleBulkDelete }) => {
  const [selectAll, setSelectAll] = useState(false);
  const [checkedRows, setCheckedRows] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = properties.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset checkboxes when page changes or properties change
  useEffect(() => {
    setSelectAll(false);
    setCheckedRows({});
  }, [currentPage, properties]);

  const handleSelectAll = () => {
    const updated = {};
    currentItems.forEach((p) => {
      updated[p._id] = !selectAll;
    });
    setCheckedRows(updated);
    setSelectAll(!selectAll);
  };

  const toggleCheckbox = (id) => {
    setCheckedRows((prev) => {
      const newChecked = { ...prev, [id]: !prev[id] };
      
      // Check if all current page items are selected
      const allSelected = currentItems.every(
        p => newChecked[p._id]
      );
      setSelectAll(allSelected);
      
      return newChecked;
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectAll(false);
    setCheckedRows({});
  };

  const handleDeleteClick = (id) => {
    setPropertyToDelete(id);
    setShowPopup(true);
  };

  const confirmDelete = () => {
    if (propertyToDelete) {
      handleDelete(propertyToDelete);
    }
    setShowPopup(false);
    setPropertyToDelete(null);
  };

  const cancelDelete = () => {
    setShowPopup(false);
    setPropertyToDelete(null);
  };

  // Get selected property IDs
  const getSelectedIds = () => {
    return Object.keys(checkedRows).filter(id => checkedRows[id]);
  };

  const selectedCount = getSelectedIds().length;

  const handleBulkDeleteClick = () => {
    const selectedIds = getSelectedIds();
    if (selectedIds.length > 0) {
      handleBulkDelete(selectedIds);
    }
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

  // Function to get the correct image source
  const getImageSrc = (photo) => {
    // If photo exists and is a base64 data URL, use it directly
    if (photo && photo.startsWith('data:image/')) {
      return photo;
    }
    
    // If photo is a file path (for backward compatibility)
    if (photo && photo.startsWith('/uploads/')) {
      return `http://192.168.0.154:5000${photo}`;
    }
    
    // Fallback to placeholder image
    return '/assets/placeholder.png';
  };

  // Function to handle image loading errors
  const handleImageError = (e) => {
    e.target.src = '/assets/placeholder.png';
    console.warn('Failed to load property image');
  };

  return (
    <>
      {selectedCount > 0 && (
        <div className="bulk-actions-bar">
          <span className="selected-count">{selectedCount} selected</span>
          <button 
            className="bulk-delete-btn"
            onClick={handleBulkDeleteClick}
          >
            Delete Selected
          </button>
        </div>
      )}

      <div className="table-container">
        <table className="property-table">
          <thead>
            <tr>
              <th>
                <Checkbox 
                  checked={selectAll} 
                  onChange={handleSelectAll}
                  id="select-all-checkbox"
                />
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
                  <Checkbox
                    checked={checkedRows[prop._id] || false}
                    onChange={() => toggleCheckbox(prop._id)}
                    id={`checkbox-${prop._id}`}
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
                    onClick={() => handleDeleteClick(prop._id)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* <img src="/assets/edit-icon.png" alt="Edit" /> */}
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

      {/* Popup Confirmation */}
      {showPopup && (
        <PopupMessage 
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </>
  );
};

export default PropertyList;