// AddOwnerModal.jsx
import React, { useState } from 'react';
import axios from 'axios';

// Success Popup Component
const SuccessPopup = ({ isOpen, onClose, title = "Owner Added Successfully" }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px 60px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        minWidth: '400px',
        position: 'relative',
        animation: 'slideIn 0.3s ease-out'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            color: '#666',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ×
        </button>

        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <span style={{
            fontSize: '30px',
            color: 'white'
          }}>✓</span>
        </div>

        <h2 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: '#333',
          margin: '0 0 30px 0',
          lineHeight: '1.2'
        }}>
          {title}
        </h2>

        <button
          onClick={onClose}
          style={{
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 40px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            minWidth: '120px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#3367d6'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4285f4'}
        >
          OK
        </button>

        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

// Error Popup Component
const ErrorPopup = ({ isOpen, onClose, title = "Error", message = "Something went wrong!" }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '40px 60px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        minWidth: '400px',
        maxWidth: '500px',
        position: 'relative',
        animation: 'slideIn 0.3s ease-out'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            color: '#666',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ×
        </button>

        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#f44336',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto'
        }}>
          <span style={{
            fontSize: '30px',
            color: 'white'
          }}>✕</span>
        </div>

        <h2 style={{
          fontSize: '28px',
          fontWeight: '600',
          color: '#333',
          margin: '0 0 15px 0',
          lineHeight: '1.2'
        }}>
          {title}
        </h2>

        <p style={{
          fontSize: '16px',
          color: '#666',
          margin: '0 0 30px 0',
          lineHeight: '1.4'
        }}>
          {message}
        </p>

        <button
          onClick={onClose}
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 40px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            minWidth: '120px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#f44336'}
        >
          OK
        </button>

        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

