// TransactionList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Checkbox from '../../components/common/Checkbox';
import { usePagination } from '../../hooks/usePagination';
import { ASSET_PATHS, DEFAULTS } from '../../utils/constants';
import { 
  formatTransactionDate, 
  formatAmount,
  getSelectedIds,
  toggleAllItems,
  toggleSingleItem
} from '../../utils/transactionHelpers';

const ITEMS_PER_PAGE = 6;

const TransactionList = ({ 
  transactions, 
  handleDelete, 
  handleBulkDelete
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [checkedRows, setCheckedRows] = useState({});

  // Use pagination hook with all available features
  const {
    currentPage,
    totalPages,
    currentItems: currentTransactions,
    handlePageChange,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage
  } = usePagination(transactions, ITEMS_PER_PAGE);

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
    const updated = toggleAllItems(currentTransactions, selectAll, 'customTransactionId');
    setCheckedRows(updated);
    setSelectAll(!selectAll);
  }

  const toggleCheckbox = (id) => {
    const result = toggleSingleItem(checkedRows, id, currentTransactions, 'customTransactionId');
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
            {currentTransactions.length === 0 ? (
              <tr>
                <td colSpan={tableHeaders.length} style={{ textAlign: 'center', padding: '20px' }}>
                  No transactions found
                </td>
              </tr>
            ) : (
              currentTransactions.map((transaction) => (
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
              onClick={prevPage}
              disabled={!hasPrevPage}
              style={{
                padding: '10px 20px',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: hasPrevPage ? 'pointer' : 'not-allowed',
                opacity: hasPrevPage ? 1 : 0.5,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>‹</span> Back
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                style={{
                  width: '45px',
                  height: '45px',
                  padding: '10px',
                  background: currentPage === i + 1 
                    ? 'linear-gradient(180deg, #474747 0%, #000000 100%)' 
                    : 'white',
                  color: currentPage === i + 1 ? '#fff' : '#000',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: currentPage === i + 1 ? '600' : '400'
                }}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={nextPage}
              disabled={!hasNextPage}
              style={{
                padding: '10px 20px',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: hasNextPage ? 'pointer' : 'not-allowed',
                opacity: hasNextPage ? 1 : 0.5,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              Next <span>›</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionList;