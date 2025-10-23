// src/pages/Property/Property.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyList from './PropertyList.jsx';
import PropertyGrid from './PropertyGrid.jsx';
import AddProperty from './AddProperty.jsx';
import Header from '../../components/layout/Header';
import MonthDropdown from '../../components/common/MonthDropdown';
import PopupMessage from '../../components/common/PopupMessage';
import '../../styles/Property.css';

// API Configuration - Update this URL to match your backend
const API_URL = 'http://localhost:5000';

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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  // Auto-refresh every 30 seconds (like Owners page)
  useEffect(() => {
    fetchProperties();
    const refreshInterval = setInterval(() => {
      fetchProperties(true); // silent refresh
    }, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchProperties = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);
      const res = await axios.get(`${API_URL}/api/property`);
      const propertiesArray = Array.isArray(res.data) ? res.data : [];
      setPropertyList(propertiesArray);
    } catch (err) {
      setError(err.message);
      console.error('❌ Failed to fetch properties:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    let propertiesToFilter = Array.isArray(propertyList) ? propertyList : [];

    if (selectedMonth && selectedMonth !== '') {
      const monthIndex = months.indexOf(selectedMonth);
      if (monthIndex > -1) {
        propertiesToFilter = propertiesToFilter.filter((property) => {
          const propertyDate = new Date(property.createdAt || property.dateAdded);
          return propertyDate.getMonth() === monthIndex;
        });
      }
    }

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

  const handleSearch = (event) => setSearchTerm(event.target.value);
  const handleMonthChange = (month) => setSelectedMonth(month);
  
  const handleSaveProperty = async (newProperty) => {
    // Immediately update the list with the new property
    if (newProperty) {
      setPropertyList(prevList => [...prevList, newProperty]);
    } else {
      // Fetch all properties again to ensure data consistency
      await fetchProperties();
    }
    setIsModalOpen(false);
  };

  // Single property delete
  const confirmDelete = (id) => {
    setPropertyToDelete(id);
    setBulkDeleteMode(false);
    setDeleteModalOpen(true);
  };

  // Bulk delete
  const confirmBulkDelete = (ids) => {
    setPropertyToDelete(ids);
    setBulkDeleteMode(true);
    setDeleteModalOpen(true);
  };

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;

    try {
      if (bulkDeleteMode) {
        // Bulk delete - delete multiple properties
        const deletePromises = propertyToDelete.map(id => 
          axios.delete(`${API_URL}/api/property/${id}`)
        );
        
        await Promise.all(deletePromises);
        
        // Immediately update UI by filtering out all deleted properties
        setPropertyList(prevList => 
          prevList.filter((prop) => !propertyToDelete.includes(prop._id))
        );
        
        console.log(`✅ ${propertyToDelete.length} properties deleted successfully`);
      } else {
        // Single delete
        await axios.delete(`${API_URL}/api/property/${propertyToDelete}`);
        
        // Immediately update the UI by filtering out the deleted property
        setPropertyList(prevList => 
          prevList.filter((prop) => prop._id !== propertyToDelete)
        );
        
        console.log('✅ Property deleted successfully');
      }
    } catch (err) {
      console.error('❌ Failed to delete property:', err);
      alert(err.response?.data?.message || 'Failed to delete property. Please try again.');
      // Refetch to ensure data consistency if delete failed
      fetchProperties();
    } finally {
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
      setBulkDeleteMode(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setPropertyToDelete(null);
    setBulkDeleteMode(false);
  };

  const getPageTitle = () => (view === 'list' ? 'All Property List' : 'All Property Grid');

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>
          Loading properties...
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-state" style={{ textAlign: 'center', padding: '40px', color: '#f44336' }}>
          <p>Error: {error}</p>
          <button onClick={() => fetchProperties()} className="retry-btn" style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            Retry
          </button>
        </div>
      );
    }

    if (!Array.isArray(filteredList) || filteredList.length === 0) {
      return (
        <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
          No properties found
        </div>
      );
    }
    
    if (view === 'list') {
      return (
        <PropertyList 
          properties={filteredList} 
          handleDelete={confirmDelete}
          handleBulkDelete={confirmBulkDelete}
        />
      );
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
                <h2 className="page-title">
                  {getPageTitle()} 
                  {/* <span className="subtext"> ({filteredList.length} Properties)</span> */}
                </h2>
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

          {/* Delete Confirmation Popup */}
          {deleteModalOpen && (
            <PopupMessage 
              onConfirm={handleDeleteProperty} 
              onCancel={handleCancelDelete} 
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Property;