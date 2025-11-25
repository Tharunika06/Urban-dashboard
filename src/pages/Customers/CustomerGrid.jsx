// src/pages/Customers/CustomerGrid.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMoreVertical } from 'react-icons/fi';
import { usePagination } from '../../hooks/usePagination';
import { getStatusClass } from '../../utils/customerUtils';
import GradientButton from '../../components/common/GradientButton';
import '../../styles/Customers.css';
import { ITEMS_PER_PAGE } from '../../utils/constants';

export default function CustomerGrid({ customers = [] }) {
  const navigate = useNavigate();

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

  const handleCustomerClick = (phone) => {
    navigate(`/customers/${phone}`);
  };

  return (
    <div className="customer-grid-wrapper">
      <div className="customer-grid">
        {currentItems.length > 0 ? (
          currentItems.map((c) => (
            <div 
              key={c.phone || c.id} 
              className="customer-card"
              onClick={() => handleCustomerClick(c.phone)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-header">
                <img
                  src={c.photo || '/assets/placeholder.png'}
                  alt={c.name}
                  className="customer-photo-large"
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '50%'
                  }}
                />
                <div className="card-header-right">
                  <span className={`status-badge ${getStatusClass(c.status)}`}>
                    {c.status || 'Active'}
                  </span>
                  <FiMoreVertical className="more-options-icon" />
                </div>
              </div>
              <div className="card-body">
                <div className="customer-main-info">
                  <h3>{c.name}</h3>
                  <p>
                    <strong>Email Address:</strong> {c.email || 'N/A'}
                  </p>
                  <p>
                    <strong>Contact Number:</strong> {c.phone}
                  </p>
                  <p>
                    <strong>Property Type:</strong> {c.proptype || 'Apartment'}
                  </p>
                  <p>
                    <strong>Last Contacted:</strong>{' '}
                    {c.lastContacted 
                      ? new Date(c.lastContacted).toLocaleDateString() 
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className="social-media">
                  <span>Social Information: </span>
                  <br />
                  <a href="#" onClick={(e) => e.stopPropagation()}>
                    <img src="/assets/fb.png" alt="facebook" />
                  </a>
                  <a href="#" onClick={(e) => e.stopPropagation()}>
                    <img src="/assets/ig.png" alt="instagram" />
                  </a>
                  <a href="#" onClick={(e) => e.stopPropagation()}>
                    <img src="/assets/x.png" alt="twitter" />
                  </a>
                  <a href="#" onClick={(e) => e.stopPropagation()}>
                    <img src="/assets/wp.png" alt="whatsapp" />
                  </a>
                </div>
              </div>
              <div className="card-footer">
                <GradientButton 
                  width="100%" 
                  height="38px"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add chat functionality here
                  }}
                  style={{ marginBottom: '8px' }}
                >
                  Open Chat
                </GradientButton>
                <GradientButton 
                  width="100%" 
                  height="38px"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add call functionality here
                  }}
                >
                  Call Customer
                </GradientButton>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '40px' 
          }}>
            No customers found
          </div>
        )}
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
    </div>
  );
}