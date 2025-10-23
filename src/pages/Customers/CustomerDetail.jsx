// CustomerDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { IoHomeOutline, IoPricetagOutline, IoKeyOutline, IoEllipsisVertical } from 'react-icons/io5';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import '../../styles/Customers.css';
import Header from '../../components/layout/Header';

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
  const { customerPhone } = useParams(); // Get customer phone from URL params
  const [customerData, setCustomerData] = useState(null);
  const [customerTransactions, setCustomerTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all transactions to get customer data
        const response = await fetch('http://192.168.1.45:5000/api/payment/transactions');
        if (!response.ok) throw new Error('Failed to fetch customer data');
        
        const allTransactions = await response.json();
        
        // Filter transactions for the specific customer
        const customerTxns = allTransactions.filter(tx => tx.customerPhone === customerPhone);
        
        if (customerTxns.length === 0) {
          throw new Error('Customer not found');
        }
        
        // Get the most recent transaction for customer details
        const latestTxn = customerTxns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        
        // Build customer data object
        const customer = {
          name: latestTxn.customerName || 'N/A',
          phone: latestTxn.customerPhone || 'N/A',
          email: latestTxn.customerEmail || 'N/A',
          address: latestTxn.customerAddress || 'N/A',
          photo: latestTxn.customerPhoto || '/assets/placeholder.png',
          status: 'Active', // You can derive this from transaction data
          lastContacted: latestTxn.createdAt,
          interestedProperties: [...new Set(customerTxns.map(tx => tx.property?.name).filter(Boolean))],
          propertyTypes: [...new Set(customerTxns.map(tx => tx.property?.type).filter(Boolean))],
          totalTransactions: customerTxns.length,
          totalAmount: customerTxns.reduce((sum, tx) => sum + (tx.amount || 0), 0),
        };
        
        setCustomerData(customer);
        setCustomerTransactions(customerTxns);
        
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch customer details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (customerPhone) {
      fetchCustomerData();
    }
  }, [customerPhone]);

  // Loading state
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

  // Error state
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

  // No customer found
  if (!customerData) {
    return (
      <div className="page-with-layout">
        <div className="main-content-panel">
          <Header title="Customer Detail" />
          <div className="customer-detail-container">
            <div className="no-data-cell">Customer not found.</div>
          </div>
        </div>
      </div>
    );
  }

  const c = customerData;
  
  // Mock reviews for now - you can fetch these from API if available
  const mockReviews = [
    { 
      name: 'System Review', 
      handle: '@system', 
      photo: '/assets/placeholder.png', 
      stars: 5, 
      body: `Customer has completed ${c.totalTransactions} transactions with a total amount of $${c.totalAmount.toLocaleString()}.`, 
      date: 'Recent' 
    }
  ];

  // Calculate stats based on transaction data
  const viewPropertyCount = customerTransactions.filter(tx => tx.stats?.viewProperty).length;
  const ownPropertyCount = customerTransactions.filter(tx => tx.stats?.ownProperty).length;
  const investPropertyCount = customerTransactions.filter(tx => tx.stats?.investOnProperty).length;

  return (
    <div className="page-with-layout">
      <div className="main-content-panel">
        <Header title="Customer Detail" /> 
        <div className="customer-detail-container">
          
          <div className="section-title">Customer Overview</div>

          {/* CUSTOMER OVERVIEW */}
          <div className="customer-overview-card">
            <div className="overview-item profile-info">
              <img src={c.photo} alt={c.name} className="customer-photo-detail" />
              <div>
                <h3 className="profile-name">{c.name}</h3>
                <p className="profile-sub-email">{c.email}</p>
              </div>
            </div>
            <div className="overview-item">
              <p className="overview-label">Email Address :</p>
              <p className="overview-value">{c.email}</p>
            </div>
            <div className="overview-item">
              <p className="overview-label">Phone Number :</p>
              <p className="overview-value">{c.phone}</p>
            </div>
            <div className="overview-item">
              <p className="overview-label">Location :</p>
              <p className="overview-value">{c.address}</p>
            </div>
            <div className="overview-item">
              <p className="overview-label">Status :</p>
              <span className="status-badge available">{c.status}</span>
            </div>
            <div className="overview-item preferences-info">
              <p className="overview-label">Interested Properties :</p>
              <div className="overview-value">
                {c.interestedProperties.length > 0 ? (
                  c.interestedProperties.map((property, index) => (
                    <span key={index}>{property}</span>
                  ))
                ) : (
                  <span>No properties found</span>
                )}
              </div>
            </div>
            <div className="overview-item preferences-info">
              <p className="overview-label">Property Types :</p>
              <div className="overview-value">
                {c.propertyTypes.length > 0 ? (
                  <span>{c.propertyTypes.join(', ')}</span>
                ) : (
                  <span>No property types found</span>
                )}
              </div>
            </div>
            <div className="overview-item">
              <p className="overview-label">Total Transactions :</p>
              <p className="overview-value">{c.totalTransactions}</p>
            </div>
            <div className="overview-item">
              <p className="overview-label">Total Amount :</p>
              <p className="overview-value">${c.totalAmount.toLocaleString()}</p>
            </div>
            <div className="overview-item">
              <p className="overview-label">Last Contacted :</p>
              <p className="overview-value">{new Date(c.lastContacted).toLocaleDateString()}</p>
            </div>
            <div className="overview-item social-info">
              <p className="overview-label">Social Media:</p>
              <div className="icon-row">
                <a href="#"><img src="/assets/fb.png" alt="facebook" /></a>
                <a href="#"><img src="/assets/ig.png" alt="instagram" /></a>
                <a href="#"><img src="/assets/x.png" alt="twitter" /></a>
                <a href="#"><img src="/assets/wp.png" alt="whatsapp" /></a>
              </div>
            </div>
          </div>

          {/* PROPERTY STATUS */}
          <div className="section-title">Property Status :</div>
          <div className="property-status-container">
            <StatCard 
              iconSrc="/assets/icon-listing.png" 
              label="Properties Viewed" 
              value={viewPropertyCount.toString()} 
              color="#9B59B6" 
              progress={Math.min((viewPropertyCount / c.totalTransactions) * 100, 100)} 
              iconBgColor="rgba(155, 89, 182, 0.1)" 
            />
            <StatCard 
              iconSrc="/assets/icon-sold.png" 
              label="Properties Owned" 
              value={ownPropertyCount.toString()} 
              color="#E67E22" 
              progress={Math.min((ownPropertyCount / c.totalTransactions) * 100, 100)} 
              iconBgColor="rgba(230, 126, 34, 0.1)" 
            />
            <StatCard 
              iconSrc="/assets/icon-rent.png" 
              label="Property Investments" 
              value={investPropertyCount.toString()} 
              color="#3498DB" 
              progress={Math.min((investPropertyCount / c.totalTransactions) * 100, 100)} 
              iconBgColor="rgba(52, 152, 219, 0.1)" 
            />
          </div>

          {/* TRANSACTION HISTORY */}
          <div className="section-title">Recent Transactions :</div>
          <div className="transactions-container">
            {customerTransactions.slice(0, 5).map((transaction, index) => (
              <div key={index} className="transaction-card">
                <div className="transaction-info">
                  <p><strong>Property:</strong> {transaction.property?.name || 'N/A'}</p>
                  <p><strong>Type:</strong> {transaction.property?.type || 'N/A'}</p>
                  <p><strong>Amount:</strong> ${transaction.amount?.toLocaleString() || '0'}</p>
                  <p><strong>Date:</strong> {new Date(transaction.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {customerTransactions.length === 0 && (
              <div className="no-data-cell">No transactions found.</div>
            )}
          </div>

          {/* REVIEWS */}
          <div className="section-title">Reviews :</div>
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
                    {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}
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