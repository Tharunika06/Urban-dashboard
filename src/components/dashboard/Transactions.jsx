// src/components/dashboard/Transactions.jsx 
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchTransactions, deleteTransaction } from '../../services/dashboardService';
import MonthDropdown from '/src/components/common/MonthDropdown.jsx';
import GradientButton from '../../components/common/GradientButton';
import Checkbox from '../../components/common/Checkbox';
import { 
  MONTHS_FULL, 
  getStatusClass, 
  formatters,
  DEFAULTS,
  API_CONFIG
} from '../../utils/constants';
import '../../styles/Dashboard.css';

const TransactionsTable = () => {
  const navigate = useNavigate();
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Table headers configuration
  const tableHeaders = [
    { key: 'checkbox', label: '', isCheckbox: true },
    { key: 'transactionId', label: 'Transaction ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'phone', label: 'Phone' },
    { key: 'propertyName', label: 'Property Name' },
    { key: 'date', label: 'Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Action' }
  ];

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await fetchTransactions();
        setAllTransactions(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch dashboard transactions");
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, []);

  useEffect(() => {
    let results = allTransactions;

    if (selectedMonth) {
      const monthIndex = MONTHS_FULL.indexOf(selectedMonth);
      if (monthIndex > -1) {
        results = results.filter(transaction => {
          const transactionDate = new Date(transaction.createdAt);
          return transactionDate.getMonth() === monthIndex;
        });
      }
    }

    setFilteredTransactions(results.slice(0, DEFAULTS.TRANSACTION_LIMIT));
  }, [selectedMonth, allTransactions]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const allChecked = filteredTransactions.length > 0 && selectedRows.length === filteredTransactions.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < filteredTransactions.length;

  const handleSelectAll = (e) => {
    setSelectedRows(e.target.checked ? filteredTransactions.map(tx => tx.customTransactionId) : []);
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id) => {
    try {
      await deleteTransaction(id);
      const updated = allTransactions.filter(tx => tx.customTransactionId !== id);
      setAllTransactions(updated);
      setSelectedRows(prev => prev.filter(rowId => rowId !== id));
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      alert("Failed to delete transaction. Please try again.");
    }
  };

  // Get customer photo with proper base URL
  const getCustomerPhoto = (photo) => {
    if (photo && photo.startsWith('data:image/')) return photo;
    if (photo && photo.startsWith('/uploads/')) return `${API_CONFIG.BASE_URL}${photo}`;
    return DEFAULTS.PLACEHOLDER_IMAGE;
  };

  // Render table cell content based on key
  const renderCellContent = (tx, headerKey) => {
    switch (headerKey) {
      case 'checkbox':
        return (
          <Checkbox
            checked={selectedRows.includes(tx.customTransactionId)}
            onChange={() => handleSelectRow(tx.customTransactionId)}
            id={`checkbox-${tx.customTransactionId}`}
          />
        );
      
      case 'transactionId':
        return tx.customTransactionId;
      
      case 'customer':
        return (
          <div className="customer-info-cell">
            <img
              src={getCustomerPhoto(tx.customerPhoto)}
              alt={tx.customerName || 'Customer'}
              className="customer-photo"
              onError={(e) => { e.target.src = DEFAULTS.PLACEHOLDER_IMAGE; }}
            />        
            <span>{tx.customerName}</span>
          </div>
        );
      
      case 'phone':
        return tx.customerPhone || 'N/A';
      
      case 'propertyName':
        return tx.property?.name || 'N/A';
      
      case 'date':
        return formatters.date(tx.createdAt);
      
      case 'amount':
        return formatters.amount(tx.amount);
      
      case 'status':
        return (
          <span className={`status-badge ${getStatusClass(tx.status)}`}>
            {tx.status}
          </span>
        );
      
      case 'action':
        return (
          <div className="dash-action-icons">
            <Link to={`/transaction/${tx.customTransactionId}`}>
              <img src="/assets/view-icon.png" alt="View" />
            </Link>
            <img
              src="/assets/delete-icon.png"
              alt="Delete"
              onClick={() => handleDelete(tx.customTransactionId)}
              style={{ cursor: 'pointer' }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="loading-state">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-state">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="card-title">Latest Transactions</h3>
        <MonthDropdown onChange={handleMonthChange} />
      </div>

      <div className="table-responsive">
        <table className="transactions-table">
          <thead>
            <tr>
              {tableHeaders.map((header) => (
                <th key={header.key}>
                  {header.isCheckbox ? (
                    <Checkbox
                      checked={allChecked}
                      onChange={handleSelectAll}
                      disabled={filteredTransactions.length === 0}
                      indeterminate={isIndeterminate}
                      id="select-all-checkbox"
                    />
                  ) : (
                    header.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(tx => (
                <tr key={tx._id}>
                  {tableHeaders.map((header) => (
                    <td key={`${tx._id}-${header.key}`}>
                      {renderCellContent(tx, header.key)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="no-data-cell">
                  No transactions found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card-footer">
        <GradientButton 
          buttonSize="medium"
          onClick={() => navigate('/transaction')}
        >
          View All
        </GradientButton>
      </div>
    </div>
  );
};

export default TransactionsTable;