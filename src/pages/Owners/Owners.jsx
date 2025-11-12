// src/pages/Owners/Owners.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MonthDropdown from '../../components/common/MonthDropdown';
import Header from '../../components/layout/Header';
import AddOwnerModal from '../Owners/AddOwnerModal';
import PopupMessage from '../../components/common/PopupMessage';
import ownerService from '../../services/ownerService';
import { usePagination } from '../../hooks/usePagination';
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
import { initializeSocket, cleanupSocket } from '../../utils/socketHelpers';

import '../../styles/Dashboard.css';
import '../../styles/Owners.css';

const OWNERS_PER_PAGE = 6;

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

  // Use pagination hook
  const {
    currentPage,
    totalPages,
    currentItems: currentOwners,
    handlePageChange,
    nextPage,
    prevPage,
    resetPage,
    hasNextPage,
    hasPrevPage
  } = usePagination(filteredOwners, OWNERS_PER_PAGE);

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

  // Load owners data using ownerService
  const loadOwners = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      
      const data = await ownerService.getAllOwners();
      
      setOwners(data.owners || data || []);
      setFilteredOwners(data.owners || data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Failed to fetch owners:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch owners');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Filter owners when search or month changes
  useEffect(() => {
    let ownersToFilter = Array.isArray(owners) ? owners : [];

    // Filter by month
    ownersToFilter = filterOwnersByMonth(ownersToFilter, selectedMonth, MONTHS_FULL);

    // Filter by search term
    ownersToFilter = filterOwnersBySearch(ownersToFilter, searchTerm);

    setFilteredOwners(ownersToFilter);
    resetPage(); // Reset to page 1 when filters change
  }, [searchTerm, selectedMonth, owners, resetPage]);

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
    
    try {
      await ownerService.deleteOwner(ownerToDelete);
      
      // Update local state
      setOwners((prev) => prev.filter((owner) => owner.ownerId !== ownerToDelete));
      setFilteredOwners((prev) => prev.filter((owner) => owner.ownerId !== ownerToDelete));
      
      console.log(`✅ Owner ${ownerToDelete} deleted successfully`);
    } catch (err) {
      console.error('❌ Failed to delete owner:', err);
      alert(err.response?.data?.error || err.message || 'Failed to delete owner');
    } finally {
      setShowDeletePopup(false);
      setOwnerToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setOwnerToDelete(null);
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

            <div className="table-scroll-container">
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
                      onClick={() => handlePageChange(i + 1)}
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