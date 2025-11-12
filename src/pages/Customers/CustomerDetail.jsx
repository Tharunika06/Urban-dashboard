// src/pages/Customers/CustomerDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IoEllipsisVertical } from 'react-icons/io5';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import '../../styles/Customers.css';
import Header from '../../components/layout/Header';
import customerService from '../../services/customerService';
import { calculateCustomerStats, calculateStatProgress } from '../../utils/customerUtils';

// Reusable StatCard Component
function StatCard({ iconSrc, label, value, progress, color, iconBgColor }) {
  return (
    <div className="stat-card">
      <div className="stat-card-info">
        <div className="stat-icon-wrapper" style={{ backgroundColor: iconBgColor }}>
          <img src={iconSrc} alt={`${label} icon`} />
        </div>
        <p className="stat-label">{label}</p>
      </div>
      <div className="stat-chart-wrapper">
        <CircularProgressbar
          value={progress}
          text={value}
          strokeWidth={9}
          styles={buildStyles({
            pathColor: color,
            textColor: '#2c3e50',
            trailColor: '#eef2f6',
            textSize: '26px',
            pathTransitionDuration: 0.5,
          })}
        />
      </div>
    </div>
  );
}

export default function CustomerDetail() {
  const { customerPhone } = useParams();
  const [customerData, setCustomerData] = useState(null);
  const [customerTransactions, setCustomerTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // ✅ Use customerService instead of old fetchCustomerByPhone import
        const data = await customerService.getCustomerByPhone(customerPhone);

        // Handle different response formats
        const customer = data.customer || data;
        const transactions = data.transactions || [];

        if (!customer) {
          console.warn(`No customer found for phone: ${customerPhone}`);
          setError('Customer not found');
        } else {
          setCustomerData(customer);
          setCustomerTransactions(transactions);
        }
      } catch (err) {
        console.error('Failed to fetch customer details:', err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch customer details');
      } finally {
        setIsLoading(false);
      }
    };

    if (customerPhone) {
      loadCustomerData();
    }
  }, [customerPhone]);

  // Loading State
  if (isLoading) {
    return (
      <div className="page-with-layout">
        <div className="main-content-panel">
          <Header title="Customer Detail" />
          <div className="customer-detail-container">
            <div className="loading-state">Loading customer details...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="page-with-layout">
        <div className="main-content-panel">
          <Header title="Customer Detail" />
          <div className="customer-detail-container">
            <div className="error-state">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  // No Data Found
  if (!customerData) {
    return (
      <div className="page-with-layout">
        <div className="main-content-panel">
          <Header title="Customer Detail" />
          <div className="customer-detail-container">
            <div className="no-data-cell">No customer found with phone: {customerPhone}</div>
          </div>
        </div>
      </div>
    );
  }

  const c = customerData;
  const stats = calculateCustomerStats(customerTransactions);

  // Mock Reviews
  const mockReviews = [
    {
      name: 'System Review',
      handle: '@system',
      photo: '/assets/placeholder.png',
      stars: 5,
      body: `Customer has completed ${c.totalTransactions || 0} transactions with a total amount of $${(c.totalAmount || 0).toLocaleString()}.`,
      date: 'Recent',
    },
  ];

  return (
    <div className="page-with-layout">
      <div className="main-content-panel">
        <Header title="Customer Detail" />
        <div className="customer-detail-container">
          <div className="section-title">Customer Overview</div>

          {/* Customer Overview */}
          <div className="customer-overview-card">
            <div className="overview-item profile-info">
              <img 
                src={c.photo || '/assets/placeholder.png'} 
                alt={c.name} 
                className="customer-photo-detail" 
              />
              <div>
                <h3 className="profile-name">{c.name}</h3>
                <p className="profile-sub-email">{c.email}</p>
              </div>
            </div>
            <div className="overview-item">
              <p className="overview-label">Email Address:</p>
              <p className="overview-value">{c.email}</p>
            </div>
            <div className="overview-item">
              <p className="overview-label">Phone Number:</p>
              <p className="overview-value">{c.phone}</p>
            </div>
            <div className="overview-item">
              <p className="overview-label">Location:</p>
              <p className="overview-value">{c.address || 'N/A'}</p>
            </div>
            <div className="overview-item">
              <p className="overview-label">Status:</p>
              <span className="status-badge available">{c.status || 'Active'}</span>
            </div>
            <div className="overview-item preferences-info">
              <p className="overview-label">Interested Properties:</p>
              <div className="overview-value">
                {c.interestedProperties && c.interestedProperties.length > 0 ? (
                  c.interestedProperties.map((property, index) => <span key={index}>{property}</span>)
                ) : (
                  <span>No properties found</span>
                )}
              </div>
            </div>
            <div className="overview-item preferences-info">
              <p className="overview-label">Property Types:</p>
              <div className="overview-value">
                {c.propertyTypes && c.propertyTypes.length > 0 ? (
                  <span>{c.propertyTypes.join(', ')}</span>
                ) : (
                  <span>No property types found</span>
                )}
              </div>
            </div>
            <div className="overview-item">
              <p className="overview-label">Total Transactions:</p>
              <p className="overview-value">{c.totalTransactions || 0}</p>
            </div>
            <div className="overview-item">
              <p className="overview-label">Total Amount:</p>
              <p className="overview-value">${(c.totalAmount || 0).toLocaleString()}</p>
            </div>
            <div className="overview-item">
              <p className="overview-label">Last Contacted:</p>
              <p className="overview-value">
                {c.lastContacted ? new Date(c.lastContacted).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Property Stats */}
          <div className="section-title">Property Status:</div>
          <div className="property-status-container">
            <StatCard
              iconSrc="/assets/icon-listing.png"
              label="Properties Viewed"
              value={stats.viewPropertyCount.toString()}
              color="#9B59B6"
              progress={calculateStatProgress(stats.viewPropertyCount, c.totalTransactions || 0)}
              iconBgColor="rgba(155, 89, 182, 0.1)"
            />
            <StatCard
              iconSrc="/assets/icon-sold.png"
              label="Properties Owned"
              value={stats.ownPropertyCount.toString()}
              color="#E67E22"
              progress={calculateStatProgress(stats.ownPropertyCount, c.totalTransactions || 0)}
              iconBgColor="rgba(230, 126, 34, 0.1)"
            />
            <StatCard
              iconSrc="/assets/icon-rent.png"
              label="Property Investments"
              value={stats.investPropertyCount.toString()}
              color="#3498DB"
              progress={calculateStatProgress(stats.investPropertyCount, c.totalTransactions || 0)}
              iconBgColor="rgba(52, 152, 219, 0.1)"
            />
          </div>

          {/* Recent Transactions */}
          <div className="section-title">Recent Transactions:</div>
          <div className="transactions-container">
            {customerTransactions.slice(0, 5).map((transaction, index) => (
              <div key={index} className="transaction-card">
                <div className="transaction-info">
                  <p>
                    <strong>Property:</strong> {transaction.property?.name || 'N/A'}
                  </p>
                  <p>
                    <strong>Type:</strong> {transaction.property?.type || 'N/A'}
                  </p>
                  <p>
                    <strong>Amount:</strong> ${transaction.amount?.toLocaleString() || '0'}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {customerTransactions.length === 0 && (
              <div className="no-data-cell">No transactions found.</div>
            )}
          </div>

          {/* Reviews */}
          <div className="section-title">Reviews:</div>
          <div className="reviews-container">
            {mockReviews.map((r, i) => (
              <div key={i} className="review-card">
                <div className="review-header">
                  <div className="review-author">
                    <img src={r.photo} alt={r.name} className="review-author-photo" />
                    <div className="review-author-info">
                      <span className="review-author-name">{r.name}</span>
                      <span className="review-author-handle">{r.handle}</span>
                    </div>
                  </div>
                  <div className="review-stars">
                    {'★'.repeat(r.stars)}
                    {'☆'.repeat(5 - r.stars)}
                  </div>
                  <div className="review-meta">
                    <span className="review-date">{r.date}</span>
                    <IoEllipsisVertical className="more-options-icon" />
                  </div>
                </div>
                <div className="review-body">{r.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}