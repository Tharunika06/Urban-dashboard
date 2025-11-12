// src/pages/Property/PropertyList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Checkbox from '../../components/common/Checkbox';
import PopupMessage from '../../components/common/PopupMessage';
import { usePagination } from '../../hooks/usePagination';
import {
  ASSET_PATHS,
  UI_MESSAGES,
  BUTTON_LABELS,
} from '../../utils/constants';
import {
  getStatusClass,
  formatPrice,
  getPropertyImageSrc,
  handlePropertyImageError,
} from '../../utils/propertyHelpers';
import '../../styles/Property.css';

const ITEMS_PER_PAGE = 6;

const PropertyList = ({ properties, handleDelete, handleBulkDelete }) => {
  const [selectAll, setSelectAll] = useState(false);
  const [checkedRows, setCheckedRows] = useState({});
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showBulkDeletePopup, setShowBulkDeletePopup] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteMode, setDeleteMode] = useState('single');

  // Use pagination hook
  const {
    currentPage,
    totalPages,
    currentItems,
    handlePageChange,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage
  } = usePagination(properties, ITEMS_PER_PAGE);

  const tableHeaders = [
    { 
      label: <Checkbox
        checked={selectAll}
        onChange={handleSelectAll}
        id="select-all-checkbox"
      />,
      key: 'checkbox'
    },
    { label: 'Properties Photo & Name', key: 'propertyName' },
    { label: 'Owner', key: 'owner' },
    { label: 'Size', key: 'size' },
    { label: 'Property Type', key: 'propertyType' },
    { label: 'Status', key: 'status' },
    { label: 'Bedrooms', key: 'bedrooms' },
    { label: 'Location', key: 'location' },
    { label: 'Price', key: 'price' },
    { label: 'Action', key: 'action' }
  ];

  // Reset selections when page or data changes
  useEffect(() => {
    setSelectAll(false);
    setCheckedRows({});
  }, [currentPage, properties]);

  function handleSelectAll() {
    const updated = {};
    currentItems.forEach((p) => {
      updated[p._id] = !selectAll;
    });
    setCheckedRows(updated);
    setSelectAll(!selectAll);
  }

  const toggleCheckbox = (id) => {
    setCheckedRows((prev) => {
      const newChecked = { ...prev, [id]: !prev[id] };
      const allSelected = currentItems.every((p) => newChecked[p._id]);
      setSelectAll(allSelected);
      return newChecked;
    });
  };

  const handlePageChangeAndReset = (page) => {
    handlePageChange(page);
    setSelectAll(false);
    setCheckedRows({});
  };

  const handleDeleteClick = (id) => {
    setSelectedIds([id]);
    setDeleteMode('single');
    setShowDeletePopup(true);
  };

  const handleBulkDeleteClick = () => {
    const ids = getSelectedIds();
    if (ids.length > 0) {
      setSelectedIds(ids);
      setDeleteMode('bulk');
      setShowBulkDeletePopup(true);
    }
  };

  const confirmDelete = () => {
    if (deleteMode === 'single' && selectedIds.length === 1) {
      handleDelete(selectedIds[0]);
      setShowDeletePopup(false);
    } else if (deleteMode === 'bulk' && selectedIds.length > 0) {
      handleBulkDelete(selectedIds);
      setShowBulkDeletePopup(false);
    }
    setSelectedIds([]);
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setShowBulkDeletePopup(false);
    setSelectedIds([]);
  };

  const getSelectedIds = () => {
    return Object.keys(checkedRows).filter((id) => checkedRows[id]);
  };

  const selectedCount = getSelectedIds().length;

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

      {showDeletePopup && deleteMode === 'single' && (
        <PopupMessage
          title={UI_MESSAGES.DELETE_SINGLE_TITLE}
          message={UI_MESSAGES.DELETE_SINGLE_MESSAGE}
          icon={ASSET_PATHS.REMOVE_ICON}
          confirmLabel={BUTTON_LABELS.DELETE}
          cancelLabel={BUTTON_LABELS.CANCEL}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {showBulkDeletePopup && deleteMode === 'bulk' && (
        <PopupMessage
          title={UI_MESSAGES.DELETE_BULK_TITLE}
          message={`${UI_MESSAGES.DELETE_BULK_MESSAGE_PREFIX} ${selectedIds.length} ${UI_MESSAGES.DELETE_BULK_MESSAGE_SUFFIX}`}
          icon={ASSET_PATHS.REMOVE_ICON}
          confirmLabel="Delete All"
          cancelLabel={BUTTON_LABELS.CANCEL}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      <div className="table-scroll-container">
        <table className="property-table">
          <thead>
            <tr>
              {tableHeaders.map((header) => (
                <th key={header.key}>{header.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={tableHeaders.length} style={{ textAlign: 'center', padding: '20px' }}>
                  No properties found
                </td>
              </tr>
            ) : (
              currentItems.map((prop) => {
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
                            src={getPropertyImageSrc(prop.photo)}
                            alt={prop.name || 'Property'}
                            className="prop-photo"
                            onError={handlePropertyImageError}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              marginRight: '10px',
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
                      <Link to={`/property/${prop._id}`}>{prop.size || 'N/A'} sq ft</Link>
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
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-wrapper">
          <div className="pagination">
            <button
              className="page-link"
              onClick={prevPage}
              disabled={!hasPrevPage}
            >
              « Back
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`page-link ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => handlePageChangeAndReset(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="page-link"
              onClick={nextPage}
              disabled={!hasNextPage}
            >
              Next »
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyList;