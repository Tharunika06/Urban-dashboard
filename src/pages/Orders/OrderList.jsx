// src/pages/OrderList.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const OrderList = ({ orders, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const getStatusClass = (status) => {
    return status ? status.toLowerCase().replace(' ', '-') : '';
  };

  // Pagination calculations
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="table-container">
      <table className="order-list-table">
        <thead>
          <tr>
            <th>Customer Photo & Name</th>
            <th>Purchase Date</th>
            <th>Contact</th>
            <th>Property Type</th>
            <th>Amount</th>
            <th>Purchase Properties</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <tr key={order._id}>
                <td>
                  <div className="customer-info-cell">
                    <img 
                      src={order.customerPhoto || '/assets/placeholder.png'}
                      alt={order.customerName || 'Customer'} 
                      className="customer-photo" 
                    />
                    <span>{order.customerName}</span>
                  </div>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{order.customerPhone || 'N/A'}</td>
                <td>{order.property?.type || 'N/A'}</td> 
                <td>{`₹${order.amount.toLocaleString('en-IN')}`}</td>
                <td>{order.property?.name || 'N/A'}</td>
                <td className="action-icons">
                  <Link to={`/transaction/${order.customTransactionId}`}>
                    <img src="/assets/view-icon.png" alt="View" />
                  </Link>
                  <img
                    src="/assets/delete-icon.png"
                    alt="Delete"
                    onClick={() => onDelete(order.customTransactionId)}
                    style={{ cursor: 'pointer' }}
                  />
                  <img src="/assets/edit-icon.png" alt="Edit" />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="no-data-cell">No orders found.</td>
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
