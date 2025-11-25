// src/pages/Customers/CustomerDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { IoEllipsisVertical } from 'react-icons/io5';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import customerService from '../../services/customerService';
import Header from '../../components/layout/Header';
import { DEFAULTS } from '../../utils/constants';
import '../../styles/Customers.css';

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
  const params = useParams();
  const location = useLocation();
  
  // Enhanced phone extraction logic
  const getCustomerPhone = () => {
    const phone = params.customerPhone || params.id || params.phone;
    if (phone) return phone;
    
    if (params['*']) {
      const segments = params['*'].split('/');
      return segments[segments.length - 1] || segments[segments.length - 2];
    }
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 1) {
      return pathSegments[pathSegments.length - 1];
    }
    
    return null;
  };
  
  const customerPhone = getCustomerPhone();
  
  const [customerData, setCustomerData] = useState(null);
  const [customerTransactions, setCustomerTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('=== CustomerDetail Debug ===');
    console.log('All URL params:', params);
    console.log('Location pathname:', location.pathname);
    console.log('Extracted customerPhone:', customerPhone);
    console.log('========================');

    const fetchCustomerData = async () => {
      try {
        if (!customerPhone) {
          throw new Error('No customer phone provided in URL');
        }

        setIsLoading(true);
        
        // ✅ Use customerService instead of direct fetch
        const { customer, transactions } = await customerService.getCustomerByPhone(customerPhone);
        
        if (!customer) {
          throw new Error(`No customer found for phone: ${customerPhone}`);
        }
        
        setCustomerData(customer);
        setCustomerTransactions(transactions);
        
      } catch (err) {
        console.error('Error in fetchCustomerData:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerData();
  }, [customerPhone, location.pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className="page-with-layout">
        <div className="main-content-panel">
          <Header title="Customer Detail" />
          <div className="customer-detail-container">
            <div className="loading-state">
              <p>Loading customer details...</p>
              {customerPhone && <p style={{fontSize: '12px', color: '#666'}}>Phone: {customerPhone}</p>}
            </div>
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
            <div className="error-state">
              <p>Error: {error}</p>
              <p style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
                URL: {location.pathname}<br/>
                Phone param: {customerPhone || 'Not found'}
              </p>
              <button 
                onClick={() => window.history.back()} 
                style={{
                  marginTop: '15px',
                  padding: '8px 16px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Go Back
              </button>
            </div>
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

  // ✅ Use customerService helper functions
  const { totalListing, propertySold, propertyRent } = 
    customerService.getCustomerStats(customerTransactions);
  
  const reviews = customerService.getCustomerReviews(customerTransactions, 3);

  return (
    <div className="page-with-layout">
      <div className="main-content-panel">
        <Header title="Customer Detail" />

        <div className="customer-detail-container">
          <div className="customer-detail-section">
            <div className="section-title">Customer Overview</div>

            {/* CUSTOMER OVERVIEW */}
            <div className="customer-overview-card">
              <img src={c.photo} alt={c.name} className="customer-photo-detail" />
              
              <div>
                <h3 className="profile-name">{c.name}</h3>
                <p className="profile-sub-email">{c.email}</p>
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
                <p className="overview-label">Status :</p>
                <span className="status-badge-cd">{c.status}</span>
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
                iconSrc="/assets/property-iconn.png" 
                label="Total Listing" 
                value={totalListing.toString()} 
                color="#9B59B6" 
                progress={100} 
                iconBgColor="rgba(155, 89, 182, 0.1)" 
              />
              <StatCard 
                iconSrc="/assets/sold.png" 
                label="Property Sold" 
                value={propertySold.toString()} 
                color="#E67E22" 
                progress={totalListing > 0 ? (propertySold / totalListing) * 100 : 0} 
                iconBgColor="rgba(230, 126, 34, 0.1)" 
              />
              <StatCard 
                iconSrc="/assets/rent.png" 
                label="Property Rent" 
                value={propertyRent.toString()} 
                color="#3498DB" 
                progress={totalListing > 0 ? (propertyRent / totalListing) * 100 : 0} 
                iconBgColor="rgba(52, 152, 219, 0.1)" 
              />
            </div>

            {/* REVIEWS */}
            <div className="section-title">Reviews :</div>
            <div className="reviews-container">
              {reviews.length > 0 ? (
                reviews.map((r, i) => (
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
                ))
              ) : (
                <div className="no-data-cell">No reviews available</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}