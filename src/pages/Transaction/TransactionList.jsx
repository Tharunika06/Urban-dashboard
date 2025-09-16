// src/pages/Transaction/TransactionList.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TransactionList = ({ transactions, selectedIds, onSelectAll, onSelectOne, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const getStatusClass = (status) => (status ? status.toLowerCase() : '');

  // Pagination calculations
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, startIndex + itemsPerPage);

  const allChecked =
    currentTransactions.length > 0 &&
    currentTransactions.every((t) => selectedIds.includes(t.customTransactionId));

  const handleSelectAll = (checked) => {
    onSelectAll(checked, currentTransactions.map((t) => t.customTransactionId));
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="table-container">
      <table className="transaction-list-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => handleSelectAll(e.target.checked)}
                disabled={currentTransactions.length === 0}
              />
            </th>
            <th>Transaction ID</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Date</th>
            <th>Payment Method</th>
            <th>Amount</th>
            <th>Property Name</th>
            <th>Owner Name</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentTransactions.length > 0 ? (
            currentTransactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(transaction.customTransactionId)}
                    onChange={() => onSelectOne(transaction.customTransactionId)}
                  />
                </td>
                <td className="transaction-id">{transaction.customTransactionId}</td>
                <td>
                  <div className="customer-info-cell">
                    <img
                      src={transaction.customerPhoto || '/assets/placeholder.png'}
                      alt={transaction.customerName || 'Customer'}
                      className="customer-photo"
                    />
                    <span>{transaction.customerName}</span>
                  </div>
                </td>
                <td>{transaction.customerPhone || 'N/A'}</td>
                <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                <td>{transaction.paymentMethod}</td>
                <td>{`$${transaction.amount.toLocaleString('en-IN')}`}</td>
                <td>{transaction.property ? transaction.property.name : 'N/A'}</td>
                <td>{transaction.ownerName}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(transaction.status)}`}>
                    {transaction.status}
                  </span>
                </td>
                <td className="action-icons">
                  <Link to={`/transaction/${transaction.customTransactionId}`}>
                    <img src="/assets/view-icon.png" alt="View" />
                  </Link>
                  <img
                    src="/assets/delete-icon.png"
                    alt="Delete"
                    onClick={() => onDelete(transaction.customTransactionId)}
                    style={{ cursor: 'pointer' }}
                  />
                  <img src="/assets/edit-icon.png" alt="Edit" />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className="no-data-cell">
                No transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-link"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            « Back
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`page-link ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="page-link"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next »
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
