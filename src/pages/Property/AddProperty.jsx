// AddProperty.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ---------------- Popup Styles ----------------
const popupStyles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
  container: { backgroundColor: 'white', borderRadius: '12px', padding: '40px 60px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', minWidth: '400px', maxWidth: '500px', position: 'relative', animation: 'slideIn 0.3s ease-out' },
  closeBtn: { position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '24px', color: '#666', cursor: 'pointer', padding: '5px' },
  icon: { width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' },
  title: { fontSize: '28px', fontWeight: '600', color: '#333', margin: '0 0 15px 0', lineHeight: '1.2' },
  message: { fontSize: '16px', color: '#666', margin: '0 0 30px 0', lineHeight: '1.4' },
  button: { border: 'none', borderRadius: '8px', padding: '12px 40px', fontSize: '16px', fontWeight: '500', cursor: 'pointer', minWidth: '120px', transition: 'background-color 0.2s ease' }
};

// ---------------- Popup Component ----------------
const Popup = ({ isOpen, onClose, type, title, message }) => {
  if (!isOpen) return null;
  const isError = type === 'error';
  const iconColor = isError ? '#f44336' : '#4CAF50';
  const buttonColor = isError ? '#f44336' : '#4285f4';
  const buttonHoverColor = isError ? '#d32f2f' : '#3367d6';
  const icon = isError ? '✕' : '✓';

  return (
    <div style={popupStyles.overlay}>
      <div style={popupStyles.container}>
        <button onClick={onClose} style={popupStyles.closeBtn}>×</button>
        <div style={{ ...popupStyles.icon, backgroundColor: iconColor }}>
          <span style={{ fontSize: '30px', color: 'white' }}>{icon}</span>
        </div>
        <h2 style={popupStyles.title}>{title}</h2>
        {message && <p style={popupStyles.message}>{message}</p>}
        <button
          onClick={onClose}
          style={{ ...popupStyles.button, backgroundColor: buttonColor, color: 'white' }}
          onMouseOver={(e) => e.target.style.backgroundColor = buttonHoverColor}
          onMouseOut={(e) => e.target.style.backgroundColor = buttonColor}
        >
          OK
        </button>
        <style>{`@keyframes slideIn { from { opacity: 0; transform: scale(0.9) translateY(-20px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
      </div>
    </div>
  );
};

// ---------------- Price Input ----------------
const PriceInput = ({ label, name, value, onChange, required, placeholder }) => (
  <div className="form-group">
    <label>{label} {required && '*'}</label>
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>₹</span>
      <input 
        type="text" 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        style={{ paddingLeft: '25px' }} 
        required={required} 
      />
    </div>
  </div>
);

// ---------------- Facilities Section ----------------
const FacilitiesSection = ({ facilities, onToggle, onAdd, onRemove, customFacility, setCustomFacility }) => {
  const staticFacilities = ['Big Swimming Pool', 'Near Airport', 'Car Parking', '24/7 Electricity'];
  return (
    <div className="form-group">
      <label>Property Facilities</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '15px' }}>
        {staticFacilities.map((facility) => (
          <label key={facility} style={{ display: 'flex', alignItems: 'center', padding: '5px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={facilities.includes(facility)} 
              onChange={() => onToggle(facility)} 
              style={{ marginRight: '8px' }} 
            />
            {facility}
          </label>
        ))}
      </div>
      <div style={{ marginTop: '15px', position: 'relative', width: '100%' }}>
        <input
          type="text"
          placeholder="Add custom facility"
          value={customFacility}
          onChange={(e) => setCustomFacility(e.target.value)}
          style={{ padding: '10px 50px 10px 10px', width: '100%', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
        />
        <button 
          type="button" 
          onClick={onAdd} 
          style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', padding: '6px 12px', border: 'none', backgroundColor: '#0a74da', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
        >
          Add
        </button>
      </div>
      {facilities.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <strong>Selected Facilities:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {facilities.map((facility, idx) => (
              <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#e3f2fd', color: '#1976d2', padding: '4px 8px', borderRadius: '16px', fontSize: '14px', border: '1px solid #bbdefb' }}>
                {facility}
                <button 
                  type="button" 
                  onClick={() => onRemove(facility)} 
                  style={{ marginLeft: '6px', background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------- Helper function to convert file to base64 ----------------
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

// ---------------- Main AddProperty ----------------
const AddProperty = ({ isOpen, onClose }) => {
  const initialForm = { 
    name: '', 
    type: 'Villas', 
    rentPrice: '', 
    salePrice: '', 
    status: 'sale', 
    bedrooms: '', 
    bath: '', 
    size: '', 
    floor: '', 
    address: '', 
    zip: '', 
    country: '', 
    city: '', 
    ownerId: '', 
    ownerName: '', 
    facilities: [], 
    about: '' 
  };
  
  const [form, setForm] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState([]);
  const [customFacility, setCustomFacility] = useState('');
  const [step, setStep] = useState(1);
  const [popup, setPopup] = useState({ show: false, type: '', title: '', message: '' });

  const showPopup = (type, title, message = '') => setPopup({ show: true, type, title, message });
  const hidePopup = () => setPopup({ show: false, type: '', title: '', message: '' });

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await axios.get('http://192.168.0.154:5000/api/owners');
        setOwners(res.data.owners || []);
      } catch (err) {
        console.error('Failed to fetch owners:', err);
        showPopup('error', 'Failed to Load Owners', 'Please refresh and try again.');
      }
    };
    if (isOpen) fetchOwners();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'ownerId') {
      const selectedOwner = Array.isArray(owners) ? owners.find(o => String(o.ownerId) === value) : null;
      setForm(prev => ({ ...prev, ownerId: value, ownerName: selectedOwner ? selectedOwner.name : '' }));
    } else if (name === 'status') {
      setForm(prev => ({ ...prev, [name]: value.toLowerCase(), rentPrice: '', salePrice: '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const { name, ownerId, status, rentPrice, salePrice } = form;
    if (!name.trim()) return showPopup('error', 'Validation Error', 'Property name is required'), false;
    if (!ownerId) return showPopup('error', 'Validation Error', 'Owner ID is required'), false;
    if (status === 'rent' && !rentPrice.trim()) return showPopup('error', 'Validation Error', 'Rent price is required for rental properties'), false;
    if (status === 'sale' && !salePrice.trim()) return showPopup('error', 'Validation Error', 'Sale price is required for sale properties'), false;
    if (status === 'both' && (!rentPrice.trim() || !salePrice.trim())) return showPopup('error', 'Validation Error', 'Both rent and sale prices are required'), false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      // Prepare the request payload as JSON
      const payload = {
        name: form.name,
        type: form.type,
        rentPrice: form.rentPrice,
        salePrice: form.salePrice,
        status: form.status,
        bedrooms: form.bedrooms,
        bath: form.bath,
        size: form.size,
        floor: form.floor,
        address: form.address,
        zip: form.zip,
        country: form.country,
        city: form.city,
        ownerId: form.ownerId,
        ownerName: form.ownerName,
        about: form.about,
        facility: form.facilities
      };

      // Convert photo to base64 if present
      if (photoFile) {
        try {
          // Validate file size (max 5MB)
          const maxSize = 5 * 1024 * 1024; // 5MB in bytes
          if (photoFile.size > maxSize) {
            showPopup('error', 'Image Too Large', 'Please select an image smaller than 5MB.');
            setLoading(false);
            return;
          }

          // Validate file type
          const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
          if (!validTypes.includes(photoFile.type)) {
            showPopup('error', 'Invalid Image Type', 'Please select a valid image file (JPEG, PNG, GIF, or WebP).');
            setLoading(false);
            return;
          }

          const base64Photo = await convertToBase64(photoFile);
          
          // Validate base64 format
          if (!base64Photo || !base64Photo.startsWith('data:image/') || !base64Photo.includes('base64,')) {
            showPopup('error', 'Image Processing Error', 'Failed to process the image correctly. Please try another image.');
            setLoading(false);
            return;
          }

          payload.photo = base64Photo;
          console.log('Photo converted to base64, size:', base64Photo.length, 'type:', photoFile.type);
        } catch (photoError) {
          console.error('Error converting photo to base64:', photoError);
          showPopup('error', 'Image Processing Error', 'Failed to process the selected image. Please try a different image.');
          setLoading(false);
          return;
        }
      }

      console.log('Sending payload:', {
        ...payload,
        photo: payload.photo ? `[Base64 data - ${payload.photo.length} chars]` : 'No photo'
      });

      // Send as JSON with increased timeout
      const response = await axios.post('http://192.168.0.154:5000/api/property', payload, {
        headers: { 
          'Content-Type': 'application/json'
        },
        timeout: 30000, // 30 seconds timeout for large images
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      console.log('✅ Property created successfully:', response.data);
      showPopup('success', 'Property Added Successfully', 'The property has been added to the database.');
    } catch (err) {
      console.error('❌ Failed to add property:', err);
      console.error('📋 Full error object:', err);
      console.error('📋 Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        code: err.code,
        config: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers
        }
      });
      
      // Log the actual response if available
      if (err.response) {
        console.error('📋 Response data:', err.response.data);
        console.error('📋 Response status:', err.response.status);
        console.error('📋 Response headers:', err.response.headers);
      }
      
      let errorMsg = 'Failed to add property. Please try again.';
      let errorTitle = 'Failed to Add Property';
      
      if (err.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout. The image might be too large or the server is slow. Try a smaller image.';
        errorTitle = 'Request Timeout';
      } else if (err.response?.data) {
        errorMsg = err.response.data.error || err.response.data.message || errorMsg;
        if (err.response.data.details) {
          errorMsg += `\n\nDetails: ${err.response.data.details}`;
        }
      } else if (err.request) {
        errorMsg = 'Network error. Please check:\n• Your internet connection\n• Server is running on http://192.168.0.154:5000\n• CORS is properly configured';
        errorTitle = 'Network Error';
      }
      
      showPopup('error', errorTitle, errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityToggle = (facility) => {
    setForm(prev => ({ 
      ...prev, 
      facilities: prev.facilities.includes(facility) 
        ? prev.facilities.filter(f => f !== facility) 
        : [...prev.facilities, facility] 
    }));
  };

  const handleAddCustomFacility = () => {
    if (customFacility.trim() && !form.facilities.includes(customFacility.trim())) {
      setForm(prev => ({ ...prev, facilities: [...prev.facilities, customFacility.trim()] }));
      setCustomFacility('');
    }
  };

  const handleRemoveFacility = (facility) => setForm(prev => ({ ...prev, facilities: prev.facilities.filter(f => f !== facility) }));
  const resetForm = () => { setForm(initialForm); setPhotoFile(null); setStep(1); hidePopup(); onClose(); };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{step === 1 ? 'Add Property - Basic Info' : 'Add Property - Facilities & About'}</h3>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {step === 1 ? (
              <>
                {/* Property Details */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Property Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange} 
                      required 
                      placeholder="Enter property name" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Property Type</label>
                    <select name="type" value={form.type} onChange={handleChange}>
                      <option value="Villas">Villas</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Residences">Residences</option>
                      <option value="Guest House">Guest House</option>
                      <option value="House">House</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Property Available For *</label>
                    <select name="status" value={form.status} onChange={handleChange} required>
                      <option value="sale">Sale</option>
                      <option value="rent">Rent</option>
                      <option value="both">Both (Rent & Sale)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  {(form.status === 'rent' || form.status === 'both') && (
                    <PriceInput 
                      label="Rent Price (Monthly)" 
                      name="rentPrice" 
                      value={form.rentPrice} 
                      onChange={handleChange} 
                      required={form.status === 'rent' || form.status === 'both'} 
                      placeholder="25,000" 
                    />
                  )}
                  {(form.status === 'sale' || form.status === 'both') && (
                    <PriceInput 
                      label="Sale Price" 
                      name="salePrice" 
                      value={form.salePrice} 
                      onChange={handleChange} 
                      required={form.status === 'sale' || form.status === 'both'} 
                      placeholder="50,00,000" 
                    />
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Bedrooms</label>
                    <select name="bedrooms" value={form.bedrooms} onChange={handleChange}>
                      <option value="">Select</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} BHK</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Bathrooms</label>
                    <select name="bath" value={form.bath} onChange={handleChange}>
                      <option value="">Select</option>
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}{n === 5 ? '+' : ''}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Area (Square Feet)</label>
                    <input 
                      type="text" 
                      name="size" 
                      value={form.size} 
                      onChange={handleChange} 
                      placeholder="1200 sq ft" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Floor</label>
                    <input 
                      type="text" 
                      name="floor" 
                      value={form.floor} 
                      onChange={handleChange} 
                      placeholder="Ground Floor / 2nd Floor" 
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Property Address</label>
                  <textarea 
                    name="address" 
                    value={form.address} 
                    onChange={handleChange} 
                    placeholder="Enter complete address" 
                    rows="3" 
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Country</label>
                    <select name="country" value={form.country} onChange={handleChange}>
                      <option value="">Choose a Country</option>
                      {['India', 'USA', 'UK', 'Canada'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <select name="city" value={form.city} onChange={handleChange}>
                      <option value="">Choose a City</option>
                      {['Chennai', 'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'New York', 'London','Austin'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Zip Code</label>
                    <input 
                      type="text" 
                      name="zip" 
                      value={form.zip} 
                      onChange={handleChange} 
                      placeholder="600001" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Property Image</label>
                    <input 
                      type="file" 
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" 
                      onChange={(e) => setPhotoFile(e.target.files[0])} 
                      style={{ padding: '8px' }} 
                    />
                    {photoFile && (
                      <small style={{ color: '#666', marginTop: '4px', display: 'block' }}>
                        Selected: {photoFile.name} ({(photoFile.size / 1024).toFixed(2)} KB)
                      </small>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Owner ID *</label>
                    <select name="ownerId" value={form.ownerId} onChange={handleChange} required>
                      <option value="">Select Owner ID</option>
                      {Array.isArray(owners) && owners.length > 0 ? (
                        owners.map(owner => (
                          <option key={owner._id} value={owner.ownerId}>
                            {owner.ownerId} - {owner.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No owners available</option>
                      )}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Owner Name</label>
                    <input 
                      type="text" 
                      name="ownerName" 
                      value={form.ownerName} 
                      readOnly 
                      style={{ backgroundColor: '#f5f5f5' }} 
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <FacilitiesSection 
                  facilities={form.facilities} 
                  onToggle={handleFacilityToggle} 
                  onAdd={handleAddCustomFacility} 
                  onRemove={handleRemoveFacility} 
                  customFacility={customFacility} 
                  setCustomFacility={setCustomFacility} 
                />
                <div className="form-group">
                  <label>About Property</label>
                  <textarea 
                    name="about" 
                    value={form.about} 
                    onChange={handleChange} 
                    placeholder="Describe the property in detail" 
                    rows="5" 
                    style={{ width: '100%', minHeight: '100px' }} 
                  />
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            {step === 2 ? (
              <>
                <button type="button" onClick={() => setStep(1)} className="btn btn-back">← Back</button>
                <button type="submit" disabled={loading} className="btn btn-save">
                  {loading ? 'Saving...' : 'Save Property'}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setStep(2)} className="btn btn-next">Next →</button>
            )}
          </div>
        </form>

        <Popup 
          isOpen={popup.show} 
          onClose={popup.type === 'success' ? resetForm : hidePopup} 
          type={popup.type} 
          title={popup.title} 
          message={popup.message} 
        />
      </div>
    </div>
  );
};

export default AddProperty;