import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import MonthDropdown from '/src/components/common/MonthDropdown.jsx';
import '../../styles/Dashboard.css';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getStatusClass = (status) => (status ? status.toLowerCase() : '');

const TransactionsTable = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get('/payment/transactions');
        setAllTransactions(response.data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch dashboard transactions:", err);
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

    setFilteredTransactions(results.slice(0, 3));
  }, [selectedMonth, allTransactions]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const allChecked = filteredTransactions.length > 0 && selectedRows.length === filteredTransactions.length;

  const handleSelectAll = (checked) => {
    setSelectedRows(checked ? filteredTransactions.map(tx => tx.customTransactionId) : []);
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleDelete = (id) => {
    const updated = allTransactions.filter(tx => tx.customTransactionId !== id);
    setAllTransactions(updated);
    setSelectedRows(prev => prev.filter(rowId => rowId !== id));
  };

  if (isLoading) {
    return <div className="card"><div className="loading-state">Loading transactions...</div></div>;
  }

  if (error) {
    return <div className="card"><div className="error-state">Error: {error}</div></div>;
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
              <th>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  disabled={filteredTransactions.length === 0}
                />
              </th>
              <th>Transaction ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Property Name</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(tx => (
                <tr key={tx._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(tx.customTransactionId)}
                      onChange={() => handleSelectRow(tx.customTransactionId)}
                    />
                  </td>
                  <td>{tx.customTransactionId}</td>
                  <td className="customer-info-cell">
                    <img
                      src={tx.customerPhoto || '/assets/placeholder.png'}
                      alt={tx.customerName || 'Customer'}
                      className="customer-photo"
                    />        
                    <span>{tx.customerName}</span>
                  </td>
                  <td>{tx.customerPhone || 'N/A'}</td>
                  <td>{tx.property?.name || 'N/A'}</td>
                  <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td>{`$${tx.amount.toLocaleString('en-IN')}`}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="dash-action-icons">
                    <Link to={`/transaction/${tx.customTransactionId}`}>
                      <img src="/assets/view-icon.png" alt="View" />
                    </Link>
                    <img
                      src="/assets/delete-icon.png"
                      alt="Delete"
                      onClick={() => handleDelete(tx.customTransactionId)}
                      style={{ cursor: 'pointer'}}
                    />
                    {/* <img src="/assets/edit-icon.png" alt="Edit" style={{ cursor: 'pointer' }} /> */}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data-cell">No transactions found for this period.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card-footer">
        <Link to="/transaction" className="btn-view-all-button">
          View All
        </Link>
      </div>
    </div>
  );
};

export default TransactionsTable;