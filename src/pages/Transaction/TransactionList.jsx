// TransactionList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Checkbox from '../../components/common/Checkbox';

const ITEMS_PER_PAGE = 7;

const TransactionList = ({ 
  transactions, 
  handleDelete, 
  handleBulkDelete, 
  currentPage, 
  setCurrentPage 
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [checkedRows, setCheckedRows] = useState({});

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTransactions = transactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset checkboxes when page changes or transactions change
  useEffect(() => {
    setSelectAll(false);
    setCheckedRows({});
  }, [currentPage, transactions]);

  const getStatusClass = (status) => (status ? status.toLowerCase() : '');
  
  // Function to get purchase type badge class
  const getPurchaseTypeClass = (purchaseType) => {
    switch (purchaseType?.toLowerCase()) {
      case 'buy':
      case 'sale': // Handle both 'buy' and 'sale' for backward compatibility
        return 'purchase-type-buy';
      case 'rent':
        return 'purchase-type-rent';
      default:
        return 'purchase-type-unknown';
    }
  };

  // Function to format purchase type for display
  const formatPurchaseType = (purchaseType) => {
    switch (purchaseType?.toLowerCase()) {
      case 'buy':
      case 'sale': // Handle both 'buy' and 'sale' for backward compatibility
        return 'Buy';
      case 'rent':
        return 'Rent';
      default:
        return 'N/A';
    }
  };

  const handleSelectAll = () => {
    const updated = {};
    currentTransactions.forEach((t) => {
      updated[t.customTransactionId] = !selectAll;
    });
    setCheckedRows(updated);
    setSelectAll(!selectAll);
  };

  const toggleCheckbox = (id) => {
    setCheckedRows(prev => {
      const newChecked = { ...prev, [id]: !prev[id] };
      
      // Check if all current page items are selected
      const allSelected = currentTransactions.every(
        t => newChecked[t.customTransactionId]
      );
      setSelectAll(allSelected);
      
      return newChecked;
    });
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setSelectAll(false);
    setCheckedRows({});
  };

  const getImageSrc = (photo) => {
    if (photo && photo.startsWith('data:image/')) return photo;
    if (photo && photo.startsWith('/uploads/')) return `http://192.168.0.152:5000${photo}`;
    return '/assets/placeholder.png';
  };

  const handleImageError = (e) => {
    e.target.src = '/assets/placeholder.png';
  };

  // Get selected transaction IDs
  const getSelectedIds = () => {
    return Object.keys(checkedRows).filter(id => checkedRows[id]);
  };

  const selectedCount = getSelectedIds().length;

  const handleBulkDeleteClick = () => {
    const selectedIds = getSelectedIds();
    if (selectedIds.length > 0) {
      handleBulkDelete(selectedIds);
    }
  };

  return (
    <>
      {selectedCount > 0 && (
        <div className="bulk-actions-bar">
          <span className="selected-count">{selectedCount} selected</span>
          <button 
            className="bulk-delete-btn"
            onClick={handleBulkDeleteClick}
          >
            Delete Selected
          </button>
        </div>
      )}

      <div className="table-container">
        <table className="transaction-list-table">
          <thead>
            <tr>
              <th>
                <Checkbox 
                  checked={selectAll} 
                  onChange={handleSelectAll}
                  id="select-all-checkbox"
                />
              </th>
              <th>Transaction ID</th>
              <th>Customer Photo & Name</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Payment Method</th>
              <th>Amount</th>
              <th>Purchase Type</th>
              <th>Property Name</th>
              <th>Owner Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.length > 0 ? (
              currentTransactions.map((transaction) => {
                // Get purchase type from either field for backward compatibility
                const purchaseType = transaction.purchaseType || transaction.transactionType || 'buy';
                
                return (
                  <tr key={transaction._id}>
                    <td>
                      <Checkbox
                        checked={checkedRows[transaction.customTransactionId] || false}
                        onChange={() => toggleCheckbox(transaction.customTransactionId)}
                        id={`checkbox-${transaction.customTransactionId}`}
                      />
                    </td>
                    <td>{transaction.customTransactionId}</td>
                    <td>
                      <div className="customer-info-cell">
                        <img
                          src={getImageSrc(transaction.customerPhoto)}
                          alt={transaction.customerName || 'Customer'}
                          className="customer-photo"
                          onError={handleImageError}
                        />
                        <span>{transaction.customerName}</span>
                      </div>
                    </td>
                    <td>{transaction.customerPhone || 'N/A'}</td>
                    <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                    <td>{transaction.paymentMethod}</td>
                    <td>{`₹${transaction.amount.toLocaleString('en-IN')}`}</td>
                    <td>
                      <span className={`purchase-type-badge ${getPurchaseTypeClass(purchaseType)}`}>
                        {formatPurchaseType(purchaseType)}
                      </span>
                    </td>
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
                        onClick={() => handleDelete(transaction.customTransactionId)}
                        style={{ cursor: 'pointer' }}
                      />
                      {/* <Link to={`/transaction/edit/${transaction.customTransactionId}`}>
                        <img src="/assets/edit-icon.png" alt="Edit" />
                      </Link> */}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="12" className="no-data-cell">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
    </>
  );
};

export default TransactionList;