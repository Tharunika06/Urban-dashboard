// src/pages/Property/PropertyList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Checkbox from '../../components/common/Checkbox';
import '../../styles/Property.css';

// ✅ UPDATED: Added 'sold' status class
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

const ITEMS_PER_PAGE = 6;

const PropertyList = ({ properties, handleDelete, handleBulkDelete }) => {
  const [selectAll, setSelectAll] = useState(false);
  const [checkedRows, setCheckedRows] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

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
      const allSelected = currentItems.every((p) => newChecked[p._id]);
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
    handleDelete(id);
  };

  // Get selected property IDs
  const getSelectedIds = () => {
    return Object.keys(checkedRows).filter((id) => checkedRows[id]);
  };

  const selectedCount = getSelectedIds().length;

  const handleBulkDeleteClick = () => {
    const selectedIds = getSelectedIds();
    if (selectedIds.length > 0) {
      handleBulkDelete(selectedIds);
    }
  };

  // ✅ UPDATED: Format price based on status (including 'sold')
  const formatPrice = (prop) => {
    const status = prop.status?.toLowerCase();

    // If property is sold, show "SOLD" instead of price
    if (status === 'sold') {
      return (
        <span className="sold-badge-inline" style={{ 
          color: '#ef4444', 
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          SOLD
        </span>
      );
    }

    if (status === 'both' && prop.rentPrice && prop.salePrice) {
      return (
        <div className="price-dual">
          <span className="price-rent">{`Rent: $${Number(prop.rentPrice).toLocaleString()} /mo`}</span>
          <br />
          <span className="price-sale">{`Sale: $${Number(prop.salePrice).toLocaleString()}`}</span>
        </div>
      );
    }

    if (status === 'rent' && prop.rentPrice) {
      return `$${Number(prop.rentPrice).toLocaleString()} /month`;
    } else if (status === 'sale' && prop.salePrice) {
      return `$${Number(prop.salePrice).toLocaleString()}`;
    } else if (prop.price) {
      return `$${Number(prop.price).toLocaleString()}`;
    } else {
      return 'N/A';
    }
  };

  const getImageSrc = (photo) => {
    if (photo && photo.startsWith('data:image/')) {
      return photo;
    }

    if (photo && photo.startsWith('/uploads/')) {
      return `http://192.168.1.45:5000${photo}`;
    }

    return '/assets/placeholder.png';
  };

  const handleImageError = (e) => {
    e.target.src = '/assets/placeholder.png';
    console.warn('Failed to load property image');
  };

  return (
    <>
      {selectedCount > 0 && (
        <div className="bulk-actions-bar">
          <span className="selected-count">{selectedCount} selected</span>
          <button className="bulk-delete-btn" onClick={handleBulkDeleteClick}>
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
              <th>Status</th>
              <th>Bedrooms</th>
              <th>Location</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((prop) => {
              // ✅ Check if property is sold
              const isSold = prop.status?.toLowerCase() === 'sold';
              
              return (
                <tr key={prop._id} className={isSold ? 'sold-row' : ''}>
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
                            marginRight: '10px',
                            // opacity: isSold ? 0.6 : 1
                          }}
                        />
                        <span >
                          {prop.name}
                          {/* {isSold && <span style={{ 
                            marginLeft: '8px', 
                            color: '#ef4444',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>● SOLD</span>} */}
                        </span>
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
                    <Link to={`/property/${prop._id}`}>{prop.size || 'N/A'}sq ft</Link>
                  </td>

                  <td>
                    <Link to={`/property/${prop._id}`}>{prop.type || 'N/A'}</Link>
                  </td>

                  <td>
                    <Link to={`/property/${prop._id}`}>
                      <span className={`status-badge ${getStatusClass(prop.status)}`}>
                        {prop.status?.toUpperCase() || 'N/A'}
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
                  </td>
                </tr>
              );
            })}
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