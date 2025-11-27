// src/pages/Owners/AddOwnerModal.jsx
import React, { useState } from 'react';
import GradientButton from '../../components/common/GradientButton';
import PopupMessage from '../../components/common/PopupMessage';
import ownerService from '../../services/ownerService';
import { 
  BUTTON_LABELS, 
  FORM_LABELS,
  CITIES,
  convertToBase64,
  POPUP_MESSAGES,
  ICONS
} from '../../utils/constants';

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
    about: ''
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
      const digitsOnly = value.replace(/\D/g, '');
      const limitedValue = digitsOnly.slice(0, 10);
      
      setForm((prev) => ({ ...prev, [name]: limitedValue }));
      
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

  const validateForm = () => {
    if (form.contact && form.contact.length !== 10) {
      setErrorMessage('Phone number must be exactly 10 digits');
      setShowErrorPopup(true);
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
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

      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Full form state:', form);
      console.log('DOJ value:', form.doj, '| Type:', typeof form.doj, '| Is empty?', form.doj === '');
      console.log('Contact value:', form.contact, '| Length:', form.contact.length);
      console.log('Full payload:', payload);
      console.log('Note: Property stats will be auto-calculated from actual properties');
      console.log('============================');

      const response = await ownerService.createOwner(payload);

      console.log('Owner added successfully:', response);
      console.log('Initial stats (all 0):', {
        propertyOwned: response.owner?.propertyOwned || 0,
        propertyRent: response.owner?.propertyRent || 0,
        propertySold: response.owner?.propertySold || 0,
        totalListing: response.owner?.totalListing || 0
      });
      
      setShowSuccessPopup(true);
      onSave(response);

    } catch (error) {
      console.error('Error saving owner:', error.response ? error.response.data : error.message);
      
      let errorMsg = POPUP_MESSAGES.PROPERTY_ADD_FAILED.message;
      
      if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.status) {
        errorMsg = `Server Error: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = POPUP_MESSAGES.NETWORK_ERROR.message;
      }
      
      setErrorMessage(errorMsg);
      setShowErrorPopup(true);
      
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setForm(initialForm);
    setOwnerPhoto(null);
    setOwnerPhotoName('No file chosen');
    setStep(1);
    setPhoneError('');
    setShowSuccessPopup(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{step === 1 ? 'Add Owner - Basic Info' : 'Add Owner - Professional Details'}</h3>
          <button onClick={onClose} className="close-btn" style={{ fontSize: '16px' }}> 
            {BUTTON_LABELS.CLOSE} 
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            {step === 1 ? (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ownerName">{FORM_LABELS.OWNER_NAME}</label>
                    <input 
                      type="text" 
                      id="ownerName" 
                      name="name" 
                      value={form.name} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ownerEmail">Owner Email</label>
                    <input 
                      type="email" 
                      id="ownerEmail" 
                      name="email" 
                      value={form.email} 
                      onChange={handleChange} 
                      required 
                    />
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
                  <textarea 
                    id="ownerAddress" 
                    name="address" 
                    value={form.address} 
                    onChange={handleChange}
                  ></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ownerImage">Owner Image</label>
                    <div className="custom-file-input">
                      <input 
                        type="file" 
                        id="ownerImage" 
                        name="photo" 
                        accept="image/*" 
                        onChange={handleOwnerFileChange} 
                        required 
                      />
                      <span>{ownerPhotoName}</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select 
                      id="status" 
                      name="status" 
                      value={form.status} 
                      onChange={handleChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">{FORM_LABELS.CITY}</label>
                    <select 
                      id="city" 
                      name="city" 
                      value={form.city} 
                      onChange={handleChange}
                    >
                      <option value="">Choose a City</option>
                      {CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="form-group full-width">
                  <label htmlFor="about ">About Owner</label>
                  <textarea 
                    id="about" 
                    name="about" 
                    value={form.about} 
                    onChange={handleChange} 
                    placeholder="Tell us about the owner/agent..."
                  ></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="agency">Agency</label>
                    <input 
                      type="text" 
                      id="agency" 
                      name="agency" 
                      value={form.agency} 
                      onChange={handleChange} 
                      placeholder="e.g., Universo Realtors" 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="licenseNumber">Agent License</label>
                    <input 
                      type="text" 
                      id="licenseNumber" 
                      name="licenseNumber" 
                      value={form.licenseNumber} 
                      onChange={handleChange} 
                      placeholder="e.g., LC-5758-2048-3944" 
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="textNumber">Text Number</label>
                    <input 
                      type="text" 
                      id="textNumber" 
                      name="textNumber" 
                      value={form.textNumber} 
                      onChange={handleChange} 
                      placeholder="e.g., TC-9275-PC-55685" 
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="servicesArea">Services Area</label>
                    <input 
                      type="text" 
                      id="servicesArea" 
                      name="servicesArea" 
                      value={form.servicesArea} 
                      onChange={handleChange} 
                      placeholder="e.g., Lincoln Drive Harrisburg" 
                    />
                  </div>
                </div>
                
    
  </>
            )}
          </div>

          <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            {step === 1 ? (
              <GradientButton 
                type="button" // ✅ Explicitly set to "button" so it doesn't submit
                onClick={() => setStep(2)}
                width="100px"
                height="38px"
              >
                {BUTTON_LABELS.NEXT}
              </GradientButton>
            ) : (
              <>
                <GradientButton 
                  type="button" // ✅ Back button should not submit
                  onClick={() => setStep(1)}
                  width="100px"
                  height="38px"
                >
                  {BUTTON_LABELS.BACK}
                </GradientButton>
                <GradientButton 
                  type="submit" // ✅ Only Save button submits the form
                  disabled={loading}
                  width="140px"
                  height="38px"
                >
                  {loading ? BUTTON_LABELS.SAVING : BUTTON_LABELS.SAVE}
                </GradientButton>
              </>
            )}
          </div>
        </form>

        {showSuccessPopup && (
          <PopupMessage
            title="Owner Added Successfully"
            message="The owner has been successfully added to the system."
            icon={ICONS.SUCCESS}
            confirmLabel={BUTTON_LABELS.OK}
            cancelLabel=""
            onConfirm={resetAndClose}
            onCancel={resetAndClose}
          />
        )}

        {showErrorPopup && (
          <PopupMessage
            title="Failed to Save Owner"
            message={errorMessage}
            icon={ICONS.ERROR}
            confirmLabel={BUTTON_LABELS.OK}
            cancelLabel=""
            onConfirm={() => setShowErrorPopup(false)}
            onCancel={() => setShowErrorPopup(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AddOwnerModal;