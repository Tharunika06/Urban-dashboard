// Transaction.jsx
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Popup state
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://192.168.0.154:5000/api/payment/transactions');
        if (!response.ok) throw new Error('Network response was not ok');
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

  // Filter transactions by search and month
  useEffect(() => {
    let results = allTransactions;

    if (selectedMonth) {
      const monthIndex = months.indexOf(selectedMonth);
      if (monthIndex > -1) {
        results = results.filter(t => new Date(t.createdAt).getMonth() === monthIndex);
      }
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(t =>
        (t.customTransactionId && t.customTransactionId.toLowerCase().includes(term)) ||
        (t.customerName && t.customerName.toLowerCase().includes(term)) ||
        (t.customerPhone && t.customerPhone.includes(term)) ||
        (t.ownerName && t.ownerName.toLowerCase().includes(term))
      );
    }

    setFilteredTransactions(results);
    setCurrentPage(1); // Reset page when filter changes
  }, [searchTerm, selectedMonth, allTransactions]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  // Show delete popup for single transaction
  const handleDelete = (transactionId) => {
    setTransactionToDelete(transactionId);
    setIsBulkDelete(false);
    setShowDeletePopup(true);
  };

  // Show delete popup for bulk deletion
  const handleBulkDelete = (selectedIds) => {
    setBulkDeleteIds(selectedIds);
    setIsBulkDelete(true);
    setShowDeletePopup(true);
  };

  // Confirm deletion (single or bulk)
  const confirmDelete = async () => {
    try {
      if (isBulkDelete) {
        // Bulk delete
        const deletePromises = bulkDeleteIds.map(async (transactionId) => {
          const encodedTransactionId = encodeURIComponent(transactionId);
          const response = await fetch(
            `http://192.168.0.154:5000/api/payment/transactions/${encodedTransactionId}`,
            { method: 'DELETE', headers: { 'Content-Type': 'application/json' } }
          );
          const data = await response.json();
          if (!response.ok || !data.success) {
            throw new Error(data.message || `Failed to delete transaction ${transactionId}`);
          }
          return transactionId;
        });

        const deletedIds = await Promise.all(deletePromises);

        // Update frontend state
        const updatedTransactions = allTransactions.filter(
          t => !deletedIds.includes(t.customTransactionId)
        );
        setAllTransactions(updatedTransactions);

        const updatedFilteredTransactions = filteredTransactions.filter(
          t => !deletedIds.includes(t.customTransactionId)
        );
        setFilteredTransactions(updatedFilteredTransactions);

        // Reset pagination if current page becomes empty
        const ITEMS_PER_PAGE = 7;
        const totalPages = Math.ceil(updatedFilteredTransactions.length / ITEMS_PER_PAGE);
        if (currentPage > totalPages) setCurrentPage(totalPages > 0 ? totalPages : 1);

        setShowDeletePopup(false);
        setBulkDeleteIds([]);
        setIsBulkDelete(false);

        alert(`${deletedIds.length} transaction(s) deleted successfully`);
      } else {
        // Single delete
        if (!transactionToDelete) return;

        const encodedTransactionId = encodeURIComponent(transactionToDelete);
        const response = await fetch(
          `http://192.168.0.154:5000/api/payment/transactions/${encodedTransactionId}`,
          { method: 'DELETE', headers: { 'Content-Type': 'application/json' } }
        );
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to delete transaction');
        }

        // Update frontend state
        const updatedTransactions = allTransactions.filter(
          t => t.customTransactionId !== transactionToDelete
        );
        setAllTransactions(updatedTransactions);

        const updatedFilteredTransactions = filteredTransactions.filter(
          t => t.customTransactionId !== transactionToDelete
        );
        setFilteredTransactions(updatedFilteredTransactions);

        // Reset pagination if current page becomes empty
        const ITEMS_PER_PAGE = 7;
        const totalPages = Math.ceil(updatedFilteredTransactions.length / ITEMS_PER_PAGE);
        if (currentPage > totalPages) setCurrentPage(totalPages > 0 ? totalPages : 1);

        setShowDeletePopup(false);
        setTransactionToDelete(null);

        // alert('Transaction deleted successfully');
      }
    } catch (err) {
      console.error('Failed to delete transaction(s):', err);
      alert(`Failed to delete transaction(s): ${err.message}`);
      setShowDeletePopup(false);
      setTransactionToDelete(null);
      setBulkDeleteIds([]);
      setIsBulkDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setTransactionToDelete(null);
    setBulkDeleteIds([]);
    setIsBulkDelete(false);
  };

  const renderContent = () => {
    if (isLoading) return <div className="loading-state">Loading transactions...</div>;
    if (error) return <div className="error-state">Error: {error}</div>;

    return (
      <TransactionList
        transactions={filteredTransactions}
        handleDelete={handleDelete}
        handleBulkDelete={handleBulkDelete}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
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
                  placeholder="Search"
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

      {showDeletePopup && (
        <PopupMessage
          message={
            isBulkDelete
              ? `Are you sure you want to delete ${bulkDeleteIds.length} selected transaction(s)?`
              : 'Are you sure you want to delete this transaction?'
          }
          onConfirm={confirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default Transaction;