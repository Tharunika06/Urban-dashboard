// src/pages/Customers/CustomerList.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CustomerList = ({ customers, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const placeholderPhoto = '/assets/placeholder.png';

  const getStatusClass = (status) => (status ? status.toLowerCase().replace(' ', '-') : '');

  // Pagination calculations
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = customers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="table-container">
      <table className="customer-list-table">
        <thead>
          <tr>
            <th>Customer Photo & Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Property Type</th>
            <th>Last Property</th>
            <th>Last Contacted</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentCustomers.length > 0 ? (
            currentCustomers.map((customer) => (
              <tr key={customer.phone}>
                <td>
                  <div className="customer-info-cell">
                    <img src={customer.photo || placeholderPhoto} alt={customer.name} className="customer-photo" />
                    <span>{customer.name}</span>
                  </div>
                </td>
                <td>{customer.email || 'N/A'}</td>
                <td>{customer.phone}</td>
                <td>{customer.proptype || 'Apartment'}</td>
                <td>{customer.interestedProperties}</td>
                <td>{new Date(customer.lastContacted).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(customer.status)}`}>
                    {customer.status}
                  </span>
                </td>
                <td className="action-icons">
                  <Link to={`/customers/${customer.phone}`}>
                    <img src="/assets/view-icon.png" alt="View" />
                  </Link>
                  <img
                    src="/assets/delete-icon.png"
                    alt="Delete"
                    onClick={() => onDelete(customer.phone)}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* <img src="/assets/edit-icon.png" alt="Edit" /> */}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="no-data-cell">No customers found.</td>
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

export default CustomerList;
  