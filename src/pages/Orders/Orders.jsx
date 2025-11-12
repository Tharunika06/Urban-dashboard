// src/pages/Orders/Orders.jsx

import React, { useState, useEffect } from 'react';
import OrderList from './OrderList';
import PopupMessage from '../../components/common/PopupMessage';
import SearchBar from '../../components/common/SearchBar';
import '../../styles/Orders.css';
import MonthDropdown from '../../components/common/MonthDropdown';
import Header from '../../components/layout/Header';
import transactionService from '../../services/transactionService';
import { 
  MONTHS_FULL, 
  API_CONFIG, 
  DEFAULTS, 
  ASSET_PATHS,
  UI_MESSAGES 
} from '../../utils/constants';
import { applyFilters } from '../../utils/filterUtils';

const Orders = () => {
  const [view, setView] = useState(DEFAULTS.VIEW_MODE);
  const [searchTerm, setSearchTerm] = useState(DEFAULTS.SEARCH_TERM);
  
  // --- STATE MANAGEMENT for live data ---
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(DEFAULTS.SELECTED_MONTH);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Popup state management
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // --- DATA FETCHING using transactionService ---
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // ✅ Use transactionService instead of fetchData
        const data = await transactionService.getAllTransactions();
        
        setAllTransactions(data);
      } catch (err) {
        console.error('❌ Failed to fetch transactions:', err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchTransactions();
    }, API_CONFIG.AUTO_REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, []);

  // --- FILTERING LOGIC for both month and search term ---
  useEffect(() => {
    const results = applyFilters(allTransactions, {
      searchTerm,
      month: selectedMonth,
      monthsArray: MONTHS_FULL
    });
    
    setFilteredTransactions(results);
  }, [searchTerm, selectedMonth, allTransactions]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  // Show confirmation popup
  const handleConfirmDelete = (orderId) => {
    console.log('Order selected for deletion:', orderId);
    setOrderToDelete(orderId);
    setShowDeletePopup(true);
  };

  // Actual delete handler with API call using transactionService
  const handleDelete = async () => {
    if (!orderToDelete) return;
    
    try {
      // ✅ Use transactionService instead of deleteResource
      await transactionService.deleteTransaction(orderToDelete);
      
      // Update local state - remove from both arrays
      setAllTransactions(prev => prev.filter(t => t.customTransactionId !== orderToDelete));
      setFilteredTransactions(prev => prev.filter(t => t.customTransactionId !== orderToDelete));
      
      console.log(`✅ Transaction ${orderToDelete} deleted successfully`);
      
      setShowDeletePopup(false);
      setOrderToDelete(null);
    } catch (err) {
      console.error('❌ Failed to delete transaction:', err);
      alert(`Failed to delete transaction: ${err.response?.data?.error || err.message}`);
      setError(err.response?.data?.error || err.message);
      
      setShowDeletePopup(false);
      setOrderToDelete(null);
    }
  };

  // Cancel delete popup
  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setOrderToDelete(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading-state">{UI_MESSAGES.LOADING_ORDERS}</div>;
    }
    if (error) {
      return <div className="error-state">Error: {error}</div>;
    }
    return <OrderList orders={filteredTransactions} onDelete={handleConfirmDelete} />;
  }

  return (
    <div className="page-with-layout">
      <div className="main-content-panel">
        <Header />
        <div className="page-content-wrapper">
          <div className="orders-page-container">
            <div className="controls-bar">
              <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-wrapper"
              />
              <div className="header-actions">
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
                {/* <button className="add-button">Add Order</button> */}
              </div>
            </div>

            <div className="content-card">
              <div className="card-header-flex">
                <h2 className="page-title">{UI_MESSAGES.ALL_ORDER_LIST}</h2>
                <MonthDropdown onChange={handleMonthChange} />
              </div>
              
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation popup */}
      {showDeletePopup && (
        <PopupMessage
          onConfirm={handleDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default Orders;