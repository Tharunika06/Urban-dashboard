// Transaction.jsx
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import TransactionList from './TransactionList';
import PopupMessage from '../../components/common/PopupMessage';
import MonthDropdown from '../../components/common/MonthDropdown';
import Header from '../../components/layout/Header';
import { BsSearch } from 'react-icons/bs';
import transactionService from '../../services/transactionService';
import { 
  API_CONFIG, 
  DEFAULTS,
  UI_MESSAGES,
  ASSET_PATHS,
  BUTTON_LABELS
} from '../../utils/constants';
import { applyTransactionFilters } from '../../utils/transactionHelpers';
import '../../styles/Transaction.css';

const ITEMS_PER_PAGE = 5;

const Transaction = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState(DEFAULTS.SEARCH_TERM);
  const [selectedMonth, setSelectedMonth] = useState(DEFAULTS.SELECTED_MONTH);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Popup state
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]);

  // Initialize Socket.io client
  useEffect(() => {
    const socket = io(API_CONFIG.BASE_URL);

    // Listen for transaction updates
    socket.on('update-analytics', (data) => {
      if (data.type === 'transaction-updated' || data.type === 'owner-stats-updated') {
        console.log('🔔 Received update event:', data.type);
        fetchTransactions(true); // Silent refresh
      }
    });

    // Cleanup Socket.io connection
    return () => {
      socket.disconnect();
      console.log('🔌 Socket.io disconnected');
    };
  }, []);

  useEffect(() => {
    fetchTransactions();
    // Optional: Add polling as fallback
    const refreshInterval = setInterval(() => {
      fetchTransactions(true);
    }, API_CONFIG.AUTO_REFRESH_INTERVAL);
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchTransactions = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const data = await transactionService.getAllTransactions();
      setAllTransactions(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
      console.error("Failed to fetch transactions:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Filter transactions by search and month
  useEffect(() => {
    const filtered = applyTransactionFilters(allTransactions, {
      searchTerm,
      month: selectedMonth
    });
    setFilteredTransactions(filtered);
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
          const data = await transactionService.deleteTransaction(transactionId);
          if (!data.success) {
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
        const totalPages = Math.ceil(updatedFilteredTransactions.length / ITEMS_PER_PAGE);
        if (currentPage > totalPages) setCurrentPage(totalPages > 0 ? totalPages : 1);

        setShowDeletePopup(false);
        setBulkDeleteIds([]);
        setIsBulkDelete(false);

        alert(`${deletedIds.length} transaction(s) deleted successfully`);
      } else {
        // Single delete
        if (!transactionToDelete) return;

        const data = await transactionService.deleteTransaction(transactionToDelete);

        if (!data.success) {
          throw new Error(data.message || UI_MESSAGES.DELETE_FAILED);
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
        const totalPages = Math.ceil(updatedFilteredTransactions.length / ITEMS_PER_PAGE);
        if (currentPage > totalPages) setCurrentPage(totalPages > 0 ? totalPages : 1);

        setShowDeletePopup(false);
        setTransactionToDelete(null);
      }
    } catch (err) {
      console.error('Failed to delete transaction(s):', err);
      alert(`${UI_MESSAGES.DELETE_FAILED}: ${err.message}`);
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
                  placeholder={DEFAULTS.SEARCH_TERM || "Search"}
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
          title={isBulkDelete ? UI_MESSAGES.DELETE_BULK_TITLE : UI_MESSAGES.DELETE_SINGLE_TITLE}
          message={
            isBulkDelete
              ? `${UI_MESSAGES.DELETE_BULK_MESSAGE_PREFIX} ${bulkDeleteIds.length} selected transaction(s)? ${UI_MESSAGES.DELETE_BULK_MESSAGE_SUFFIX}`
              : UI_MESSAGES.DELETE_SINGLE_MESSAGE
          }
          icon={ASSET_PATHS.REMOVE_ICON}
          confirmLabel={BUTTON_LABELS.DELETE}
          cancelLabel={BUTTON_LABELS.CANCEL}
          onConfirm={confirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
};

export default Transaction;