// src/pages/OrderList.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DEFAULTS, ASSET_PATHS, UI_MESSAGES } from '../../utils/constants';
import { 
  calculatePagination, 
  getPaginatedItems, 
  validatePageNumber 
} from '../../utils/paginationUtils';
import { 
  formatCurrency, 
  formatTableDate, 
  getNestedValue 
} from '../../utils/tableUtils';

const OrderList = ({ orders, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  // Pagination calculations using utility
  const { totalPages } = calculatePagination(orders.length, currentPage, itemsPerPage);
  const currentOrders = getPaginatedItems(orders, currentPage, itemsPerPage);

  const handlePageChange = (page) => {
    const validPage = validatePageNumber(page, totalPages);
    setCurrentPage(validPage);
  };

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
    <div className="table-container">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-link"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹ Back
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
            Next ›
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderList;