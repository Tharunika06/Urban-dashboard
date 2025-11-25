// src/pages/OrderList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { usePagination } from '../../hooks/usePagination';
import { DEFAULTS, ASSET_PATHS, UI_MESSAGES, ITEMS_PER_PAGE } from '../../utils/constants';
import { 
  formatCurrency, 
  formatTableDate, 
  getNestedValue 
} from '../../utils/tableUtils';



const OrderList = ({ orders, onDelete }) => {
  // Use pagination hook with all available features
  const {
    currentPage,
    totalPages,
    currentItems: currentOrders,
    handlePageChange,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage
  } = usePagination(orders, ITEMS_PER_PAGE);

  // Table headers configuration
  const tableHeaders = [
    'Customer Photo & Name',
    'Purchase Date',
    'Contact',
    'Property Type',
    'Amount',
    'Purchase Properties',
    'Action'
  ];

  // Render cell content based on column using utilities
  const renderCell = (order, header) => {
    switch (header) {
      case 'Customer Photo & Name':
        return (
          <div className="customer-info-cell">
            <img 
              src={order.customerPhoto || DEFAULTS.PLACEHOLDER_IMAGE}
              alt={order.customerName || 'Customer'} 
              className="customer-photo" 
            />
            <span>{order.customerName}</span>
          </div>
        );
      case 'Purchase Date':
        return formatTableDate(order.createdAt);
      case 'Contact':
        return order.customerPhone || 'N/A';
      case 'Property Type':
        return getNestedValue(order, 'property.type');
      case 'Amount':
        return formatCurrency(order.amount);
      case 'Purchase Properties':
        return getNestedValue(order, 'property.name');
      case 'Action':
        return (
          <div className="action-icons">
            <Link to={`/transaction/${order.customTransactionId}`}>
              <img src={ASSET_PATHS.VIEW_ICON} alt="View" />
            </Link>
            <img
              src={ASSET_PATHS.DELETE_ICON}
              alt="Delete"
              onClick={() => onDelete(order.customTransactionId)}
              style={{ cursor: 'pointer' }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="table-scroll-container">
        <table className="order-list-table">
          <thead>
            <tr>
              {tableHeaders.map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <tr key={order._id}>
                  {tableHeaders.map((header) => (
                    <td key={`${order._id}-${header}`}>
                      {renderCell(order, header)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="no-data-cell">
                  {UI_MESSAGES.NO_ORDERS_FOUND}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Matching PropertyList style */}
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

export default OrderList;