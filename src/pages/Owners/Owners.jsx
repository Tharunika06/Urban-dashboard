// src/pages/Owners/Owners.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MonthDropdown from '../../components/common/MonthDropdown';
import Header from '../../components/layout/Header';
import AddOwnerModal from '../Owners/AddOwnerModal';
import PopupMessage from '../../components/common/PopupMessage';
import { 
  API_CONFIG, 
  MONTHS_FULL,
  DEFAULTS,
  ASSET_PATHS,
  STYLES 
} from '../../utils/constants';
import { 
  getOwnerPhotoSrc, 
  handleImageError, 
  getAvailableProperties,
  filterOwnersByMonth,
  filterOwnersBySearch,
  formatDate
} from '../../utils/ownerHelpers';
import { fetchOwners, deleteOwner } from '../../utils/apiHelpers';
import { calculatePagination, getPaginatedItems } from '../../utils/paginationUtils';
import { initializeSocket, cleanupSocket } from '../../utils/socketHelpers';

import '../../styles/Dashboard.css';
import '../../styles/Owners.css';

const Owners = () => {
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(DEFAULTS.SEARCH_TERM);
  const [selectedMonth, setSelectedMonth] = useState(DEFAULTS.SELECTED_MONTH);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const ownersPerPage = 6;

  const tableHeaders = [
    'Owner Photo & Name',
    'Address',
    'Email',
    'Contact',
    'Properties',
    'Date',
    'Status',
    'Action'
  ];

  // Socket.io for real-time updates
  useEffect(() => {
    const socket = initializeSocket(() => {
      loadOwners(true);
    });

    return () => cleanupSocket(socket);
  }, []);

  // Initial fetch and auto-refresh
  useEffect(() => {
    loadOwners();
    const refreshInterval = setInterval(() => {
      loadOwners(true);
    }, API_CONFIG.AUTO_REFRESH_INTERVAL);
    return () => clearInterval(refreshInterval);
  }, []);

  // Load owners data
  const loadOwners = async (silent = false) => {
    if (!silent) setIsLoading(true);
    
    const result = await fetchOwners();
    
    if (result.success) {
      setOwners(result.data);
      setFilteredOwners(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    
    if (!silent) setIsLoading(false);
  };

  // Filter owners when search or month changes
  useEffect(() => {
    let ownersToFilter = Array.isArray(owners) ? owners : [];

    // Filter by month
    ownersToFilter = filterOwnersByMonth(ownersToFilter, selectedMonth, MONTHS_FULL);

    // Filter by search term
    ownersToFilter = filterOwnersBySearch(ownersToFilter, searchTerm);

    setFilteredOwners(ownersToFilter);
    setCurrentPage(1);
  }, [searchTerm, selectedMonth, owners]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleSaveOwner = () => {
    loadOwners();
  };

  const handleConfirmDelete = (ownerId) => {
    setOwnerToDelete(ownerId);
    setShowDeletePopup(true);
  };

  const handleDelete = async () => {
    if (!ownerToDelete) return;
    
    const result = await deleteOwner(ownerToDelete);
    
    if (result.success) {
      setOwners((prev) => prev.filter((owner) => owner.ownerId !== ownerToDelete));
      setFilteredOwners((prev) => prev.filter((owner) => owner.ownerId !== ownerToDelete));
    } else {
      alert(result.error);
    }
    
    setShowDeletePopup(false);
    setOwnerToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setOwnerToDelete(null);
  };

  // Pagination using paginationUtils
  const pagination = calculatePagination(filteredOwners.length, currentPage, ownersPerPage);
  const currentOwners = getPaginatedItems(filteredOwners, currentPage, ownersPerPage);
  const { totalPages, hasNextPage, hasPreviousPage: hasPrevPage } = pagination;

  const nextPage = () => {
    if (hasNextPage) setCurrentPage(prev => prev + 1);
  };

  const prevPage = () => {
    if (hasPrevPage) setCurrentPage(prev => prev - 1);
  };

  const renderTableContent = () => {
    if (isLoading) return (
      <tr><td colSpan={tableHeaders.length} className="loading-state">Loading owners...</td></tr>
    );

    if (error) return (
      <tr>
        <td colSpan={tableHeaders.length} className="error-state">
          <div style={STYLES.ERROR_STATE}>
            <p>Error: {error}</p>
            <button onClick={() => loadOwners()} style={STYLES.RETRY_BUTTON}>
              Retry
            </button>
          </div>
        </td>
      </tr>
    );

    if (!Array.isArray(filteredOwners) || filteredOwners.length === 0)
      return <tr><td colSpan={tableHeaders.length} style={{ textAlign: 'center' }}>No owners found</td></tr>;

    return currentOwners.map((owner) => {
      const availableProps = getAvailableProperties(owner);
      const soldProps = owner.propertySold || 0;
      
      return (
        <tr key={owner._id || owner.ownerId}>
          <td>
            <div className="owner-info">
              <img
                src={getOwnerPhotoSrc(owner.photo)}
                alt={owner.name || 'No Name'}
                className="owner-photo"
                onError={(e) => handleImageError(e, '/assets/default-avatar.png')}
              />
              {owner?.name ? (
                <Link to={`/owners/${owner.ownerId}`} className="owner-link">
                  {owner.name}
                </Link>
              ) : 'N/A'}
            </div>
          </td>
          <td>{owner.address || '-'}</td>
          <td>{owner.email || '-'}</td>
          <td>{owner.contact || '-'}</td>
          <td>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ 
                fontWeight: '600', 
                color: availableProps === 0 ? '#95a5a6' : '#2c3e50' 
              }}>
                {availableProps} Available
              </span>
              {soldProps > 0 && (
                <span style={{ fontSize: '0.85em', color: '#95a5a6' }}>
                  ({soldProps} Sold)
                </span>
              )}
            </div>
          </td>
          <td>{formatDate(owner.doj)}</td>
          <td><span className={`status ${owner.status?.toLowerCase()}`}>{owner.status || 'Active'}</span></td>
          <td className="action-icons">
            <Link to={`/owners/${owner.ownerId}`}>
              <img src="/assets/view-icon.png" alt="View" title="View Details" />
            </Link>
            <img
              src="/assets/delete-icon.png"
              alt="Delete"
              title="Delete Owner"
              onClick={() => handleConfirmDelete(owner.ownerId)}
              style={{ cursor: 'pointer' }}
            />
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <Header title="Property Owners" />

        <main className="dashboard-body p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div className="search-bar w-100 w-md-50 d-flex align-items-center">
              <img src={ASSET_PATHS.SEARCH_ICON} alt="search" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
              style={{
                backgroundColor: '#000',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              New Owner
            </button>
          </div>

          <section className="content-section">
            <div className="content-header">
              <h2>All Owner List <span className="subtext">({filteredOwners.length} Owners)</span></h2>
              <div className="content-actions">
                <MonthDropdown onChange={handleMonthChange} />
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {tableHeaders.map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>{renderTableContent()}</tbody>
              </table>
            </div>

            {totalPages > 1 && (
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
                    onClick={() => setCurrentPage(i + 1)}
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
            )}
          </section>
        </main>
      </div>

      <AddOwnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOwner}
      />

      {showDeletePopup && (
        <PopupMessage onConfirm={handleDelete} onCancel={handleCancelDelete} />
      )}
    </div>
  );
};

export default Owners;