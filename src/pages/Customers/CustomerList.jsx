// src/pages/Customers/CustomerList.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePagination } from '../../hooks/usePagination';
import { getStatusClass } from '../../utils/customerUtils';

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

  const handleRowClick = (customerPhone) => {
    navigate(`/customers/${customerPhone}`);
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
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '50%',
                          marginRight: '10px'
                        }}
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
                    <Link to={`/customers/${customer.phone}`}>
                      <img src="/assets/view-icon.png" alt="View" title="View Details" />
                    </Link>
                    <img
                      src="/assets/delete-icon.png"
                      alt="Delete"
                      title="Delete Customer"
                      onClick={() => onDelete(customer.phone)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} style={{ textAlign: 'center', padding: '20px' }}>
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

export default CustomerList;