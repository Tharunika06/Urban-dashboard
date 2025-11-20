// src/pages/Customers/CustomerList.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePagination } from '../../hooks/usePagination';
import { getStatusClass } from '../../utils/customerUtils';
import '../../styles/Customers.css';

const ITEMS_PER_PAGE = 6;

const CustomerList = ({ customers, onDelete }) => {
  const navigate = useNavigate();
  const placeholderPhoto = '/assets/placeholder.png';

  // Use pagination hook
  const {
    currentPage,
    totalPages,
    currentItems,
    handlePageChange,
    nextPage,
    prevPage,
    hasNextPage,
    hasPrevPage
  } = usePagination(customers, ITEMS_PER_PAGE);

  const tableHeaders = [
    'Customer Photo & Name',
    'Email',
    'Contact',
    'Property Type',
    'Last Property',
    'Last Contacted',
    'Status',
    'Action',
  ];

  const handleRowClick = (customer) => {
    // Ensure we have a valid identifier
    const identifier = customer.phone || customer._id;
    if (identifier) {
      console.log('Navigating to customer:', identifier);
      navigate(`/customers/${encodeURIComponent(identifier)}`);
    } else {
      console.error('No valid identifier found for customer:', customer);
    }
  };

  return (
    <>
      <div className="table-scroll-container">
        <table className="customer-list-table">
          <thead>
            <tr>
              {tableHeaders.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((customer) => {
                const customerId = customer.phone || customer._id;
                return (
                  <tr 
                    key={customerId}
                    onClick={() => handleRowClick(customer)}
                    className="customer-row"
                  >
                    <td>
                      <div className="customer-info-cell">
                        <img
                          src={customer.photo || placeholderPhoto}
                          alt={customer.name}
                          className="customer-photo"
                        />
                        <span>{customer.name}</span>
                      </div>
                    </td>
                    <td>{customer.email || 'N/A'}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.proptype || 'Apartment'}</td>
                    <td>{customer.interestedProperties || 'N/A'}</td>
                    <td>
                      {customer.lastContacted 
                        ? new Date(customer.lastContacted).toLocaleDateString() 
                        : 'N/A'
                      }
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(customer.status)}`}>
                        {customer.status || 'Active'}
                      </span>
                    </td>
                    <td className="action-icons" onClick={(e) => e.stopPropagation()}>
                      <Link to={`/customers/${encodeURIComponent(customerId)}`}>
                        <img src="/assets/view-icon.png" alt="View" title="View Details" />
                      </Link>
                      <img
                        src="/assets/delete-icon.png"
                        alt="Delete"
                        title="Delete Customer"
                        onClick={() => onDelete(customer.phone)}
                        className="delete-icon"
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="no-customers-cell">
                  No customers found
                </td>
              </tr>
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
              className={`pagination-btn ${!hasPrevPage ? 'disabled' : ''}`}
            >
              <span>‹</span> Back
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={nextPage}
              disabled={!hasNextPage}
              className={`pagination-btn ${!hasNextPage ? 'disabled' : ''}`}
            >
              Next <span>›</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerList;