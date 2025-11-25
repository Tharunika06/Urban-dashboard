// src/pages/Owners/OwnerDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import GradientButton from '../../components/common/GradientButton';
import ownerService from '../../services/ownerService';
import { STYLES } from '../../utils/constants';
import { 
  getOwnerPhotoSrc, 
  getPropertyPhotoSrc, 
  handleImageError,
  formatPropertyPrice 
} from '../../utils/ownerHelpers';
import '../../styles/Owners.css';

const OwnerDetail = () => {
  const { ownerId } = useParams();
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  // Fetch owner details
  const loadOwnerDetails = async () => {
    try {
      setLoading(true);
      setError(null);
  
      console.log(`Loading owner details for ID: ${ownerId}`);
      const data = await ownerService.getOwnerById(ownerId);
      
      setOwner(data.owner || data);
    } catch (err) {
      console.error('Failed to fetch owner:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch owner details');
    } finally {
      setLoading(false);
    }
  };

  // Fetch owner properties
  const loadOwnerProperties = async () => {
    try {
      setLoadingProperties(true);
      
      const data = await ownerService.getOwnerProperties(ownerId);
      
      const fetchedProperties = data.properties || data || [];
      
      setProperties(fetchedProperties);
    } catch (err) {
      console.error('Failed to fetch owner properties:', err);
      setProperties([]);
    } finally {
      setLoadingProperties(false);
    }
  };

  // Initial data fetch on mount
  useEffect(() => {
    if (ownerId) {
      loadOwnerDetails();
      loadOwnerProperties();
    }
  }, [ownerId]);

  const scrollCarousel = (direction) => {
    const container = document.getElementById('property-carousel');
    if (!container) return;
    const slideWidth = container.querySelector('.carousel-slide')?.offsetWidth || 300;
    container.scrollBy({ left: direction === 'left' ? -slideWidth : slideWidth, behavior: 'smooth' });
  };

  // Loading state
  if (loading) {
    return (
      <div className="main-content">
        <Header title="Owner Detail" />
        <main className="dashboard-body">
          <div style={STYLES.LOADING_STATE}>
            <p>Loading owner details...</p>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="main-content">
        <Header title="Owner Detail" />
        <main className="dashboard-body">
          <div style={STYLES.ERROR_STATE}>
            <h2>Error: {error}</h2>
            <GradientButton onClick={() => loadOwnerDetails()} width="100px" height="38px">
              Retry
            </GradientButton>
          </div>
        </main>
      </div>
    );
  }

  // Not found state
  if (!owner) {
    return (
      <div className="main-content">
        <Header title="Owner Detail" />
        <main className="dashboard-body">
          <div>
            <h2>Owner not found</h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-container">
        <div className="main-content">
          <Header title="Owner Detail" />
          <main className="dashboard-body">
            <div className="owner-detail-grid">
              {/* LEFT CARD */}
              <div className="owner-main-info-card">
                <div className="owner-header">
                  <img 
                    src={getOwnerPhotoSrc(owner.photo)} 
                    alt={owner.name} 
                    className="owner-photo-large"
                    onError={(e) => handleImageError(e, '/assets/default-avatar.png')}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                  <div>
                    <h2>{owner.name}</h2>
                    <p className="email">{owner.email}</p>
                  </div>
                  <div className="action-buttons">
                    <GradientButton 
                      width="75px" 
                      height="40px"
                      style={{ 
                        fontSize: '14px',
                        padding: '10px 20px'
                      }}
                    >
                      Message
                    </GradientButton>
                    <button 
                      width="180px" 
                      height="30px"
                      style={{ 
                        fontSize: '14px',
                        padding: '10px 20px',
                        borderRadius: '10px',
                      }}
                    >
                      Work With {owner.name.split(' ')[0]}
                    </button>
                  </div>
                </div>

                <div className="owner-contact">
                  <p><img src="/assets/map-pin-gray.png" alt="location" style={{width: '18px', height: '18px' }} /> {owner.address || 'N/A'}</p>
                  <p><img src="/assets/phone-gray.png" alt="phone" style={{width: '16px', height: '16px' }} /> {owner.contact || 'N/A'}</p>
                  <div className="social-media">
                    <h4>Social Media:</h4>
                    <a href="#"><img src="/assets/fb.png" alt="fb" /></a>
                    <a href="#"><img src="/assets/ig.png" alt="ig" /></a>
                    <a href="#"><img src="/assets/x.png" alt="x" /></a>
                    <a href="#"><img src="/assets/wp.png" alt="wp" /></a>
                  </div>
                </div>
                <br/>
                <div className="owner-about">
                  <h3>About {owner.name.split(' ')[0]}:</h3>
                  <p>{owner.about || 'No detailed biography available.'}</p>
                  <div className="owner-credentials">
                    <p><strong>Agency:</strong> {owner.agency || 'N/A'}</p>
                    <p><strong>License:</strong> {owner.licenseNumber || 'N/A'}</p>
                    <p><strong>Text Number:</strong> {owner.textNumber || 'N/A'}</p>
                    <p><strong>Service Area:</strong> {owner.servicesArea || 'N/A'}</p>
                  </div>
                </div>

                {/* PROPERTY STATUS SECTION - AUTO-CALCULATED STATS */}
                <div className="property-status-section">
                  <h3 className="status-heading">Property Status :</h3>
                  <div className="status-cards">
                    <div className="status-card">
                      <div className="status-info">
                        <div className="status-icon-container purple-bg">
                          <img src="/assets/property-iconn.png" alt="Total Listing" />
                        </div>
                        <p className="status-label">Total Listing</p>
                      </div>
                      <div className="status-ring">
                        <svg viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" className="ring-fg purple-ring" />
                        </svg>
                        <span className="status-count">{owner.totalListing || 0}</span>
                      </div>
                    </div>
                    <div className="status-card">
                      <div className="status-info">
                        <div className="status-icon-container orange-bg">
                          <img src="/assets/revenue-icon.png" alt="Property Sold" />
                        </div>
                        <p className="status-label">Property Sold</p>
                      </div>
                      <div className="status-ring">
                        <svg viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" className="ring-fg orange-ring" />
                        </svg>
                        <span className="status-count">{owner.propertySold || 0}</span>
                      </div>
                    </div>
                    <div className="status-card">
                      <div className="status-info">
                        <div className="status-icon-container blue-bg">
                          <img src="/assets/rent.png" alt="Property Rent" />
                        </div>
                        <p className="status-label">Property Rent</p>
                      </div>
                      <div className="status-ring">
                        <svg viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" className="ring-fg blue-ring" />
                        </svg>
                        <span className="status-count">{owner.propertyRent || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDEBAR */}
              <div className="owner-sidebar">
                <div className="card owner-badge">
                  <div className="owner-badge-top">
                    <div className="owner-info">
                      <img 
                        src={getOwnerPhotoSrc(owner.photo)} 
                        alt={owner.name} 
                        className="owner-avatar"
                        onError={(e) => handleImageError(e, '/assets/default-avatar.png')}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                      />
                      <div className="owner-name-rank">
                        <strong>{owner.name}</strong>
                        <span><br />#1 Medal</span>
                      </div>
                    </div>
                    <img src="/assets/medal.png" alt="Medal" className="medal-icon" />
                  </div>
                  <img src="/assets/Trophy.png" alt="Trophy" className="owner-trophy-banner" />
                </div>
                <br/>
                <div className="property-carousel-card">
                  <div className="carousel-header">
                    <h3>Property Photos ({properties.length})</h3>
                  </div>
                  
                  {loadingProperties ? (
                    <div className="loading-state" style={{ padding: '40px', textAlign: 'center' }}>
                      <p>Loading properties...</p>
                    </div>
                  ) : properties.length > 0 ? (
                    <div className="carousel-wrapper">
                      {properties.length > 1 && (
                        <button className="carousel-arrow left" onClick={() => scrollCarousel('left')}>‹</button>
                      )}
                      <div className="carousel-track" id="property-carousel">
                        {properties.map((prop) => (
                          <div key={prop._id} className="carousel-slide single-slide">
                            <img 
                              src={getPropertyPhotoSrc(prop.photo)} 
                              alt={prop.name} 
                              className="carousel-image"
                              onError={(e) => handleImageError(e, '/assets/default-property.png')}
                              style={{
                                width: '100%',
                                height: '200px',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                            <div className="photo-caption-overlay">
                              <div className="icon-bg"><img src="/assets/home-icon.png" alt="icon" /></div>
                              <div>
                                <strong>{prop.name}</strong>
                                <span>{prop.address || prop.city}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {properties.length > 1 && (
                        <button className="carousel-arrow right" onClick={() => scrollCarousel('right')}>›</button>
                      )}
                    </div>
                  ) : (
                    <div className="no-properties" style={{ padding: '40px', textAlign: 'center' }}>
                      <p>No properties found for this owner.</p>
                    </div>
                  )}
                </div>
                <br/>
                <div className="location-card">
                  <h3>Location</h3>
                  <img src={"/assets/world-map.png"} alt="Location Map" className="map-image" />
                  <div className="location-details">
                    <strong>{owner.city || 'City Not Specified'}</strong>
                    <span>{owner.address || 'Address Not Specified'}</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default OwnerDetail;