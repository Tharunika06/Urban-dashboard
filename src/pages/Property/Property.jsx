// src/pages/Property/Property.jsx
import React, { useState, useEffect } from 'react';
import PropertyList from './PropertyList.jsx';
import PropertyGrid from './PropertyGrid.jsx';
import AddProperty from './AddProperty.jsx';
import Header from '../../components/layout/Header';
import MonthDropdown from '../../components/common/MonthDropdown';
import PopupMessage from '../../components/common/PopupMessage';
import propertyService from '../../services/propertyService';
import {
  API_CONFIG,
  MONTHS_FULL,
  DEFAULTS,
  PROPERTY_VIEW,
  PROPERTY_PAGE_TITLES,
  ASSET_PATHS,
  UI_MESSAGES,
  BUTTON_LABELS,
  PLACEHOLDERS,
  STYLES,
} from '../../utils/constants';
import { applyPropertyFilters } from '../../utils/propertyHelpers';
import '../../styles/Property.css';

const Property = () => {
  const [view, setView] = useState(DEFAULTS.VIEW_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [propertyList, setPropertyList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchTerm, setSearchTerm] = useState(DEFAULTS.SEARCH_TERM);
  const [selectedMonth, setSelectedMonth] = useState(DEFAULTS.SELECTED_MONTH);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchProperties();
    const refreshInterval = setInterval(() => {
      fetchProperties(true); // silent refresh
    }, API_CONFIG.AUTO_REFRESH_INTERVAL);
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchProperties = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);
      
      // ✅ Use propertyService instead of axios
      const data = await propertyService.getAllProperties();
      const propertiesArray = Array.isArray(data) ? data : [];
      setPropertyList(propertiesArray);
    } catch (err) {
      setError(err.message);
      console.error(`❌ ${UI_MESSAGES.FETCH_FAILED}:`, err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Filter properties when search or month changes
  useEffect(() => {
    const filtered = applyPropertyFilters(propertyList, {
      searchTerm,
      month: selectedMonth,
      monthsArray: MONTHS_FULL,
    });
    setFilteredList(filtered);
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
        // ✅ Bulk delete using propertyService
        await propertyService.bulkDeleteProperties(propertyToDelete);
        
        // Immediately update UI by filtering out all deleted properties
        setPropertyList(prevList => 
          prevList.filter((prop) => !propertyToDelete.includes(prop._id))
        );
        
        console.log(`✅ ${propertyToDelete.length} ${UI_MESSAGES.PROPERTIES_DELETED}`);
      } else {
        // ✅ Single delete using propertyService
        await propertyService.deleteProperty(propertyToDelete);
        
        // Immediately update the UI by filtering out the deleted property
        setPropertyList(prevList => 
          prevList.filter((prop) => prop._id !== propertyToDelete)
        );
        
        console.log(`✅ ${UI_MESSAGES.PROPERTY_DELETED}`);
      }
    } catch (err) {
      console.error('❌ Failed to delete property:', err);
      alert(err.response?.data?.message || UI_MESSAGES.DELETE_FAILED);
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

  const getPageTitle = () => 
    view === PROPERTY_VIEW.LIST ? PROPERTY_PAGE_TITLES.LIST : PROPERTY_PAGE_TITLES.GRID;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-state" style={STYLES.LOADING_STATE}>
          {UI_MESSAGES.LOADING_PROPERTIES}
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-state" style={STYLES.ERROR_STATE}>
          <p>Error: {error}</p>
          <button 
            onClick={() => fetchProperties()} 
            className="retry-btn" 
            style={STYLES.RETRY_BUTTON}
          >
            {BUTTON_LABELS.RETRY}
          </button>
        </div>
      );
    }

    if (!Array.isArray(filteredList) || filteredList.length === 0) {
      return (
        <div className="empty-state" style={STYLES.EMPTY_STATE}>
          {UI_MESSAGES.NO_PROPERTIES_FOUND}
        </div>
      );
    }
    
    if (view === PROPERTY_VIEW.LIST) {
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
              <img src={ASSET_PATHS.SEARCH_ICON} alt="search" />
              <input
                type="text"
                placeholder={PLACEHOLDERS.SEARCH}
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="view-toggle">
                <button
                  className={view === PROPERTY_VIEW.LIST ? 'active' : ''}
                  onClick={() => setView(PROPERTY_VIEW.LIST)}
                >
                  <img
                    src={view === PROPERTY_VIEW.LIST ? ASSET_PATHS.LIST_ACTIVE : ASSET_PATHS.LIST_INACTIVE}
                    alt="List View"
                  />
                </button>
                <button
                  className={view === PROPERTY_VIEW.GRID ? 'active' : ''}
                  onClick={() => setView(PROPERTY_VIEW.GRID)}
                >
                  <img
                    src={view === PROPERTY_VIEW.GRID ? ASSET_PATHS.GRID_ACTIVE : ASSET_PATHS.GRID_INACTIVE}
                    alt="Grid View"
                  />
                </button>
              </div>
              <button className="add-property-btn" onClick={() => setIsModalOpen(true)}>
                {BUTTON_LABELS.ADD_PROPERTY}
              </button>
            </div>
          </div>

          {/* Property List/Grid */}
          <div className="content-body-wrapper">
            <div className="content-card">
              <div className="list-header">
                <h2 className="page-title">
                  {getPageTitle()} 
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
              title={bulkDeleteMode ? UI_MESSAGES.DELETE_BULK_TITLE : UI_MESSAGES.DELETE_SINGLE_TITLE}
              message={
                bulkDeleteMode
                  ? `${UI_MESSAGES.DELETE_BULK_MESSAGE_PREFIX} ${propertyToDelete.length} ${UI_MESSAGES.DELETE_BULK_MESSAGE_SUFFIX}`
                  : UI_MESSAGES.DELETE_SINGLE_MESSAGE
              }
              icon={ASSET_PATHS.REMOVE_ICON}
              confirmLabel={BUTTON_LABELS.DELETE}
              cancelLabel={BUTTON_LABELS.CANCEL}
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