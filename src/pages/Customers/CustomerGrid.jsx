import React from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import { usePagination } from '../../hooks/usePagination';
import { getStatusClass } from '../../utils/customerUtils';
import '../../styles/Customers.css';

export default function CustomerGrid({ customers = [] }) {
  const { currentPage, totalPages, currentItems, handlePageChange } = usePagination(customers, 8);

  return (
    <div className="customer-grid-wrapper">
      <div className="customer-grid">
        {currentItems.length > 0 ? (
          currentItems.map((c) => (
            <div key={c.id} className="customer-card">
              <div className="card-header">
                <img
                  src={c.photo || '/assets/placeholder.png'}
                  alt={c.name}
                  className="customer-photo-large"
                />
                <div className="card-header-right">
                  <FiMoreVertical className="more-options-icon" />
                </div>
              </div>
              <div className="card-body">
                <div className="customer-main-info">
                  <h3>{c.name}</h3>
                  <p>
                    <strong>Email Address :</strong> {c.email || 'N/A'}
                  </p>
                  <p>
                    <strong>Contact Number :</strong> {c.phone}
                  </p>
                </div>
                <div className="social-media">
                  <span>Social Information: </span>
                  <br />
                  <a href="#">
                    <img src="/assets/fb.png" alt="facebook" />
                  </a>
                  <a href="#">
                    <img src="/assets/ig.png" alt="instagram" />
                  </a>
                  <a href="#">
                    <img src="/assets/x.png" alt="twitter" />
                  </a>
                  <a href="#">
                    <img src="/assets/wp.png" alt="whatsapp" />
                  </a>
                </div>
              </div>
              <div className="card-footer">
                <button className="card-btn open-chat-btn">Open Chat</button>
                <button className="card-btn call-btn">Call to Customer</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-data-cell">No customers found.</div>
        )}
      </div>

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
}