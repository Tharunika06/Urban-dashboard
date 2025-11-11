// TransactionList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Checkbox from '../../components/common/Checkbox';
import PopupMessage from '../../components/common/PopupMessage';
import { 
  API_CONFIG, 
  DEFAULTS,
  ASSET_PATHS,
  UI_MESSAGES,
  BUTTON_LABELS,
  getStatusClass 
} from '../../utils/constants';
import {
  calculateTransactionPagination,
  getPurchaseTypeClass,
  formatPurchaseType,
  getSelectedIds,
  toggleAllItems,
  toggleSingleItem,
  getImageSrc,
  handleImageError as getImageErrorHandler,
  formatTransactionDate,
  formatAmount
} from '../../utils/transactionHelpers';

const ITEMS_PER_PAGE = 5;

const TransactionList = ({
  transactions,
  handleDelete,
  handleBulkDelete,
  currentPage,
  setCurrentPage,
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [checkedRows, setCheckedRows] = useState({});
  const [showBulkDeletePopup, setShowBulkDeletePopup] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const tableHeaders = [
    { 
      label: <Checkbox checked={selectAll} onChange={handleSelectAll} id="select-all-checkbox" />,
      key: 'checkbox'
    },
    { label: 'Transaction ID', key: 'transactionId' },
    { label: 'Customer Photo & Name', key: 'customerName' },
    { label: 'Phone', key: 'phone' },
    { label: 'Date', key: 'date' },
    { label: 'Payment Method', key: 'paymentMethod' },
    { label: 'Amount', key: 'amount' },
    { label: 'Purchase Type', key: 'purchaseType' },
    { label: 'Property Name', key: 'propertyName' },
    { label: 'Owner Name', key: 'ownerName' },
    { label: 'Status', key: 'status' },
    { label: 'Action', key: 'action' }
  ];

  const pagination = calculateTransactionPagination(transactions, currentPage, ITEMS_PER_PAGE);
  const { totalPages, currentItems: currentTransactions } = pagination;

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
    const result = toggleSingleItem(
      checkedRows, 
      id, 
      currentTransactions, 
      'customTransactionId'
    );
    setCheckedRows(result.checkedRows);
    setSelectAll(result.selectAll);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setSelectAll(false);
    setCheckedRows({});
  };

  const handleImageErrorWrapper = (e) => {
    getImageErrorHandler(e, DEFAULTS.PLACEHOLDER_IMAGE);
  };

  const selectedCount = getSelectedIds(checkedRows).length;

  const handleBulkDeleteClick = () => {
    const ids = getSelectedIds(checkedRows);
    if (ids.length > 0) {
      setSelectedIds(ids);
      setShowBulkDeletePopup(true);
    }
  };

  const confirmBulkDelete = () => {
    handleBulkDelete(selectedIds);
    setShowBulkDeletePopup(false);
    setSelectedIds([]);
  };

  const cancelBulkDelete = () => {
    setShowBulkDeletePopup(false);
    setSelectedIds([]);
  };

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

      {showBulkDeletePopup && (
        <PopupMessage
          title={UI_MESSAGES.DELETE_BULK_TITLE}
          message={`${UI_MESSAGES.DELETE_BULK_MESSAGE_PREFIX} ${selectedIds.length} transaction(s)? ${UI_MESSAGES.DELETE_BULK_MESSAGE_SUFFIX}`}
          icon={ASSET_PATHS.REMOVE_ICON}
          confirmLabel={BUTTON_LABELS.DELETE}
          cancelLabel={BUTTON_LABELS.CANCEL}
          onConfirm={confirmBulkDelete}
          onCancel={cancelBulkDelete}
        />
      )}

      <div className="table-container">
        <table className="transaction-list-table">
          <thead>
            <tr>
              {tableHeaders.map((header) => (
                <th key={header.key}>{header.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentTransactions.length > 0 ? (
              currentTransactions.map((transaction) => {
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
                          src={getImageSrc(
                            transaction.customerPhoto,
                            API_CONFIG.BASE_URL,
                            DEFAULTS.PLACEHOLDER_IMAGE
                          )}
                          alt={transaction.customerName || 'Customer'}
                          className="customer-photo"
                          onError={handleImageErrorWrapper}
                        />
                        <span>{transaction.customerName}</span>
                      </div>
                    </td>
                    <td>{transaction.customerPhone || 'N/A'}</td>
                    <td>{formatTransactionDate(transaction.createdAt)}</td>
                    <td>{transaction.paymentMethod}</td>
                    <td>{formatAmount(transaction.amount)}</td>
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
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="no-data-cell">
                  No transactions found.
                </td>
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