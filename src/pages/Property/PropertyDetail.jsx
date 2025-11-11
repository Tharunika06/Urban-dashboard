// src/pages/Property/PropertyDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import {
  API_CONFIG,
  API_ENDPOINTS,
  DEFAULTS,
  UI_MESSAGES,
  BUTTON_LABELS,
} from '../../utils/constants';
import {
  getImageSrc,
  getOwnerInfo,
  formatPriceForDetail,
  getStatusPillClass,
  handlePropertyImageError,
} from '../../utils/propertyHelpers';
import '../../styles/Property.css';

const PropertyDetail = () => {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.PROPERTY}/${propertyId}`);
        if (!res.ok) {
          throw new Error('Property not found');
        }
        const data = await res.json();
        setProperty(data);
      } catch (err) {
        console.error('Failed to fetch property:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  if (loading) return <div className="loading-state">{UI_MESSAGES.LOADING_PROPERTIES}</div>;
  if (!property) return <div className="loading-state">Property not found</div>;

  const ownerInfo = getOwnerInfo(property);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header title={`Property / ${property.name || propertyId}`} />
        <main className="dashboard-body">
          <h3 className="page-title">Property Overview</h3>

          {/* FLEX LAYOUT */}
          <div className="property-detail-container">
            {/* LEFT COLUMN */}
            <div className="detail-left-col">
              <div className="card agent-card">
                <img
                  src={ownerInfo.photo}
                  alt={ownerInfo.name}
                  className="agent-avatar"
                  onError={(e) => handlePropertyImageError(e, DEFAULTS.PLACEHOLDER_IMAGE)}
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '50%'
                  }}
                />
                <h4>{ownerInfo.name}</h4>
                <p className="agent-title">[Owner]</p>
                {ownerInfo.phone && (
                  <p className="owner-contact">📞 {ownerInfo.phone}</p>
                )}
                <div className="agent-socials">
                  <a href="#"><img src="/assets/fb.png" alt="facebook" /></a>
                  <a href="#"><img src="/assets/ig.png" alt="instagram" /></a>
                  <a href="#"><img src="/assets/x.png" alt="twitter" /></a>
                  <a href="#"><img src="/assets/wp.png" alt="whatsapp" /></a>
                </div>
                <div className="agent-actions">
                  <button className="btn-call">Call Us</button>
                  <button className="btn-message">Message</button>
                </div>
              </div>

              <div className="card schedule-card">
                <h4>Schedule Now</h4>
                <input type="date" />
                <input type="time" />
                <input type="text" placeholder="Your Name" />
                <input type="email" placeholder="Email" />
                <input type="text" placeholder="Number" />
                <textarea placeholder="Message"></textarea>
                <button className="btn-send-info">Send Information</button>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="detail-right-col">
              <div className="prop-card">
                <img
                  src={getImageSrc(property.photo)}
                  alt={property.name || 'Property'}
                  className="detail-hero-img"
                  onError={(e) => handlePropertyImageError(e, '/assets/default-house.jpg')}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
                
                <div className="detail-header">
                  <h4>{property.name}</h4>
                  <div className="action-icons">
                    <img src="/assets/map-pin.png" alt="map" />
                    <img src="/assets/fav.png" alt="favorite" />
                    <img src="/assets/heart.png" alt="like" />
                    <img src="/assets/dots.png" alt="more options" />
                  </div>
                </div>
                
                <p className="property-address">
                  {property.address || 'Address not available'}
                </p>

                <div className="detail-stats">
                  <div className="stat-pill price-pill">
                    <img src="/assets/price-icon.png" alt="Price" />
                    <span className="price-text">
                      {formatPriceForDetail(property)}
                    </span>
                  </div>
                 
                  <div className="stat-pill">
                    <img src="/assets/bed-icon.png" alt="Beds" />
                    <span>{property.bedrooms || 0} Beds</span>
                  </div>

                  <div className="stat-pill">
                    <img src="/assets/bath-icon.png" alt="Bath" />
                    <span>{property.bath || 0} Bath</span>
                  </div>

                  <div className="stat-pill">
                    <img src="/assets/size-icon.png" alt="Size" />
                    <span>{property.size || '-'} sq ft</span>
                  </div>

                  <div className="stat-pill">
                    <img src="/assets/floor-icon.png" alt="Floor" />
                    <span>{property.floor || '-'} Floor</span>
                  </div>

                  <div className="stat-pill">
                    <img src="/assets/fav.png" alt="Rating" />
                    <span>4.4 Review</span>
                  </div>
                  
                  <div className={`stat-pill status-pill ${getStatusPillClass(property.status)}`}>
                    <img src="/assets/status-icon.png" alt="Status" />
                    <span>For {property.status || 'Unknown'}</span>
                  </div>
                </div>
               
                <div className="facilities">
                  <h5>Some Facility :</h5>
                  {property.facility && property.facility.length > 0 ? (
                    property.facility.map((fac, index) => (
                      <span key={index} className="facility-tag">
                        {fac}
                      </span>
                    ))
                  ) : (
                    <p style={{ fontStyle: 'italic', opacity: 0.7 }}>No facilities listed.</p>
                  )}
                </div>
                
                <div className="description">
                  <h5>Property Details:</h5>
                  <p>
                    {property.about || 'No detailed description available for this property.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* MAP */}
          <div className="map-card">
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d2277859.321980014!2d76.95232526608935!3d11.072006616515734!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1750331800222!5m2!1sen!2sin"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Property Location"
              ></iframe>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PropertyDetail;