// CustomerDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { IoEllipsisVertical } from 'react-icons/io5';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import '../../styles/Customers.css';
import Header from '../../components/layout/Header';
import { API_CONFIG, API_ENDPOINTS, DEFAULTS } from '../../utils/constants';

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
    // Try different parameter names
    const phone = params.customerPhone || params.id || params.phone;
    
    if (phone) return phone;
    
    // Try extracting from wildcard route
    if (params['*']) {
      const segments = params['*'].split('/');
      return segments[segments.length - 1] || segments[segments.length - 2];
    }
    
    // Try extracting from pathname
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
    console.log('Location state:', location.state);
    console.log('Extracted customerPhone:', customerPhone);
    console.log('========================');

    const fetchCustomerData = async () => {
      try {
        if (!customerPhone) {
          throw new Error('No customer phone provided in URL');
        }

        setIsLoading(true);
        console.log('Fetching transactions for phone:', customerPhone);
        
        // Fetch all transactions using API config
        const apiUrl = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.TRANSACTIONS}`;
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch customer data: ${response.status} ${response.statusText}`);
        }
        
        const allTransactions = await response.json();
        console.log('Total transactions received:', allTransactions.length);
        
        if (allTransactions.length > 0) {
          console.log('Sample transaction:', allTransactions[0]);
        }
        
        // Decode the phone number from URL
        const decodedPhone = decodeURIComponent(customerPhone);
        console.log('Decoded phone for matching:', decodedPhone);
        
        // More flexible phone matching
        const normalizePhone = (phone) => {
          if (!phone) return '';
          return phone.toString().replace(/\D/g, '');
        };
        
        const normalizedSearchPhone = normalizePhone(decodedPhone);
        console.log('Normalized search phone:', normalizedSearchPhone);
        
        // Filter transactions for the specific customer
        const customerTxns = allTransactions.filter(tx => {
          if (!tx.customerPhone) return false;
          
          const txPhone = tx.customerPhone.toString();
          const normalizedTxPhone = normalizePhone(txPhone);
          
          const matches = 
            txPhone === decodedPhone || 
            txPhone === customerPhone ||
            txPhone === `+${decodedPhone}` ||
            normalizedTxPhone === normalizedSearchPhone ||
            normalizedTxPhone.endsWith(normalizedSearchPhone) ||
            normalizedSearchPhone.endsWith(normalizedTxPhone);
          
          if (matches) {
            console.log('✓ Match found:', txPhone);
          }
          
          return matches;
        });
        
        console.log('Matching transactions found:', customerTxns.length);
        
        if (customerTxns.length === 0) {
          // Log all unique phone numbers to help debug
          const uniquePhones = [...new Set(allTransactions.map(tx => tx.customerPhone))].filter(Boolean);
          console.log('Available customer phones in database:', uniquePhones.slice(0, 10));
          console.log('Total unique phones:', uniquePhones.length);
          throw new Error(`No transactions found for phone: ${decodedPhone}`);
        }
        
        // Get the most recent transaction for customer details
        const latestTxn = customerTxns.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        
        console.log('Latest transaction:', latestTxn);
        
        // Extract unique property names and types
        const interestedProperties = [...new Set(
          customerTxns.map(tx => tx.property?.name).filter(Boolean)
        )];
        const propertyTypes = [...new Set(
          customerTxns.map(tx => tx.property?.type).filter(Boolean)
        )];
        
        // Build customer data object
        const customer = {
          name: latestTxn.customerName || 'N/A',
          phone: latestTxn.customerPhone || 'N/A',
          email: latestTxn.customerEmail || 'N/A',
          address: latestTxn.customerAddress || 'N/A',
          photo: latestTxn.customerPhoto || DEFAULTS.PLACEHOLDER_IMAGE,
          status: 'Available',
          lastContacted: latestTxn.createdAt,
          preferences: latestTxn.customerPreferences || 'No preferences specified',
          interestedProperties: interestedProperties,
          propertyTypes: propertyTypes,
          totalTransactions: customerTxns.length,
          totalAmount: customerTxns.reduce((sum, tx) => sum + (tx.amount || 0), 0),
        };
        
        console.log('Customer data built:', customer);
        
        setCustomerData(customer);
        setCustomerTransactions(customerTxns);
        
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
                Phone param: {customerPhone || 'Not found'}<br/>
                Available params: {JSON.stringify(params)}
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

  // Calculate stats based on transaction data
  const totalListing = customerTransactions.length;
  const propertySold = customerTransactions.filter(tx => 
    tx.type === 'sale' || tx.property?.status === 'sold'
  ).length;
  const propertyRent = customerTransactions.filter(tx => 
    tx.type === 'rent' || tx.property?.status === 'rented'
  ).length;

  // Generate reviews from transactions
  const reviews = customerTransactions.slice(0, 3).map((tx, index) => ({
    name: tx.customerName || 'Anonymous',
    handle: `@${(tx.customerName || 'user').toLowerCase().replace(/\s+/g, '')}`,
    photo: tx.customerPhoto || DEFAULTS.PLACEHOLDER_IMAGE,
    stars: 5,
    body: `Transaction completed for ${tx.property?.name || 'property'} at $${tx.amount?.toLocaleString() || '0'}'}`,
    date: new Date(tx.createdAt).toLocaleDateString()
  }));

  // if (reviews.length === 0) {
  //   reviews.push({
  //     name: 'System Review',
  //     handle: '@system',
  //     photo: DEFAULTS.PLACEHOLDER_IMAGE,
  //     stars: 5,
  //     body: `Customer has ${c.totalTransactions} transaction${c.totalTransactions !== 1 ? 's' : ''} with total value of $${c.totalAmount.toLocaleString()}.`,
  //     date: 'Recent'
  //   });
  // }

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
            {reviews.map((r, i) => (
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
    </div>
  );
}