// src/pages/Transaction/Transaction.jsx

import React, { useState, useEffect } from 'react';
import TransactionList from './TransactionList';
import PopupMessage from '../../components/common/PopupMessage';
import '../../styles/Transaction.css';
import { BsSearch } from 'react-icons/bs';
import MonthDropdown from '../../components/common/MonthDropdown';
import Header from '../../components/layout/Header';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Transaction = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Popup state management (similar to Owners, Customers, and Orders components)
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // --- UPDATED: Using '192.168.0.152' is more reliable for web clients ---
        const response = await fetch('http://192.168.0.152:5000/api/payment/transactions');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAllTransactions(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch transactions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    let results = allTransactions;

    if (selectedMonth) {
      const monthIndex = months.indexOf(selectedMonth);
      if (monthIndex > -1) {
        results = results.filter(transaction => {
          const transactionDate = new Date(transaction.createdAt);
          return transactionDate.getMonth() === monthIndex;
        });
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(transaction =>
        (transaction.customTransactionId && transaction.customTransactionId.toLowerCase().includes(term)) ||
        (transaction.customerName && transaction.customerName.toLowerCase().includes(term)) ||
        (transaction.customerPhone && transaction.customerPhone.includes(term)) ||
        (transaction.ownerName && transaction.ownerName.toLowerCase().includes(term))
      );
    }
    
    setFilteredTransactions(results);
  }, [searchTerm, selectedMonth, allTransactions]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = filteredTransactions.map(t => t.customTransactionId);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Show confirmation popup (similar to other components)
  const handleConfirmDelete = (transactionId) => {
    console.log('Transaction selected for deletion:', transactionId);
    setTransactionToDelete(transactionId);
    setShowDeletePopup(true);
  };

  // Actual delete handler with popup confirmation
  const handleDelete = async () => {
    if (!transactionToDelete) return;
    
    try {
      console.log('Attempting to delete transaction with ID:', transactionToDelete);
      console.log('Type of transactionId:', typeof transactionToDelete);
      
      // If you have an API endpoint for deleting transactions, uncomment and modify this:
      // const response = await axios.delete(`http://192.168.0.152:5000/api/payment/transactions/${transactionToDelete}`);
      // console.log('Delete response:', response);
      
      // Filter from local state using customTransactionId
      const updatedTransactions = allTransactions.filter(t => t.customTransactionId !== transactionToDelete);
      setAllTransactions(updatedTransactions);
      
      // Also update filtered transactions to maintain current view
      const updatedFilteredTransactions = filteredTransactions.filter(t => t.customTransactionId !== transactionToDelete);
      setFilteredTransactions(updatedFilteredTransactions);
      
      // Remove from selected items if it was selected
      setSelectedIds(prev => prev.filter(i => i !== transactionToDelete));
      
      setShowDeletePopup(false);
      setTransactionToDelete(null);
      console.log('Transaction deleted successfully');
    } catch (err) {
      console.error('Failed to delete transaction:', err);
      console.error('Error details:', err.response?.data);
      console.error('Status:', err.response?.status);
      
      // Close the popup even if deletion failed
      setShowDeletePopup(false);
      setTransactionToDelete(null);
      
      // Show user-friendly error message
      alert('Failed to delete transaction. Please try again.');
    }
  };

  // Cancel delete popup
  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setTransactionToDelete(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading-state">Loading transactions...</div>;
    }
    if (error) {
      return <div className="error-state">Error: {error}</div>;
    }
    return (
      <TransactionList
        transactions={filteredTransactions}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onDelete={handleConfirmDelete}
      />
    );
  };

  return (
    <div className="page-with-layout">
      <div className="main-content-panel">
        <Header />
        <div className="page-content-wrapper">
          <div className="transaction-page-container">
            <div className="controls-bar">
              <div className="search-wrapper">
                <BsSearch className="search-icon" />
                <input
                  type="search"
                  // --- UPDATED: More descriptive placeholder ---
                  placeholder="Search "
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="content-card">
              <div className="card-header-flex">
                <h2 className="page-title">All Transactions List</h2>
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

export default Transaction;