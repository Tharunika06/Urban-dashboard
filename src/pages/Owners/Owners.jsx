// src/pages/Owners/Owners.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MonthDropdown from '../../components/common/MonthDropdown';
import Header from '../../components/layout/Header';
import AddOwnerModal from '../Owners/AddOwnerModal';
import PopupMessage from '../../components/common/PopupMessage';

import '../../styles/Dashboard.css';
import '../../styles/Owners.css';

const API_BASE_URL = 'http://192.168.0.154:5000';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Owners = () => {
  const [owners, setOwners] = useState([]);
  const [filteredOwners, setFilteredOwners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);

  // Fetch owners on mount and set up auto-refresh
  useEffect(() => {
    fetchOwners();
    
    // Optional: Set up auto-refresh every 30 seconds to get updated stats
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing owner data...');
      fetchOwners(true); // Silent refresh
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  const fetchOwners = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      
      console.log('📥 Fetching owners list...');
      const res = await axios.get(`${API_BASE_URL}/api/owners`);

      const ownersArray = Array.isArray(res.data.owners) ? res.data.owners : [];
      
      console.log(`✅ Fetched ${ownersArray.length} owners`);
      console.log('📊 Sample owner stats:', ownersArray[0] ? {
        name: ownersArray[0].name,
        propertyOwned: ownersArray[0].propertyOwned,
        propertyRent: ownersArray[0].propertyRent,
        propertySold: ownersArray[0].propertySold,
        totalListing: ownersArray[0].totalListing
      } : 'No owners');
      
      setOwners(ownersArray);
      setFilteredOwners(ownersArray);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('❌ Failed to fetch owners:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Function to get the correct owner photo source
  const getOwnerPhotoSrc = (photo) => {
    if (photo && photo.startsWith('data:image/')) {
      return photo;
    }
    if (photo && photo.startsWith('/uploads/')) {
      return `${API_BASE_URL}${photo}`;
    }
    return '/assets/placeholder.png';
  };

  // Function to handle image loading errors
  const handleImageError = (e) => {
    e.target.src = '/assets/default-avatar.png';
    console.warn('Failed to load owner photo, using fallback');
  };

  // Filter owners based on search term and selected month
  useEffect(() => {
    let ownersToFilter = Array.isArray(owners) ? owners : [];

    // Apply month filter ONLY if a specific month is selected
    if (selectedMonth && selectedMonth !== '') {
      const monthIndex = months.indexOf(selectedMonth);
      if (monthIndex > -1) {
        ownersToFilter = ownersToFilter.filter(owner => {
          const ownerDate = new Date(owner.doj || owner.createdAt);
          return ownerDate.getMonth() === monthIndex;
        });
      }
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      ownersToFilter = ownersToFilter.filter(
        (owner) =>
          owner.name?.toLowerCase().includes(term) ||
          owner.email?.toLowerCase().includes(term) ||
          owner.address?.toLowerCase().includes(term) ||
          owner.contact?.toLowerCase().includes(term)
      );
    }

    setFilteredOwners(ownersToFilter);
  }, [searchTerm, selectedMonth, owners]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleSaveOwner = (savedOwner) => {
    console.log('✅ New owner saved, refreshing list...');
    // Refresh the entire list to get accurate stats
    fetchOwners();
  };

  const handleConfirmDelete = (ownerId) => {
    setOwnerToDelete(ownerId);
    setShowDeletePopup(true);
  };

  const handleDelete = async () => {
    if (!ownerToDelete) return;
    
    try {
      console.log(`🗑️ Deleting owner: ${ownerToDelete}`);
      await axios.delete(`${API_BASE_URL}/api/owners/${ownerToDelete}`);
      
      // Remove owner from list
      setOwners((prev) => prev.filter((owner) => owner.ownerId !== ownerToDelete));
      setFilteredOwners((prev) => prev.filter((owner) => owner.ownerId !== ownerToDelete));

      console.log('✅ Owner deleted successfully');
      setShowDeletePopup(false);
      setOwnerToDelete(null);
    } catch (err) {
      console.error('❌ Failed to delete owner:', err);
      
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to delete owner';
      alert(errorMsg);
      
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
      <tr>
        <td colSpan="8" className="loading-state">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading owners...
          </div>
        </td>
      </tr>
    );
    
    if (error) return (
      <tr>
        <td colSpan="8" className="error-state">
          <div style={{ textAlign: 'center', padding: '20px', color: '#f44336' }}>
            <p>Error: {error}</p>
            <button 
              onClick={() => fetchOwners()}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </td>
      </tr>
    );

    if (!Array.isArray(filteredOwners) || filteredOwners.length === 0) return (
      <tr>
        <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
          {searchTerm || selectedMonth ? 'No owners found matching your filters' : 'No owners found'}
        </td>
      </tr>
    );

    return filteredOwners.map((owner) => (
      <tr key={owner._id || owner.ownerId}>
        <td>
          <div className="owner-info">
            <img
              src={getOwnerPhotoSrc(owner.photo)}
              alt={owner.name || 'No Name'}
              className="owner-photo"
              onError={handleImageError}
              style={{
                width: '50px',
                height: '50px',
                objectFit: 'cover',
                borderRadius: '50%',
                marginRight: '12px',
              }}
            />
            
            {owner?.name ? (
              <Link to={`/owners/${owner.ownerId}`} className="owner-link">
                {owner.name}
              </Link>
            ) : (
              'N/A'
            )}
          </div>
        </td>
        <td>{owner.address || '-'}</td>
        <td>{owner.email || '-'}</td>
        <td>{owner.contact || '-'}</td>
        <td>
          {/* Display propertyOwned - Auto-calculated from backend */}
          <span style={{ fontWeight: '500' }}>
            {owner.propertyOwned || 0}
          </span>
          {owner.propertyOwned > 0 && (
            <span style={{ 
              fontSize: '11px', 
              color: '#666', 
              marginLeft: '4px',
              display: 'block'
            }}>
              {/* (R:{owner.propertyRent || 0} | S:{owner.propertySold || 0}) */}
            </span>
          )}
        </td>
        <td>{owner.doj ? new Date(owner.doj).toLocaleDateString() : '-'}</td>
        <td>
          <span className={`status ${owner.status?.toLowerCase()}`}>
            {owner.status || 'Active'}
          </span>
        </td>
        <td className="action-icons">
          <Link to={`/owners/${owner.ownerId}`}>
            <img 
              src="/assets/view-icon.png" 
              alt="View"
              title="View Details" 
            />
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
    ));
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <Header title="Property Owners" />

        <main className="dashboard-body p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div className="search-bar w-100 w-md-50 d-flex align-items-center">
              <img src="/assets/search-icon.png" alt="search" />
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
              <h2>
                All Owner List <span className="subtext">({filteredOwners.length} Owners)</span>
              </h2>
              <div className="content-actions">
                <MonthDropdown onChange={handleMonthChange} />
                {/* <button 
                  onClick={() => fetchOwners()}
                  style={{
                    marginLeft: '10px',
                    padding: '6px 12px',
                    backgroundColor: '#4285f4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  title="Refresh owner data"
                >
                  🔄 Refresh
                </button> */}
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Owner Photo & Name</th>
                    <th>Address</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Properties</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {renderTableContent()}
                </tbody>
              </table>
            </div>

            {/* Stats Info Banner */}
            {/* {!isLoading && filteredOwners.length > 0 && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#e8f5e9',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#2e7d32'
              }}>
                <p style={{ margin: 0 }}>
                  📊 <strong>Property Statistics:</strong> All property counts are automatically calculated from the database. 
                  <strong> R</strong> = Rent properties, <strong>S</strong> = Sale properties.
                </p>
              </div>
            )} */}

            <div className="pagination">
              <a href="#" className="page-link">« Back</a>
              <a href="#" className="page-link active">1</a>
              <a href="#" className="page-link">2</a>
              <a href="#" className="page-link">Next »</a>
            </div>
          </section>
        </main>
      </div>

      <AddOwnerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveOwner}
      />

      {showDeletePopup && (
        <PopupMessage
          onConfirm={handleDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default Owners;