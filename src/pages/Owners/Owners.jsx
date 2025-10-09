import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MonthDropdown from '../../components/common/MonthDropdown';
import Header from '../../components/layout/Header';
import AddOwnerModal from '../Owners/AddOwnerModal';
import PopupMessage from '../../components/common/PopupMessage';

import '../../styles/Dashboard.css';
import '../../styles/Owners.css';

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

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://192.168.0.154:5000/api/owners');

      const ownersArray = Array.isArray(res.data.owners) ? res.data.owners : [];
      setOwners(ownersArray);
      setFilteredOwners(ownersArray);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch owners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Function to get the correct owner photo source
  const getOwnerPhotoSrc = (photo) => {
    // If photo exists and is a base64 data URL, use it directly
    if (photo && photo.startsWith('data:image/')) {
      return photo;
    }
    
    // If photo is a file path (for backward compatibility)
    if (photo && photo.startsWith('/uploads/')) 
    
    // Fallback to placeholder image
    return '/assets/placeholder.png';
  };

  // NEW: Function to handle image loading errors
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
    // Add new owner to both owners and filteredOwners
    setOwners((prev) => [...prev, savedOwner]);
    setFilteredOwners((prev) => [...prev, savedOwner]);
  };

  const handleConfirmDelete = (ownerId) => {
    setOwnerToDelete(ownerId);
    setShowDeletePopup(true);
  };

  const handleDelete = async () => {
    if (!ownerToDelete) return;
    
    try {
      await axios.delete(`http://192.168.0.154:5000/api/owners/${ownerToDelete}`);
      
      // Remove owner from list
      setOwners((prev) => prev.filter((owner) => owner.ownerId !== ownerToDelete));
      setFilteredOwners((prev) => prev.filter((owner) => owner.ownerId !== ownerToDelete));

      setShowDeletePopup(false);
      setOwnerToDelete(null);
    } catch (err) {
      console.error('Failed to delete owner:', err);
      alert('Failed to delete owner. Please try again.');
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
        <td colSpan="8" className="loading-state">Loading owners...</td>
      </tr>
    );
    
    if (error) return (
      <tr>
        <td colSpan="8" className="error-state">Error: {error}</td>
      </tr>
    );

    if (!Array.isArray(filteredOwners) || filteredOwners.length === 0) return (
      <tr>
        <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
          No owners found
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
        <td>{owner.properties ? owner.properties.length : (owner.propertyOwned || 0)}</td>
        <td>{owner.doj ? new Date(owner.doj).toLocaleDateString() : '-'}</td>
        <td>
          <span className={`status ${owner.status?.toLowerCase()}`}>
            {owner.status || 'Active'}
          </span>
        </td>
        <td className="action-icons">
          <Link to={`/owners/${owner.ownerId}`}>
            <img src="/assets/view-icon.png" alt="View" />
          </Link>
          <img
            src="/assets/delete-icon.png"
            alt="Delete"
            onClick={() => handleConfirmDelete(owner.ownerId)}
            style={{ cursor: 'pointer' }}
          />
          <img
            src="/assets/edit-icon.png"
            alt="Edit"
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