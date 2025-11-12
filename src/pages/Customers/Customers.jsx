// src/pages/Customers/Customers.jsx
import React, { useState, useEffect } from 'react';
import CustomerList from './CustomerList';
import CustomerGrid from './CustomerGrid';
import MonthDropdown from '../../components/common/MonthDropdown';
import Header from '../../components/layout/Header';
import PopupMessage from '../../components/common/PopupMessage';
import GradientButton from '../../components/common/GradientButton';
import SearchBar from '../../components/common/SearchBar';
import { useSocket } from '../../hooks/useSocket';
import { useCustomers } from '../../hooks/useCustomers';
import customerService from '../../services/customerService';
import '../../styles/Dashboard.css';
import '../../styles/Customers.css';
import {
  API_CONFIG,
  DEFAULTS,
  ASSET_PATHS,
  UI_MESSAGES,
  BUTTON_LABELS,
  PLACEHOLDERS,
  STYLES,
} from '../../utils/constants';

const Customers = () => {
  const [view, setView] = useState(DEFAULTS.VIEW_MODE);
  const [searchTerm, setSearchTerm] = useState(DEFAULTS.SEARCH_TERM);
  const [selectedMonth, setSelectedMonth] = useState(DEFAULTS.SELECTED_MONTH);

  // Popup state
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Custom hooks
  const { filteredCustomers, isLoading, error, fetchData, removeCustomer } = useCustomers(
    selectedMonth,
    searchTerm
  );

  // Socket connection
  useSocket(() => fetchData(true));

  // Initial fetch and polling
  useEffect(() => {
    fetchData();

    const refreshInterval = setInterval(() => {
      fetchData(true);
    }, API_CONFIG.AUTO_REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, [fetchData]);

  // Show delete confirmation
  const handleConfirmDelete = (customerPhone) => {
    console.log('Customer selected for deletion:', customerPhone);
    setCustomerToDelete(customerPhone);
    setShowDeletePopup(true);
  };

  // Execute delete using customerService
  const handleDelete = async () => {
    if (!customerToDelete) return;

    try {
      console.log('Attempting to delete customer with phone:', customerToDelete);

      await customerService.deleteCustomer(customerToDelete);

      console.log('Customer deleted successfully');
      removeCustomer(customerToDelete);

      setShowDeletePopup(false);
      setCustomerToDelete(null);
    } catch (err) {
      console.error(UI_MESSAGES.CUSTOMER_DELETE_FAILED, err);
      alert(`${UI_MESSAGES.CUSTOMER_DELETE_FAILED}: ${err.message}`);
      
      setShowDeletePopup(false);
      setCustomerToDelete(null);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setCustomerToDelete(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-state" style={STYLES.LOADING_STATE}>
          {UI_MESSAGES.LOADING_CUSTOMERS}
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-state" style={STYLES.ERROR_STATE}>
          <p>Error: {error}</p>
          <GradientButton 
            onClick={() => fetchData()} 
            width="100px" 
            height="38px"
          >
            {BUTTON_LABELS.RETRY}
          </GradientButton>
        </div>
      );
    }

    if (!Array.isArray(filteredCustomers) || filteredCustomers.length === 0) {
      return (
        <div className="empty-state" style={STYLES.EMPTY_STATE}>
          {UI_MESSAGES.NO_CUSTOMERS_FOUND || 'No customers found'}
        </div>
      );
    }
    
    if (view === 'list') {
      return <CustomerList customers={filteredCustomers} onDelete={handleConfirmDelete} />;
    }
    
    return <CustomerGrid customers={filteredCustomers} />;
  };

  return (
    <div className="dashboard-container">
      <div className="main-content">
        <Header title="Customers" />
        <main className="dashboard-body p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <SearchBar
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={PLACEHOLDERS.SEARCH}
              className="w-100 w-md-50"
            />

            <div className="d-flex align-items-center gap-2">
              <div className="view-toggle">
                <button
                  className={view === 'list' ? 'active' : ''}
                  onClick={() => setView('list')}
                >
                  <img
                    src={view === 'list' ? ASSET_PATHS.LIST_ACTIVE : ASSET_PATHS.LIST_INACTIVE}
                    alt="List View"
                  />
                </button>
                <button
                  className={view === 'grid' ? 'active' : ''}
                  onClick={() => setView('grid')}
                >
                  <img
                    src={view === 'grid' ? ASSET_PATHS.GRID_ACTIVE : ASSET_PATHS.GRID_INACTIVE}
                    alt="Grid View"
                  />
                </button>
              </div>
              <GradientButton width="160px" height="40px">
                {BUTTON_LABELS.ADD_CUSTOMER}
              </GradientButton>
            </div>
          </div>

          <div className="content-body-wrapper">
            <div className="content-card">
              <div className="list-header">
                <h2 className="page-title">
                  {UI_MESSAGES.ALL_CUSTOMERS_LIST || 'All Customer List'} 
                  <span className="subtext"></span>
                </h2>
                <MonthDropdown onChange={setSelectedMonth} />
              </div>
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {showDeletePopup && (
        <PopupMessage 
          title="Delete Customer"
          message="Are you sure you want to delete this customer? This action cannot be undone."
          icon={ASSET_PATHS.REMOVE_ICON}
          confirmLabel={BUTTON_LABELS.DELETE}
          cancelLabel={BUTTON_LABELS.CANCEL}
          onConfirm={handleDelete} 
          onCancel={handleCancelDelete} 
        />
      )}
    </div>
  );
};

export default Customers;