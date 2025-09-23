// src/pages/Owners/OwnerDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import '../../styles/Owners.css';

// Backend API base URL
const API_BASE_URL = 'http://192.168.0.152:5000';

const OwnerDetail = () => {
  const { ownerId } = useParams();
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedProperties, setSelectedProperties] = useState([]); // carousel data
  const [availableProperties, setAvailableProperties] = useState([]); // modal data
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);

  // NEW: Function to get the correct owner photo source
  const getOwnerPhotoSrc = (photo) => {
    // If photo exists and is a base64 data URL, use it directly
    if (photo && photo.startsWith('data:image/')) {
      return photo;
    }
    
    // If photo is a file path (for backward compatibility)
    if (photo && photo.startsWith('/uploads/')) {
      return `${API_BASE_URL}${photo}`;
    }
    
    // Fallback to placeholder image
    return '/assets/default-avatar.png';
  };

  // NEW: Function to get the correct property photo source
  const getPropertyPhotoSrc = (photo) => {
    // If photo exists and is a base64 data URL, use it directly
    if (photo && photo.startsWith('data:image/')) {
      return photo;
    }
    
    // If photo is a file path (for backward compatibility)
    if (photo && photo.startsWith('/uploads/')) {
      return `${API_BASE_URL}${photo}`;
    }
    
    // Fallback to placeholder image
    return '/assets/default-property.png';
  };

  // NEW: Function to handle image loading errors
  const handleImageError = (e, fallbackSrc) => {
    e.target.src = fallbackSrc;
    console.warn('Failed to load image, using fallback');
  };

  // Fetch owner details + owner properties on mount
  useEffect(() => {
    const fetchOwnerDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/owners/${ownerId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `Request failed with status: ${response.status}`;
          throw new Error(errorMessage);
        }
        const data = await response.json();
        setOwner(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchOwnerProperties = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/property/owner/${ownerId}`);
        if (!res.ok) throw new Error("Failed to fetch owner properties");
        const data = await res.json();
        setSelectedProperties(data);   // load properties into carousel
        setAvailableProperties(data);  // also store for modal
      } catch (err) {
        console.error("Error fetching owner properties:", err);
      }
    };

    if (ownerId) {
      fetchOwnerDetails();
      fetchOwnerProperties();
    }
  }, [ownerId]);

  // Fetch available properties again when opening modal
  const fetchAvailableProperties = async () => {
    setLoadingProperties(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/property/owner/${ownerId}`);
      if (!response.ok) throw new Error('Failed to fetch properties');
      const properties = await response.json();
      setAvailableProperties(properties);
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  const handlePlusClick = () => {
    setShowPropertyModal(true);
    fetchAvailableProperties();
  };

  const handlePropertySelect = (property) => {
    if (!selectedProperties.find(p => p._id === property._id)) {
      setSelectedProperties([...selectedProperties, property]);
    }
    setShowPropertyModal(false);
  };

  const handleRemoveProperty = (propertyId) => {
    setSelectedProperties(selectedProperties.filter(p => p._id !== propertyId));
  };

  const scrollCarousel = (direction) => {
    const container = document.getElementById('property-carousel');
    if (!container) return;
    const slideWidth = container.querySelector('.carousel-slide')?.offsetWidth || 300;
    container.scrollBy({ left: direction === 'left' ? -slideWidth : slideWidth, behavior: 'smooth' });
  };

  // Loading / Error states
  if (loading) {
    return (
      <div className="main-content">
        <Header title="Owner Detail" />
        <main className="dashboard-body"><p>Loading...</p></main>
      </div>
    );
  }
  if (error) {
    return (
      <div className="main-content">
        <Header title="Owner Detail" />
        <main className="dashboard-body"><h2>Error: {error}</h2></main>
      </div>
    );
  }
  if (!owner) {
    return (
      <div className="main-content">
        <Header title="Owner Detail" />
        <main className="dashboard-body"><h2>Owner not found</h2></main>
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
                    <button className="btn-message">Message</button>
                    <button className="btn-work-with">Work With {owner.name.split(' ')[0]}</button>
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

                {/* STATUS SECTION */}
                <div className="property-status-section">
                  <h3 className="status-heading">Property Status :</h3>
                  <div className="status-cards">
                    <div className="status-card">
                      <div className="status-info">
                        <div className="status-icon-container purple-bg"><img src="/assets/property-iconn.png" alt="Total Listing" /></div>
                        <p className="status-label">Total Listing</p>
                      </div>
                      <div className="status-ring">
                        <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" className="ring-fg purple-ring" /></svg>
                        <span className="status-count">{owner.totalListing || 0}</span>
                      </div>
                    </div>
                    <div className="status-card">
                      <div className="status-info">
                        <div className="status-icon-container orange-bg"><img src="/assets/revenue-bag.png" alt="Property Sold" /></div>
                        <p className="status-label">Property Sold</p>
                      </div>
                      <div className="status-ring">
                        <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" className="ring-fg orange-ring" /></svg>
                        <span className="status-count">{owner.propertySold || 0}</span>
                      </div>
                    </div>
                    <div className="status-card">
                      <div className="status-info">
                        <div className="status-icon-container blue-bg"><img src="/assets/rent.png" alt="Property Rent" /></div>
                        <p className="status-label">Property Rent</p>
                      </div>
                      <div className="status-ring">
                        <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" className="ring-fg blue-ring" /></svg>
                        <span className="status-count">{owner.propertyRent || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="owner-reviews">
                  <h3 className="review-heading">Reviews :</h3>
                  <p>No reviews available for this owner yet.</p>
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
                    <h3>Property Photos</h3>
                  </div>
                  {selectedProperties.length > 0 ? (
                    <div className="carousel-wrapper">
                      <button className="carousel-arrow left" onClick={() => scrollCarousel('left')}>‹</button>
                      <div className="carousel-track" id="property-carousel">
                        {selectedProperties.map((prop) => (
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
                                <span>{prop.address}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button className="carousel-arrow right" onClick={() => scrollCarousel('right')}>›</button>
                    </div>
                  ) : (
                    <div className="no-properties">
                      <p>No properties found for this owner.</p>
                    </div>
                  )}
                </div>
                <br/>
                <div className="location-card">
                  <h3>Location</h3>
                  <img src={"/assets/world-map.png"} alt="Location Map" className="map-image" />
                  <div className="location-details">
                    <strong>{owner.city}</strong>
                    <span>{owner.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Property Selection Modal */}
      {showPropertyModal && (
        <div className="modal-overlay" onClick={() => setShowPropertyModal(false)}>
          <div className="property-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Select Properties for {owner.name}</h3>
              <button className="modal-close-btn" onClick={() => setShowPropertyModal(false)}>×</button>
            </div>
            <div className="modal-content">
              {loadingProperties ? (
                <div className="loading-state">
                  <p>Loading properties...</p>
                </div>
              ) : availableProperties.length > 0 ? (
                <div className="property-grid">
                  {availableProperties.map((property) => (
                    <div 
                      key={property._id} 
                      className={`property-card ${selectedProperties.find(p => p._id === property._id) ? 'selected' : ''}`}
                      onClick={() => handlePropertySelect(property)}
                    >
                      <img 
                        src={getPropertyPhotoSrc(property.photo)} 
                        alt={property.name}
                        className="property-thumbnail"
                        onError={(e) => handleImageError(e, '/assets/default-property.png')}
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover',
                          borderRadius: '8px 8px 0 0'
                        }}
                      />
                      <div className="property-info">
                        <h4>{property.name}</h4>
                        <p>{property.address || 'Address not specified'}</p>
                        <p className="property-price">
                          {property.status === 'rent' && property.rentPrice && `₹${property.rentPrice}/month`}
                          {property.status === 'sale' && property.salePrice && `₹${property.salePrice}`}
                          {property.status === 'both' && property.rentPrice && property.salePrice && `₹${property.rentPrice}/month | ₹${property.salePrice}`}
                          {!property.rentPrice && !property.salePrice && property.price && `₹${property.price}`}
                          {!property.rentPrice && !property.salePrice && !property.price && 'Price not specified'}
                        </p>
                        <p className="property-status">Status: {property.status}</p>
                      </div>
                      {selectedProperties.find(p => p._id === property._id) && (
                        <div className="selected-indicator">✓</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No properties found for this owner.</p>
                  <p className="empty-state-subtitle">Properties may not be assigned to this owner yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OwnerDetail;