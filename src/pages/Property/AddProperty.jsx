// AddProperty.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddProperty = ({ isOpen, onClose }) => {
  const initialForm = {
    name: '',
    type: 'Villas',
    rentPrice: '',
    salePrice: '',
    price: '', 
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

  const staticFacilities = [
    'Big Swimming Pool',
    'Near Airport',
    'Car Parking',
    '24/7 Electricity',
  ];

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const res = await axios.get('http://192.168.0.152:5000/api/owners');
        setOwners(res.data);
      } catch (err) {
        console.error('Failed to fetch owners:', err);
      }
    };
    fetchOwners();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'ownerId') {
      const selectedOwner = owners.find(owner => String(owner.ownerId) === value);
      setForm(prev => ({
        ...prev,
        ownerId: value,
        ownerName: selectedOwner ? selectedOwner.name : ''
      }));
    } else if (name === 'status') {
      // Reset prices when status changes
      setForm(prev => ({
        ...prev,
        [name]: value.toLowerCase(),
        rentPrice: '',
        salePrice: '',
        price: ''
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleFacilityToggle = (facility) => {
    setForm(prev => {
      const exists = prev.facilities.includes(facility);
      return {
        ...prev,
        facilities: exists
          ? prev.facilities.filter(f => f !== facility)
          : [...prev.facilities, facility]
      };
    });
  };


  const handleAddCustomFacility = () => {
    if (customFacility.trim() && !form.facilities.includes(customFacility.trim())) {
      setForm(prev => ({
        ...prev,
        facilities: [...prev.facilities, customFacility.trim()]
      }));
      setCustomFacility('');
    }
  };

  const handleRemoveFacility = (facilityToRemove) => {
    setForm(prev => ({
      ...prev,
      facilities: prev.facilities.filter(f => f !== facilityToRemove)
    }));
  };

  const validateForm = () => {
    const { name, ownerId, status, rentPrice, salePrice } = form;
    
    if (!name.trim()) {
      alert('Property name is required');
      return false;
    }
    
    if (!ownerId) {
      alert('Owner ID is required');
      return false;
    }

    // Price validation based on status
    if (status === 'rent' && !rentPrice.trim()) {
      alert('Rent price is required for rental properties');
      return false;
    }
    
    if (status === 'sale' && !salePrice.trim()) {
      alert('Sale price is required for sale properties');
      return false;
    }
    
    if (status === 'both' && (!rentPrice.trim() || !salePrice.trim())) {
      alert('Both rent and sale prices are required when property is available for both');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'facilities') {
          formData.append('facility', JSON.stringify(value));
        } else if (value !== '') {
          formData.append(key, value);
        }
      });

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      // Debug: Log what we're sending
      console.log('Submitting property with data:', {
        name: form.name,
        status: form.status,
        rentPrice: form.rentPrice,
        salePrice: form.salePrice,
        facilities: form.facilities
      });

      const res = await axios.post('http://192.168.0.152:5000/api/property', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Property created:', res.data);
      alert('Property added successfully!');
      
      // Reset form
      setForm(initialForm);
      setPhotoFile(null);
      setStep(1);
      onClose();
      
    } catch (err) {
      console.error('Failed to add property:', err);
      const errorMessage = err.response?.data?.error || 'Failed to add property. Try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{step === 1 ? 'Add Property - Basic Info' : 'Add Property - Facilities & About'}</h3>
          <button className="close-btn" onClick={onClose}>
            <span style={{ fontSize: '20px' }}>✖</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="modal-body">
            {step === 1 ? (
              <>
                {/* Property Basic Info */}
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

                {/* Property Status and Pricing */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Property Available For *</label>
                    <select 
                      name="status"
                      value={form.status} 
                      onChange={handleChange}
                      required
                    >
                      <option value="sale">Sale</option>
                      <option value="rent">Rent</option>
                      <option value="both">Both (Rent & Sale)</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Price Fields Based on Status */}
                <div className="form-row">
                  {(form.status === 'rent' || form.status === 'both') && (
                    <div className="form-group">
                      <label>Rent Price (Monthly) *</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{
                          position: 'absolute',
                          left: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#666'
                        }}>₹</span>
                        <input
                          type="text"
                          name="rentPrice"
                          value={form.rentPrice}
                          onChange={handleChange}
                          placeholder="25,000"
                          style={{ paddingLeft: '25px' }}
                          required={form.status === 'rent' || form.status === 'both'}
                        />
                      </div>
                      <small style={{ color: '#666' }}>Enter monthly rent amount</small>
                    </div>
                  )}

                  {(form.status === 'sale' || form.status === 'both') && (
                    <div className="form-group">
                      <label>Sale Price *</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{
                          position: 'absolute',
                          left: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#666'
                        }}>₹</span>
                        <input
                          type="text"
                          name="salePrice"
                          value={form.salePrice}
                          onChange={handleChange}
                          placeholder="50,00,000"
                          style={{ paddingLeft: '25px' }}
                          required={form.status === 'sale' || form.status === 'both'}
                        />
                      </div>
                      <small style={{ color: '#666' }}>Enter total sale price</small>
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Bedrooms</label>
                    <select name="bedrooms" value={form.bedrooms} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="1">1 BHK</option>
                      <option value="2">2 BHK</option>
                      <option value="3">3 BHK</option>
                      <option value="4">4 BHK</option>
                      <option value="5">5+ BHK</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Bathrooms</label>
                    <select name="bath" value={form.bath} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5+</option>
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

                {/* Address */}
                <div className="form-group full-width">
                  <label>Property Address</label>
                  <textarea 
                    name="address" 
                    value={form.address} 
                    onChange={handleChange}
                    placeholder="Enter complete address with landmarks"
                    rows="3"
                  />
                </div>

                {/* Location Details */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Country</label>
                    <select name="country" value={form.country} onChange={handleChange}>
                      <option value="">Choose a Country</option>
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>City</label>
                    <select name="city" value={form.city} onChange={handleChange}>
                      <option value="">Choose a City</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Pune">Pune</option>
                      <option value="New York">New York</option>
                      <option value="London">London</option>
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
                      accept="image/*" 
                      onChange={handleFileChange}
                      style={{ padding: '8px' }}
                    />
                  </div>
                </div>

                {/* Owner Selection */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Owner ID *</label>
                    <select
                      name="ownerId"
                      value={form.ownerId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Owner ID</option>
                      {owners.map((owner) => (
                        <option key={owner._id} value={owner.ownerId}>
                          {owner.ownerId} - {owner.name}
                        </option>
                      ))}
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
                {/* Facilities Selection */}
                <div className="form-group">
                  <label>Property Facilities</label>
                  <div className="facilities-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '10px',
                    marginBottom: '15px'
                  }}>
                    {staticFacilities.map((facility) => (
                      <label key={facility} style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '5px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={form.facilities.includes(facility)}
                          onChange={() => handleFacilityToggle(facility)}
                          style={{ marginRight: '8px' }}
                        />
                        {facility}
                      </label>
                    ))}
                  </div>

                  {/* Custom Facility Input */}
                  <div className="custom-facility" style={{ 
                    marginTop: '15px', 
                    position: 'relative', 
                    width: '100%' 
                  }}>
                    <input
                      type="text"
                      placeholder="Add custom facility (e.g., Rooftop Garden, Solar Power)"
                      value={customFacility}
                      onChange={(e) => setCustomFacility(e.target.value)}
                      style={{
                        padding: '10px 50px 10px 10px',
                        width: '100%',
                        boxSizing: 'border-box',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomFacility();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomFacility}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '16px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        border: 'none',
                        backgroundColor: '#0a74da',
                        color: 'white',
                        borderRadius: '4px'
                      }}
                    >
                      Add
                    </button>
                  </div>

                  {/* Selected Facilities Display */}
                  {form.facilities.length > 0 && (
                    <div style={{ marginTop: '15px' }}>
                      <strong>Selected Facilities:</strong>
                      <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: '8px', 
                        marginTop: '8px' 
                      }}>
                        {form.facilities.map((facility, idx) => (
                          <span
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              backgroundColor: '#e3f2fd',
                              color: '#1976d2',
                              padding: '4px 8px',
                              borderRadius: '16px',
                              fontSize: '14px',
                              border: '1px solid #bbdefb'
                            }}
                          >
                            {facility}
                            <button
                              type="button"
                              onClick={() => handleRemoveFacility(facility)}
                              style={{
                                marginLeft: '6px',
                                background: 'none',
                                border: 'none',
                                color: '#1976d2',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                              }}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* About Property */}
                <div className="form-group">
                  <label>About Property</label>
                  <textarea
                    name="about"
                    value={form.about}
                    onChange={handleChange}
                    placeholder="Describe the property in detail - location benefits, nearby amenities, special features, etc."
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
                <button 
                  type="button" 
                  className="btn btn-back"
                  onClick={() => setStep(1)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ← Back
                </button>
                <button 
                  type="submit" 
                  className="btn btn-save" 
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: loading ? '#ccc' : '#0a74da',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Property'}
                </button>
              </>
            ) : (
              <button 
                type="button" 
                className="btn btn-next"
                onClick={() => setStep(2)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#0a74da',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Next →
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;