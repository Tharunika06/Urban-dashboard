// TransactionList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Checkbox from '../../components/common/Checkbox';
import { ASSET_PATHS, DEFAULTS } from '../../utils/constants';
import { 
  formatTransactionDate, 
  formatAmount,
  getSelectedIds,
  toggleAllItems,
  toggleSingleItem
} from '../../utils/transactionHelpers';

const TransactionList = ({ 
  transactions, 
  handleDelete, 
  handleBulkDelete,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [checkedRows, setCheckedRows] = useState({});

  const tableHeaders = [
    { 
      label: <Checkbox checked={selectAll} onChange={handleSelectAll} />,
      key: 'checkbox'
    },
    { label: 'Customer Photo & Name', key: 'customer' },
    { label: 'Purchase Date', key: 'date' },
    { label: 'Contact', key: 'contact' },
    { label: 'Property Type', key: 'propertyType' },
    { label: 'Amount', key: 'amount' },
    { label: 'Purchase Properties', key: 'property' },
    { label: 'Action', key: 'action' }
  ];

  // Reset selections when page or transactions change
  useEffect(() => {
    setSelectAll(false);
    setCheckedRows({});
  }, [currentPage, transactions]);

  function handleSelectAll() {
    const updated = toggleAllItems(transactions, selectAll, 'customTransactionId');
    setCheckedRows(updated);
    setSelectAll(!selectAll);
  }

  const toggleCheckbox = (id) => {
    const result = toggleSingleItem(checkedRows, id, transactions, 'customTransactionId');
    setCheckedRows(result.checkedRows);
    setSelectAll(result.selectAll);
  };

  const handleBulkDeleteClick = () => {
    const ids = getSelectedIds(checkedRows);
    if (ids.length > 0) {
      handleBulkDelete(ids);
      setCheckedRows({});
      setSelectAll(false);
    }
  };

  const selectedCount = getSelectedIds(checkedRows).length;

  return (
    <>
      {selectedCount > 0 && (
        <div className="bulk-actions-bar">
          <span className="selected-count">{selectedCount} selected</span>
          <button className="bulk-delete-btn" onClick={handleBulkDeleteClick}>
            Delete Selected
          </button>
        </div>
      )}

      <div className="table-scroll-container">
        <table className="transaction-table">
          <thead>
            <tr>
              {tableHeaders.map((header) => (
                <th key={header.key}>{header.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={tableHeaders.length} style={{ textAlign: 'center', padding: '20px' }}>
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction._id || transaction.customTransactionId}>
                  <td>
                    <Checkbox
                      checked={checkedRows[transaction.customTransactionId] || false}
                      onChange={() => toggleCheckbox(transaction.customTransactionId)}
                    />
                  </td>
                  <td>
                    <div className="customer-info-cell">
                      <img
                        src={transaction.customerPhoto || DEFAULTS.PLACEHOLDER_IMAGE}
                        alt={transaction.customerName || 'Customer'}
                        className="customer-photo"
                        onError={(e) => e.target.src = DEFAULTS.PLACEHOLDER_IMAGE}
                      />
                      <span>{transaction.customerName || 'N/A'}</span>
                    </div>
                  </td>
                  <td>{formatTransactionDate(transaction.createdAt)}</td>
                  <td>{transaction.customerPhone || 'N/A'}</td>
                  <td>{transaction.property?.type || transaction.propertyType || 'N/A'}</td>
                  <td>{formatAmount(transaction.amount)}</td>
                  <td>{transaction.property?.name || transaction.propertyName || 'N/A'}</td>
                  <td className="action-icons">
                    <Link to={`/transaction/${transaction.customTransactionId}`}>
                      <img src={ASSET_PATHS.VIEW_ICON} alt="View" />
                    </Link>
                    <img
                      src={ASSET_PATHS.DELETE_ICON}
                      alt="Delete"
                      onClick={() => handleDelete(transaction.customTransactionId)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-wrapper">
          <div className="pagination">
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              « Back
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`page-link ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => onPageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-link"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next »
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionList;