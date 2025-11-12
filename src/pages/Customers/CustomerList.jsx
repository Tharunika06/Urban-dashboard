import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePagination } from '../../hooks/usePagination';
import { getStatusClass } from '../../utils/customerUtils';

const CustomerList = ({ customers, onDelete }) => {
  const navigate = useNavigate();
  const placeholderPhoto = '/assets/placeholder.png';

  const { currentPage, totalPages, currentItems, handlePageChange } = usePagination(customers, 6);

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

  const handleRowClick = (customerPhone) => {
    navigate(`/customers/${customerPhone}`);
  };

  return (
    <div className="table-container">
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
            currentItems.map((customer) => (
              <tr
                key={customer.phone}
                onClick={() => handleRowClick(customer.phone)}
                style={{ cursor: 'pointer' }}
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
                <td>{customer.interestedProperties}</td>
                <td>{new Date(customer.lastContacted).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(customer.status)}`}>
                    {customer.status}
                  </span>
                </td>
                <td className="action-icons" onClick={(e) => e.stopPropagation()}>
                  <Link to={`/customers/${customer.phone}`}>
                    <img src="/assets/view-icon.png" alt="View" />
                  </Link>
                  <img
                    src="/assets/delete-icon.png"
                    alt="Delete"
                    onClick={() => onDelete(customer.phone)}
                    style={{ cursor: 'pointer' }}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={tableHeaders.length} className="no-data-cell">
                No customers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

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