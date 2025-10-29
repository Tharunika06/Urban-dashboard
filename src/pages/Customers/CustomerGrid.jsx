// src/pages/Customers/CustomerGrid.jsx
import React, { useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import '../../styles/Customers.css';

export default function CustomerGrid({ customers = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Changed from 6 to 8 for 2 rows of 4 items
  
  const getStatusClass = (status) => {
    return status ? status.toLowerCase().replace(' ', '-') : '';
  };

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
    <div className="customer-grid-wrapper">
      <div className="customer-grid">
        {currentCustomers.length > 0 ? currentCustomers.map((c) => (
          <div key={c.id} className="customer-card">
            <div className="card-header">
              <img src={c.photo || '/assets/placeholder.png'} alt={c.name} className="customer-photo-large" />
              <div className="card-header-right">
                {/* <span className={`status-badge ${getStatusClass(c.status)}`}>
                  {c.status}
                </span> */}
                <FiMoreVertical className="more-options-icon" />
              </div>
            </div>
            <div className="card-body">
              <div className="customer-main-info">
                <h3>{c.name}</h3>
                <p><strong>Email Address :</strong> {c.email || 'N/A'}</p>
                <p><strong>Contact Number :</strong> {c.phone}</p>
              </div>
              {/* <div className="card-stats">
                <div>
                  <span>{c.stats?.ownProperty || 0}</span>
                  <p>Own Property</p>
                </div>
                <div>
                  <span>{c.stats?.investOnProperty || 0}</span>
                  <p>Invest On Property</p>
                </div>
              </div> */}
              <div className="social-media">
                <span>Social Information: </span><br />
                <a href="#"><img src="/assets/fb.png" alt="facebook" /></a>
                <a href="#"><img src="/assets/ig.png" alt="instagram" /></a>
                <a href="#"><img src="/assets/x.png" alt="twitter" /></a>
                <a href="#"><img src="/assets/wp.png" alt="whatsapp" /></a>
              </div>
            </div>
            <div className="card-footer">
              <button className="card-btn open-chat-btn">Open Chat</button>
              <button className="card-btn call-btn">Call to Customer</button>
            </div>
          </div>
        )) : (
          <div className="no-data-cell">No customers found.</div>
        )}
      </div>

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
}