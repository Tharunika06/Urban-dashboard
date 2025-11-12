// src/pages/Customers/Customers.jsx
import React, { useState, useEffect } from 'react';
import CustomerList from './CustomerList';
import CustomerGrid from './CustomerGrid';
import MonthDropdown from '../../components/common/MonthDropdown';
import Header from '../../components/layout/Header';
import PopupMessage from '../../components/common/PopupMessage';
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

      // ✅ Use customerService instead of old deleteCustomer import
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
    if (isLoading) return <div className="loading-state">{UI_MESSAGES.LOADING_CUSTOMERS}</div>;
    if (error) return <div className="error-state">Error: {error}</div>;
    
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
            <div className="search-bar w-100 w-md-50 d-flex align-items-center">
              <img src={ASSET_PATHS.SEARCH_ICON} alt="search" />
              <input
                type="text"
                placeholder={PLACEHOLDERS.SEARCH}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

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
              <button className="add-customer-btn">{BUTTON_LABELS.ADD_CUSTOMER}</button>
            </div>
          </div>

          <div className="content-card">
            <div className="list-header">
              <h2 className="page-title">{UI_MESSAGES.ALL_CUSTOMERS_LIST}</h2>
              <MonthDropdown onChange={setSelectedMonth} />
            </div>
            {renderContent()}
          </div>
        </main>
      </div>

      {showDeletePopup && (
        <PopupMessage onConfirm={handleDelete} onCancel={handleCancelDelete} />
      )}
    </div>
  );
};

export default Customers;