// src/pages/Property/Property.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyList from './PropertyList.jsx';
import PropertyGrid from './PropertyGrid.jsx';
import AddProperty from './AddProperty.jsx';
import Header from '../../components/layout/Header';
import MonthDropdown from '../../components/common/MonthDropdown';
import '../../styles/Property.css';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Property = () => {
  const [view, setView] = useState('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [propertyList, setPropertyList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete confirmation states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  // Fetch properties
  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://192.168.0.152:5000/api/property');
      setPropertyList(res.data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Filter properties based on search term and selected month
  useEffect(() => {
    let propertiesToFilter = propertyList;

    // Apply month filter if a month is selected
    if (selectedMonth) {
      const monthIndex = months.indexOf(selectedMonth);
      if (monthIndex > -1) {
        propertiesToFilter = propertiesToFilter.filter(property => {
          // Assuming properties have a createdAt field, adjust field name as needed
          const propertyDate = new Date(property.createdAt || property.dateAdded);
          return propertyDate.getMonth() === monthIndex;
        });
      }
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      propertiesToFilter = propertiesToFilter.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.address?.toLowerCase().includes(term) ||
          p.type?.toLowerCase().includes(term)
      );
    }

    setFilteredList(propertiesToFilter);
  }, [searchTerm, selectedMonth, propertyList]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleSaveProperty = () => {
    fetchProperties();
    setIsModalOpen(false);
  };

  // Open delete confirmation modal
  const confirmDelete = (id) => {
    setPropertyToDelete(id);
    setDeleteModalOpen(true);
  };

  // Delete property after confirmation
  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;

    try {
      await axios.delete(`http://192.168.0.152:5000/api/property/${propertyToDelete}`);
      
      // Update local state to remove deleted property
      const updatedProperties = propertyList.filter((prop) => prop._id !== propertyToDelete);
      setPropertyList(updatedProperties);
      
      console.log('Property deleted successfully');
    } catch (err) {
      console.error('Failed to delete property:', err);
      alert('Failed to delete property. Please try again.');
    } finally {
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
    }
  };

  // Cancel delete popup
  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setPropertyToDelete(null);
  };

  // Get dynamic title based on current view
  const getPageTitle = () => {
    return view === 'list' ? 'Property List' : 'Property Grid';
  };

  const renderContent = () => {
    if (isLoading) return <div className="loading-state">Loading properties...</div>;
    if (error) return <div className="error-state">Error: {error}</div>;
    
    if (view === 'list') {
      return <PropertyList properties={filteredList} handleDelete={confirmDelete} />;
    }
    return <PropertyGrid properties={filteredList} />;
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <Header title="Property" />
        <main className="dashboard-body p-4">
          {/* Search + Actions */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div className="search-bar w-100 w-md-50 d-flex align-items-center">
              <img src="/assets/search-icon.png" alt="search" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="view-toggle">
                <button
                  className={view === 'list' ? 'active' : ''}
                  onClick={() => setView('list')}
                >
                  <img
                    src={view === 'list' ? '/assets/list-active.png' : '/assets/list-inactive.png'}
                    alt="List View"
                  />
                </button>
                <button
                  className={view === 'grid' ? 'active' : ''}
                  onClick={() => setView('grid')}
                >
                  <img
                    src={view === 'grid' ? '/assets/grid-active.png' : '/assets/grid-inactive.png'}
                    alt="Grid View"
                  />
                </button>
              </div>
              <button className="add-property-btn" onClick={() => setIsModalOpen(true)}>
                Add Property
              </button>
            </div>
          </div>

          {/* Property List/Grid */}
          <div className="content-body-wrapper">
            <div className="content-card">
              <div className="list-header">
                <h2 className="page-title">{getPageTitle()}</h2>
                <MonthDropdown onChange={handleMonthChange} />
              </div>
              {renderContent()}
            </div>
          </div>

          {/* Add Property Modal */}
          <AddProperty
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveProperty}
          />

          {/* Delete Confirmation Modal */}
          {deleteModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <span className="close-btn" onClick={handleCancelDelete}>×</span>
                <div className="modal-body">
                  <div className="modal-icon">
                    <span style={{ fontSize: '40px', color: 'green' }}>✔</span>
                  </div>
                  <h2>Are You Sure?</h2>
                  <p>Do you really want to delete this property? This process cannot be undone.</p>
                  <div className="modal-actions">
                    <button className="btn-cancel" onClick={handleCancelDelete}>Cancel</button>
                    <button className="btn-delete" onClick={handleDeleteProperty}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Property;