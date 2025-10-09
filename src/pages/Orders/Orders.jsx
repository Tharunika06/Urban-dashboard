// src/pages/Orders.jsx

import React, { useState, useEffect } from 'react';
import OrderList from './OrderList';
import PopupMessage from '../../components/common/PopupMessage';
import '../../styles/Orders.css';
import { BsSearch } from 'react-icons/bs';
import MonthDropdown from '../../components/common/MonthDropdown';
import Header from '../../components/layout/Header';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Orders = () => {
  const [view, setView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- STATE MANAGEMENT for live data ---
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Popup state management
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://192.168.0.154:5000/api/payment/transactions');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAllTransactions(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch orders/transactions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // --- FILTERING LOGIC for both month and search term ---
  useEffect(() => {
    let results = allTransactions;

    // 1. Filter by month
    if (selectedMonth) {
      const monthIndex = months.indexOf(selectedMonth);
      if (monthIndex > -1) {
        results = results.filter(transaction => {
          const transactionDate = new Date(transaction.createdAt);
          return transactionDate.getMonth() === monthIndex;
        });
      }
    }

    // 2. Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(transaction =>
        (transaction.customerName && transaction.customerName.toLowerCase().includes(term)) ||
        (transaction.property?.name && transaction.property.name.toLowerCase().includes(term)) ||
        (transaction.status && transaction.status.toLowerCase().includes(term)) ||
        (transaction.customerPhone && transaction.customerPhone.includes(term))
      );
    }
    
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

  // Actual delete handler with API call
  const handleDelete = async () => {
    if (!orderToDelete) return;
    
    try {
      console.log('Attempting to delete order/transaction with ID:', orderToDelete);
      
      const encodedTransactionId = encodeURIComponent(orderToDelete);
      const response = await fetch(
        `http://192.168.0.154:5000/api/payment/transactions/${encodedTransactionId}`,
        { 
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete transaction');
      }
      
      console.log('Delete response:', data);
      
      // Update local state - remove from both arrays
      const updatedTransactions = allTransactions.filter(t => t.customTransactionId !== orderToDelete);
      setAllTransactions(updatedTransactions);
      
      const updatedFilteredTransactions = filteredTransactions.filter(t => t.customTransactionId !== orderToDelete);
      setFilteredTransactions(updatedFilteredTransactions);
      
      setShowDeletePopup(false);
      setOrderToDelete(null);
      
      // No success alert - just like Transaction.jsx
      
    } catch (err) {
      console.error('Failed to delete order:', err);
      alert(`Failed to delete transaction: ${err.message}`);
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
      return <div className="loading-state">Loading orders...</div>;
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
              <div className="search-wrapper">
                <BsSearch className="search-icon" />
                <input
                  type="search"
                  placeholder="Search"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="header-actions">
               <div className="view-toggle">
                <button
                  className={view === 'list' ? 'active' : ''}
                  onClick={() => setView('list')}
                >
                  <img src={view === 'list' ? '/assets/list-active.png' : '/assets/list-inactive.png'} alt="List View" />
                </button>
                <button
                  className={view === 'grid' ? 'active' : ''}
                  onClick={() => setView('grid')}
                >
                  <img src={view === 'grid' ? '/assets/grid-active.png' : '/assets/grid-inactive.png'} alt="Grid View" />
                </button>
              </div>
                <button className="add-button">Add Order</button>
              </div>
            </div>

            <div className="content-card">
              <div className="card-header-flex">
                <h2 className="page-title">All Order List</h2>
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