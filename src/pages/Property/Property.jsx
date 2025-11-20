// src/pages/Property/Property.jsx
import React, { useState, useEffect } from 'react';
import PropertyList from './PropertyList.jsx';
import PropertyGrid from './PropertyGrid.jsx';
import AddProperty from './AddProperty.jsx';
import Header from '../../components/layout/Header';
import MonthDropdown from '../../components/common/MonthDropdown';
import PopupMessage from '../../components/common/PopupMessage';
import GradientButton from '../../components/common/GradientButton';
import SearchBar from '../../components/common/SearchBar';
import propertyService from '../../services/propertyService';
import {
  API_CONFIG,
  DEFAULTS,
  PROPERTY_VIEW,
  PROPERTY_PAGE_TITLES,
  ASSET_PATHS,
  UI_MESSAGES,
  BUTTON_LABELS,
  PLACEHOLDERS,
  STYLES,
  MONTHS_FULL,
} from '../../utils/constants';
import '../../styles/Property.css';

const Property = () => {
  const [view, setView] = useState(DEFAULTS.VIEW_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [propertyList, setPropertyList] = useState([]);
  const [searchFilteredList, setSearchFilteredList] = useState([]);
  const [displayList, setDisplayList] = useState([]);
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
      fetchProperties(true);
    }, API_CONFIG.AUTO_REFRESH_INTERVAL);
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchProperties = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      setError(null);
      
      const data = await propertyService.getAllProperties();
      const propertiesArray = data.properties || data || [];
      
      setPropertyList(propertiesArray);
      setSearchFilteredList(propertiesArray);
    } catch (err) {
      setError(err.message);
      console.error(`${UI_MESSAGES.FETCH_FAILED}:`, err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Handle search results from SearchBar
  const handleSearchResults = (filtered) => {
    setSearchFilteredList(filtered);
  };

  // Apply month filter to search results
  useEffect(() => {
    const filterByMonth = (properties) => {
      if (selectedMonth === 'all') {
        return properties;
      }

      const monthIndex = MONTHS_FULL.indexOf(selectedMonth);
      if (monthIndex === -1) return properties;

      return properties.filter(property => {
        if (!property.createdAt) return false;
        const date = new Date(property.createdAt);
        return date.getMonth() === monthIndex;
      });
    };

    const filtered = filterByMonth(searchFilteredList);
    setDisplayList(filtered);
  }, [searchFilteredList, selectedMonth]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };
  
  const handleSaveProperty = async (newProperty) => {
    if (newProperty) {
      const propertyData = newProperty.property || newProperty;
      setPropertyList(prevList => [...prevList, propertyData]);
    } else {
      await fetchProperties();
    }
    setIsModalOpen(false);
  };

  const confirmDelete = (id) => {
    setPropertyToDelete(id);
    setBulkDeleteMode(false);
    setDeleteModalOpen(true);
  };

  const confirmBulkDelete = (ids) => {
    setPropertyToDelete(ids);
    setBulkDeleteMode(true);
    setDeleteModalOpen(true);
  };

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;

    try {
      if (bulkDeleteMode) {
        await propertyService.bulkDeleteProperties(propertyToDelete);
        setPropertyList(prevList => 
          prevList.filter((prop) => !propertyToDelete.includes(prop._id))
        );
      } else {
        await propertyService.deleteProperty(propertyToDelete);
        setPropertyList(prevList => 
          prevList.filter((prop) => prop._id !== propertyToDelete)
        );
      }
    } catch (err) {
      console.error('Failed to delete property:', err);
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
          <GradientButton 
            onClick={() => fetchProperties()} 
            width="100px" 
            height="38px"
          >
            {BUTTON_LABELS.RETRY}
          </GradientButton>
        </div>
      );
    }

    if (!Array.isArray(displayList) || displayList.length === 0) {
      return (
        <div className="empty-state" style={STYLES.EMPTY_STATE}>
          {UI_MESSAGES.NO_PROPERTIES_FOUND}
        </div>
      );
    }
    
    if (view === PROPERTY_VIEW.LIST) {
      return (
        <PropertyList 
          properties={displayList} 
          handleDelete={confirmDelete}
          handleBulkDelete={confirmBulkDelete}
        />
      );
    }
    
    return <PropertyGrid properties={displayList} />;
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <Header title="Property" />
        <main className="dashboard-body p-4">
          {/* Search + Actions */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <SearchBar
              data={propertyList}
              onFilteredResults={handleSearchResults}
              searchFields={['name', 'propertyId', 'address', 'price', 'status']}
              placeholder={PLACEHOLDERS.SEARCH}
              className="w-100 w-md-50 d-flex align-items-center"
            />
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
              <GradientButton onClick={() => setIsModalOpen(true)} >
                {BUTTON_LABELS.ADD_PROPERTY}
              </GradientButton>
            </div>
          </div>

          {/* Property List/Grid */}
          <div className="content-body-wrapper">
            <div className="content-card">
              <div className="list-header">
                <h2 className="page-title">
                  {getPageTitle()} <span className="subtext"></span>
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