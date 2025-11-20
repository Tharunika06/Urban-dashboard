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
  UI_MESSAGES,
  PLACEHOLDERS
} from '../../utils/constants';

const Orders = () => {
  const [view, setView] = useState(DEFAULTS.VIEW_MODE);
  
  const [allTransactions, setAllTransactions] = useState([]);
  const [searchFilteredTransactions, setSearchFilteredTransactions] = useState([]);
  const [displayTransactions, setDisplayTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(DEFAULTS.SELECTED_MONTH);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await transactionService.getAllTransactions();
        
        setAllTransactions(data);
        setSearchFilteredTransactions(data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to fetch transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();

    const refreshInterval = setInterval(() => {
      fetchTransactions();
    }, API_CONFIG.AUTO_REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, []);

  // Handle search results from SearchBar
  const handleSearchResults = (filtered) => {
    setSearchFilteredTransactions(filtered);
  };

  // Apply month filter to search results
  useEffect(() => {
    const filterByMonth = (transactions) => {
      if (selectedMonth === 'all') {
        return transactions;
      }

      const monthIndex = MONTHS_FULL.indexOf(selectedMonth);
      if (monthIndex === -1) return transactions;

      return transactions.filter(transaction => {
        const date = new Date(transaction.date || transaction.createdAt);
        return date.getMonth() === monthIndex;
      });
    };

    const filtered = filterByMonth(searchFilteredTransactions);
    setDisplayTransactions(filtered);
  }, [searchFilteredTransactions, selectedMonth]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleConfirmDelete = (orderId) => {
    setOrderToDelete(orderId);
    setShowDeletePopup(true);
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;
    
    try {
      await transactionService.deleteTransaction(orderToDelete);
      
      setAllTransactions(prev => prev.filter(t => t.customTransactionId !== orderToDelete));
      setSearchFilteredTransactions(prev => prev.filter(t => t.customTransactionId !== orderToDelete));
      
      setShowDeletePopup(false);
      setOrderToDelete(null);
    } catch (err) {
      alert(`Failed to delete transaction: ${err.response?.data?.error || err.message}`);
      setError(err.response?.data?.error || err.message);
      
      setShowDeletePopup(false);
      setOrderToDelete(null);
    }
  };

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
    return <OrderList orders={displayTransactions} onDelete={handleConfirmDelete} />;
  };

  return (
    <div className="page-with-layout">
      <div className="main-content-panel">
        <Header />
        <div className="page-content-wrapper">
          <div className="orders-page-container">
            <div className="controls-bar">
              <SearchBar
                data={allTransactions}
                onFilteredResults={handleSearchResults}
                searchFields={['customTransactionId', 'userName', 'userEmail', 'type', 'status']}
                placeholder={PLACEHOLDERS.SEARCH}
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