const AddOwnerModal = ({ isOpen, onClose, onSave }) => {
  const initialForm = {
    name: '',
    email: '',
    contact: '',
    address: '',
    doj: '',
    status: 'Active',
    city: '',
    agency: '',
    licenseNumber: '',
    textNumber: '',
    servicesArea: '',
    about: '',
    propertySold: '',
    propertyRent: ''
  };

  const [form, setForm] = useState(initialForm);
  const [ownerPhoto, setOwnerPhoto] = useState(null);
  const [ownerPhotoName, setOwnerPhotoName] = useState('No file chosen');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    
    // Phone number validation for contact field
    if (name === 'contact') {
      // Only allow digits
      const digitsOnly = value.replace(/\D/g, '');
      
      // Limit to 10 digits
      const limitedValue = digitsOnly.slice(0, 10);
      
      setForm((prev) => ({ ...prev, [name]: limitedValue }));
      
      // Show error if length is not 10 and field is not empty
      if (limitedValue.length > 0 && limitedValue.length < 10) {
        setPhoneError('Phone number must be exactly 10 digits');
      } else {
        setPhoneError('');
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleOwnerFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOwnerPhoto(file);
      setOwnerPhotoName(file.name);
      console.log('Photo selected:', file.name);
    } else {
      setOwnerPhoto(null);
      setOwnerPhotoName('No file chosen');
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const validateForm = () => {
    // Check if phone number is provided and is exactly 10 digits
    if (form.contact && form.contact.length !== 10) {
      setErrorMessage('Phone number must be exactly 10 digits');
      setShowErrorPopup(true);
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      let photoBase64 = null;
      let photoInfo = null;

      if (ownerPhoto) {
        photoBase64 = await convertToBase64(ownerPhoto);
        photoInfo = {
          name: ownerPhoto.name,
          type: ownerPhoto.type,
          size: ownerPhoto.size
        };
      }

      const payload = {
        ...form,
        photo: photoBase64,
        photoInfo: photoInfo
      };

      // Debug logs
      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Full form state:', form);
      console.log('DOJ value:', form.doj, '| Type:', typeof form.doj, '| Is empty?', form.doj === '');
      console.log('Contact value:', form.contact, '| Length:', form.contact.length);
      console.log('Full payload:', payload);
      console.log('DOJ in payload:', payload.doj);
      console.log('============================');

      const response = await axios.post(
        'http://192.168.0.154:5000/api/owners/add-owner',
        payload,
        {
          headers: { 
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Owner added successfully:', response.data);
      setShowSuccessPopup(true);
      onSave(response.data);

    } catch (error) {
      console.error('Error saving owner:', error.response ? error.response.data : error.message);
      
      let errorMsg = 'Failed to save owner. Please try again.';
      
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.status) {
        errorMsg = `Server Error: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = 'Network error. Please check your connection and try again.';
      }
      
      setErrorMessage(errorMsg);
      setShowErrorPopup(true);
      
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{step === 1 ? 'Add Owner - Basic Info' : 'Add Owner - Professional Details'}</h3>
          <button onClick={onClose} className="close-btn" style={{ fontSize: '16px' }}> ✖ </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            {step === 1 ? (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ownerName">Owner Name</label>
                    <input type="text" id="ownerName" name="name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ownerEmail">Owner Email</label>
                    <input type="email" id="ownerEmail" name="email" value={form.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ownerNumber">Owner Number (10 digits)</label>
                    <input 
                      type="tel" 
                      id="ownerNumber" 
                      name="contact" 
                      value={form.contact} 
                      onChange={handleChange}
                      placeholder="Enter 10-digit phone number"
                      maxLength="10"
                      pattern="[0-9]{10}"
                      title="Phone number must be exactly 10 digits"
                    />
                    {phoneError && (
                      <span style={{ 
                        color: '#f44336', 
                        fontSize: '12px', 
                        marginTop: '4px', 
                        display: 'block' 
                      }}>
                        {phoneError}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="joiningDate">Joining Date</label>
                    <input 
                      type="date" 
                      id="joiningDate" 
                      name="doj" 
                      value={form.doj} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="ownerAddress">Owner Address</label>
                  <textarea id="ownerAddress" name="address" value={form.address} onChange={handleChange}></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ownerImage">Owner Image</label>
                    <div className="custom-file-input">
                      <input type="file" id="ownerImage" name="photo" accept="image/*" onChange={handleOwnerFileChange} required />
                      <span>{ownerPhotoName}</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select id="status" name="status" value={form.status} onChange={handleChange}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <select id="city" name="city" value={form.city} onChange={handleChange}>
                      <option value="">Choose a City</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Delhi">Delhi</option>
                      <option value="New York">New York</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-group full-width">
                  <label htmlFor="about">About Owner</label>
                  <textarea id="about" name="about" value={form.about} onChange={handleChange} placeholder="Tell us about the owner/agent..."></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="agency">Agency</label>
                    <input type="text" id="agency" name="agency" value={form.agency} onChange={handleChange} placeholder="e.g., Universo Realtors" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="licenseNumber">Agent License</label>
                    <input type="text" id="licenseNumber" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} placeholder="e.g., LC-5758-2048-3944" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="textNumber">Text Number</label>
                    <input type="text" id="textNumber" name="textNumber" value={form.textNumber} onChange={handleChange} placeholder="e.g., TC-9275-PC-55685" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="servicesArea">Services Area</label>
                    <input type="text" id="servicesArea" name="servicesArea" value={form.servicesArea} onChange={handleChange} placeholder="e.g., Lincoln Drive Harrisburg" />
                  </div>
                </div>
                <p style={{ marginTop: '20px', marginBottom: '10px', borderTop: '1px solid #eee', paddingTop: '15px', fontSize: '14px', fontWeight: 'bold' }}>Property Status</p>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="propertySold">Properties Sold</label>
                    <input type="number" id="propertySold" name="propertySold" value={form.propertySold} onChange={handleChange} placeholder="e.g., 243" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="propertyRent">Properties for Rent</label>
                    <input type="number" id="propertyRent" name="propertyRent" value={form.propertyRent} onChange={handleChange} placeholder="e.g., 243" />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            {step === 1 ? (
              <button type="button" className="btn btn-next" onClick={() => setStep(2)}>
                Next
              </button>
            ) : (
              <>
                <button type="button" className="btn btn-back" onClick={() => setStep(1)}>
                  Back
                </button>
                <button type="submit" className="btn btn-save" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Owner'}
                </button>
              </>
            )}
          </div>
        </form>

        <SuccessPopup 
          isOpen={showSuccessPopup}
          onClose={() => {
            setShowSuccessPopup(false);
            setForm(initialForm);
            setOwnerPhoto(null);
            setOwnerPhotoName('No file chosen');
            setStep(1);
            setPhoneError('');
            onClose();
          }}
          title="Owner Added Successfully"
        />

        <ErrorPopup 
          isOpen={showErrorPopup}
          onClose={() => setShowErrorPopup(false)}
          title="Failed to Save Owner"
          message={errorMessage}
        />
      </div>
    </div>
  );
};

export default AddOwnerModal;