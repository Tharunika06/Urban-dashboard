import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import '../../styles/Property.css';

const PropertyDetail = () => {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`http://192.168.0.152:5000/api/property/${propertyId}`);
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

  // Helper function to format the price for the detail view
  const formatPriceForDetail = () => {
    if (!property) return 'N/A';

    const status = property.status?.toLowerCase();

    // Case 1: Property is for BOTH rent and sale
    if (status === 'both' && property.rentPrice && property.salePrice) {
      return (
        <div className="price-detail-dual">
          <span className="price-detail-rent">{`Rent: $${Number(property.rentPrice).toLocaleString()} /mo`}</span><br></br>
          <span className="price-detail-sale">{`Sale: $${Number(property.salePrice).toLocaleString()}`}</span>
        </div>
      );
    }
    
    // Case 2: Property is for RENT only
    if (status === 'rent' && property.rentPrice) {
      return `$${Number(property.rentPrice).toLocaleString()} /month`;
    }

    // Case 3: Property is for SALE only
    if (status === 'sale' && property.salePrice) {
      return `$${Number(property.salePrice).toLocaleString()}`;
    }
    
    // Fallback for older data or unpriced properties
    if (property.price) {
      return `$${Number(property.price).toLocaleString()}`;
    }

    return 'N/A';
  };

  // Helper function to get the correct CSS class for the status pill
  const getStatusPillClass = (status) => {
    switch(status?.toLowerCase()) {
        case 'rent': return 'rent';
        case 'sale': return 'sale';
        case 'both': return 'both';
        case 'sold': return 'sold';
        default: return '';
    }
  }

  // Helper function to get owner information
  const getOwnerInfo = () => {
    // First try to get from ownerDetails (populated by backend)
    if (property.ownerDetails) {
      return {
        photo: property.ownerDetails.photo 
          ? `http://192.168.0.152:5000${property.ownerDetails.photo}` 
          : '/assets/placeholder.png',
        name: property.ownerDetails.name || 'Owner Not Found',
        // email: property.ownerDetails.email,
        phone: property.ownerDetails.phone
      };
    }
    
    // Fallback to property's stored owner data
    return {
      photo: property.ownerPhoto 
        ? `http://192.168.0.152:5000${property.ownerPhoto}` 
        : '/assets/placeholder.png',
      name: property.ownerName || 'Owner Not Found',
      email: null,
      phone: null
    };
  };

  if (loading) return <div className="loading-state">Loading...</div>;
  if (!property) return <div className="loading-state">Property not found</div>;

  const ownerInfo = getOwnerInfo();

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
                  onError={(e) => {
                    e.target.src = '/assets/placeholder.png';
                  }}
                />
                <h4>{ownerInfo.name}</h4>
                <p className="agent-title">[Owner]</p>
                {/* {ownerInfo.email && (
                  <p className="owner-contact">📧 {ownerInfo.email}</p>
                )} */}
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
                  src={property.photo ? `http://192.168.0.152:5000${property.photo}` : '/assets/default-house.jpg'}
                  alt={property.name}
                  className="detail-hero-img"
                  onError={(e) => {
                    e.target.src = '/assets/default-house.jpg';
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
                    {formatPriceForDetail()}
                  </span>
                </div>
                 
                  <div className="stat-pill">
                    <img src="/assets/bed-icon.png" alt="Beds" />
                    <span>{property.bedrooms} Beds</span>
                  </div>

                  <div className="stat-pill">
                    <img src="/assets/bath-icon.png" alt="Bath" />
                    <span>{property.bath} Bath</span>
                  </div>

                  <div className="stat-pill">
                    <img src="/assets/size-icon.png" alt="Size" />
                    <span>{property.size || '-'}sq ft</span>
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