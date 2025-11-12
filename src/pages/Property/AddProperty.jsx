// src/pages/Property/AddProperty.jsx
import React, { useState, useEffect } from 'react';
import PopupMessage from '../../components/common/PopupMessage';
import propertyService from '../../services/propertyService';
import {
  API_CONFIG,
  PROPERTY_TYPES,
  PROPERTY_STATUS,
  PROPERTY_STATUS_OPTIONS,
  BEDROOM_OPTIONS,
  BATHROOM_OPTIONS,
  COUNTRIES,
  CITIES,
  STATIC_FACILITIES,
  IMAGE_CONFIG,
  VALIDATION_MESSAGES,
  POPUP_MESSAGES,
  ICONS,
  PLACEHOLDERS,
  FORM_LABELS,
  BUTTON_LABELS,
  FORM_STEPS,
  convertToBase64,
} from '../../utils/constants';

// ---------------- Price Input Component ----------------
const PriceInput = ({ label, name, value, onChange, required, placeholder }) => (
  <div className="form-group">
    <label>
      {label} {required && '*'}
    </label>
    <div style={{ position: 'relative' }}>
      <span
        style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#666',
        }}
      >
        ₹
      </span>
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

// ---------------- Facilities Section Component ----------------
const FacilitiesSection = ({
  facilities,
  onToggle,
  onAdd,
  onRemove,
  customFacility,
  setCustomFacility,
}) => {
  return (
    <div className="form-group">
      <label>{FORM_LABELS.FACILITIES}</label>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          marginBottom: '15px',
        }}
      >
        {STATIC_FACILITIES.map((facility) => (
          <label
            key={facility}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '5px',
              cursor: 'pointer',
            }}
          >
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
          placeholder={PLACEHOLDERS.CUSTOM_FACILITY}
          value={customFacility}
          onChange={(e) => setCustomFacility(e.target.value)}
          style={{
            padding: '10px 50px 10px 10px',
            width: '100%',
            boxSizing: 'border-box',
            border: '1px solid #ddd',
            borderRadius: '4px',
          }}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
        />
        <button
          type="button"
          onClick={onAdd}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            padding: '6px 12px',
            border: 'none',
            backgroundColor: '#0a74da',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {BUTTON_LABELS.ADD}
        </button>
      </div>
      {facilities.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <strong>Selected Facilities:</strong>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginTop: '8px',
            }}
          >
            {facilities.map((facility, idx) => (
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
                  border: '1px solid #bbdefb',
                }}
              >
                {facility}
                <button
                  type="button"
                  onClick={() => onRemove(facility)}
                  style={{
                    marginLeft: '6px',
                    background: 'none',
                    border: 'none',
                    color: '#1976d2',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
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
  );
};

// ---------------- Main AddProperty Component ----------------
const AddProperty = ({ isOpen, onClose, onSave }) => {
  const initialForm = {
    name: '',
    type: PROPERTY_TYPES[0],
    rentPrice: '',
    salePrice: '',
    status: PROPERTY_STATUS.SALE,
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
    about: '',
  };

  const [form, setForm] = useState(initialForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState([]);
  const [customFacility, setCustomFacility] = useState('');
  const [step, setStep] = useState(1);
  const [popup, setPopup] = useState({
    show: false,
    type: '',
    title: '',
    message: '',
  });

  const showPopup = (type, title, message = '') =>
    setPopup({ show: true, type, title, message });
  const hidePopup = () =>
    setPopup({ show: false, type: '', title: '', message: '' });

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        // ✅ Use propertyService to fetch owners
        const data = await propertyService.getAllOwners();
        setOwners(data.owners || []);
      } catch (err) {
        console.error('Failed to fetch owners:', err);
        showPopup(
          POPUP_MESSAGES.FAILED_TO_LOAD_OWNERS.type,
          POPUP_MESSAGES.FAILED_TO_LOAD_OWNERS.title,
          POPUP_MESSAGES.FAILED_TO_LOAD_OWNERS.message
        );
      }
    };
    if (isOpen) fetchOwners();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'ownerId') {
      const selectedOwner = Array.isArray(owners)
        ? owners.find((o) => String(o.ownerId) === value)
        : null;
      setForm((prev) => ({
        ...prev,
        ownerId: value,
        ownerName: selectedOwner ? selectedOwner.name : '',
      }));
    } else if (name === 'status') {
      setForm((prev) => ({
        ...prev,
        [name]: value.toLowerCase(),
        rentPrice: '',
        salePrice: '',
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const { name, ownerId, status, rentPrice, salePrice } = form;

    if (!name.trim()) {
      showPopup(
        POPUP_MESSAGES.VALIDATION_ERROR.type,
        POPUP_MESSAGES.VALIDATION_ERROR.title,
        VALIDATION_MESSAGES.PROPERTY_NAME_REQUIRED
      );
      return false;
    }

    if (!ownerId) {
      showPopup(
        POPUP_MESSAGES.VALIDATION_ERROR.type,
        POPUP_MESSAGES.VALIDATION_ERROR.title,
        VALIDATION_MESSAGES.OWNER_ID_REQUIRED
      );
      return false;
    }

    if (status === PROPERTY_STATUS.RENT && !rentPrice.trim()) {
      showPopup(
        POPUP_MESSAGES.VALIDATION_ERROR.type,
        POPUP_MESSAGES.VALIDATION_ERROR.title,
        VALIDATION_MESSAGES.RENT_PRICE_REQUIRED
      );
      return false;
    }

    if (status === PROPERTY_STATUS.SALE && !salePrice.trim()) {
      showPopup(
        POPUP_MESSAGES.VALIDATION_ERROR.type,
        POPUP_MESSAGES.VALIDATION_ERROR.title,
        VALIDATION_MESSAGES.SALE_PRICE_REQUIRED
      );
      return false;
    }

    if (
      status === PROPERTY_STATUS.BOTH &&
      (!rentPrice.trim() || !salePrice.trim())
    ) {
      showPopup(
        POPUP_MESSAGES.VALIDATION_ERROR.type,
        POPUP_MESSAGES.VALIDATION_ERROR.title,
        VALIDATION_MESSAGES.BOTH_PRICES_REQUIRED
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
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
        facility: form.facilities,
      };

      if (photoFile) {
        try {
          // Validate file size
          if (photoFile.size > IMAGE_CONFIG.MAX_SIZE) {
            showPopup(
              POPUP_MESSAGES.IMAGE_TOO_LARGE.type,
              POPUP_MESSAGES.IMAGE_TOO_LARGE.title,
              POPUP_MESSAGES.IMAGE_TOO_LARGE.message
            );
            setLoading(false);
            return;
          }

          // Validate file type
          if (!IMAGE_CONFIG.VALID_TYPES.includes(photoFile.type)) {
            showPopup(
              POPUP_MESSAGES.INVALID_IMAGE_TYPE.type,
              POPUP_MESSAGES.INVALID_IMAGE_TYPE.title,
              POPUP_MESSAGES.INVALID_IMAGE_TYPE.message
            );
            setLoading(false);
            return;
          }

          const base64Photo = await convertToBase64(photoFile);

          // Validate base64 format
          if (
            !base64Photo ||
            !base64Photo.startsWith('data:image/') ||
            !base64Photo.includes('base64,')
          ) {
            showPopup(
              POPUP_MESSAGES.IMAGE_FORMAT_ERROR.type,
              POPUP_MESSAGES.IMAGE_FORMAT_ERROR.title,
              POPUP_MESSAGES.IMAGE_FORMAT_ERROR.message
            );
            setLoading(false);
            return;
          }

          payload.photo = base64Photo;
        } catch (photoError) {
          console.error('Error converting photo to base64:', photoError);
          showPopup(
            POPUP_MESSAGES.IMAGE_PROCESSING_ERROR.type,
            POPUP_MESSAGES.IMAGE_PROCESSING_ERROR.title,
            POPUP_MESSAGES.IMAGE_PROCESSING_ERROR.message
          );
          setLoading(false);
          return;
        }
      }

      // ✅ Use propertyService to create property
      const response = await propertyService.createProperty(payload);

      console.log('✅ Property created successfully:', response);
      showPopup(
        POPUP_MESSAGES.PROPERTY_ADDED.type,
        POPUP_MESSAGES.PROPERTY_ADDED.title,
        POPUP_MESSAGES.PROPERTY_ADDED.message
      );

      // Pass the new property back to parent
      if (onSave) {
        onSave(response);
      }
    } catch (err) {
      console.error('❌ Failed to add property:', err);

      let errorMsg = POPUP_MESSAGES.PROPERTY_ADD_FAILED.message;
      let errorTitle = POPUP_MESSAGES.PROPERTY_ADD_FAILED.title;

      if (err.code === 'ECONNABORTED') {
        errorMsg = POPUP_MESSAGES.REQUEST_TIMEOUT.message;
        errorTitle = POPUP_MESSAGES.REQUEST_TIMEOUT.title;
      } else if (err.response?.data) {
        errorMsg = err.response.data.error || err.response.data.message || errorMsg;
        if (err.response.data.details) {
          errorMsg += `\n\nDetails: ${err.response.data.details}`;
        }
      } else if (err.request) {
        errorMsg = POPUP_MESSAGES.NETWORK_ERROR.message;
        errorTitle = POPUP_MESSAGES.NETWORK_ERROR.title;
      }

      showPopup('error', errorTitle, errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityToggle = (facility) => {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const handleAddCustomFacility = () => {
    if (
      customFacility.trim() &&
      !form.facilities.includes(customFacility.trim())
    ) {
      setForm((prev) => ({
        ...prev,
        facilities: [...prev.facilities, customFacility.trim()],
      }));
      setCustomFacility('');
    }
  };

  const handleRemoveFacility = (facility) =>
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((f) => f !== facility),
    }));

  const resetForm = () => {
    setForm(initialForm);
    setPhotoFile(null);
    setStep(1);
    hidePopup();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{step === 1 ? FORM_STEPS.BASIC_INFO : FORM_STEPS.FACILITIES_ABOUT}</h3>
          <button className="close-btn" onClick={onClose}>
            {BUTTON_LABELS.CLOSE}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {step === 1 ? (
              <>
                {/* Property Name & Type */}
                <div className="form-row">
                  <div className="form-group">
                    <label>{FORM_LABELS.PROPERTY_NAME} *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder={PLACEHOLDERS.PROPERTY_NAME}
                    />
                  </div>
                  <div className="form-group">
                    <label>{FORM_LABELS.PROPERTY_TYPE}</label>
                    <select name="type" value={form.type} onChange={handleChange}>
                      {PROPERTY_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Property Status */}
                <div className="form-row">
                  <div className="form-group">
                    <label>{FORM_LABELS.PROPERTY_STATUS} *</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      required
                    >
                      {PROPERTY_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Prices */}
                <div className="form-row">
                  {(form.status === PROPERTY_STATUS.RENT ||
                    form.status === PROPERTY_STATUS.BOTH) && (
                    <PriceInput
                      label={FORM_LABELS.RENT_PRICE}
                      name="rentPrice"
                      value={form.rentPrice}
                      onChange={handleChange}
                      required={
                        form.status === PROPERTY_STATUS.RENT ||
                        form.status === PROPERTY_STATUS.BOTH
                      }
                      placeholder={PLACEHOLDERS.RENT_PRICE}
                    />
                  )}
                  {(form.status === PROPERTY_STATUS.SALE ||
                    form.status === PROPERTY_STATUS.BOTH) && (
                    <PriceInput
                      label={FORM_LABELS.SALE_PRICE}
                      name="salePrice"
                      value={form.salePrice}
                      onChange={handleChange}
                      required={
                        form.status === PROPERTY_STATUS.SALE ||
                        form.status === PROPERTY_STATUS.BOTH
                      }
                      placeholder={PLACEHOLDERS.SALE_PRICE}
                    />
                  )}
                </div>

                {/* Bedrooms & Bathrooms */}
                <div className="form-row">
                  <div className="form-group">
                    <label>{FORM_LABELS.BEDROOMS}</label>
                    <select
                      name="bedrooms"
                      value={form.bedrooms}
                      onChange={handleChange}
                    >
                      <option value="">Select</option>
                      {BEDROOM_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n} BHK
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{FORM_LABELS.BATHROOMS}</label>
                    <select name="bath" value={form.bath} onChange={handleChange}>
                      <option value="">Select</option>
                      {BATHROOM_OPTIONS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                          {n === 5 ? '+' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Size & Floor */}
                <div className="form-row">
                  <div className="form-group">
                    <label>{FORM_LABELS.SIZE}</label>
                    <input
                      type="text"
                      name="size"
                      value={form.size}
                      onChange={handleChange}
                      placeholder={PLACEHOLDERS.SIZE}
                    />
                  </div>
                  <div className="form-group">
                    <label>{FORM_LABELS.FLOOR}</label>
                    <input
                      type="text"
                      name="floor"
                      value={form.floor}
                      onChange={handleChange}
                      placeholder={PLACEHOLDERS.FLOOR}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="form-group full-width">
                  <label>{FORM_LABELS.ADDRESS}</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder={PLACEHOLDERS.ADDRESS}
                    rows="3"
                  />
                </div>

                {/* Country & City */}
                <div className="form-row">
                  <div className="form-group">
                    <label>{FORM_LABELS.COUNTRY}</label>
                    <select
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                    >
                      <option value="">Choose a Country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{FORM_LABELS.CITY}</label>
                    <select name="city" value={form.city} onChange={handleChange}>
                      <option value="">Choose a City</option>
                      {CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Zip & Image */}
                <div className="form-row">
                  <div className="form-group">
                    <label>{FORM_LABELS.ZIP}</label>
                    <input
                      type="text"
                      name="zip"
                      value={form.zip}
                      onChange={handleChange}
                      placeholder={PLACEHOLDERS.ZIP}
                    />
                  </div>
                  <div className="form-group">
                    <label>{FORM_LABELS.PROPERTY_IMAGE}</label>
                    <input
                      type="file"
                      accept={IMAGE_CONFIG.ACCEPT_STRING}
                      onChange={(e) => setPhotoFile(e.target.files[0])}
                      style={{ padding: '8px' }}
                    />
                    {photoFile && (
                      <small
                        style={{
                          color: '#666',
                          marginTop: '4px',
                          display: 'block',
                        }}
                      >
                        Selected: {photoFile.name} (
                        {(photoFile.size / 1024).toFixed(2)} KB)
                      </small>
                    )}
                  </div>
                </div>

                {/* Owner ID & Name */}
                <div className="form-row">
                  <div className="form-group">
                    <label>{FORM_LABELS.OWNER_ID} *</label>
                    <select
                      name="ownerId"
                      value={form.ownerId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Owner ID</option>
                      {Array.isArray(owners) && owners.length > 0 ? (
                        owners.map((owner) => (
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
                    <label>{FORM_LABELS.OWNER_NAME}</label>
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
                {/* Facilities */}
                <FacilitiesSection
                  facilities={form.facilities}
                  onToggle={handleFacilityToggle}
                  onAdd={handleAddCustomFacility}
                  onRemove={handleRemoveFacility}
                  customFacility={customFacility}
                  setCustomFacility={setCustomFacility}
                />

                {/* About Property */}
                <div className="form-group">
                  <label>{FORM_LABELS.ABOUT}</label>
                  <textarea
                    name="about"
                    value={form.about}
                    onChange={handleChange}
                    placeholder={PLACEHOLDERS.ABOUT}
                    rows="5"
                    style={{ width: '100%', minHeight: '100px' }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="modal-footer">
            {step === 2 ? (
              <>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-back"
                >
                  {BUTTON_LABELS.BACK}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-save"
                >
                  {loading ? BUTTON_LABELS.SAVING : BUTTON_LABELS.SAVE}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn btn-next"
              >
                {BUTTON_LABELS.NEXT}
              </button>
            )}
          </div>
        </form>

        {/* Reusable Popup Component */}
        {popup.show && (
          <PopupMessage
            title={popup.title}
            message={popup.message}
            icon={popup.type === 'error' ? ICONS.ERROR : ICONS.SUCCESS}
            confirmLabel={BUTTON_LABELS.OK}
            cancelLabel=""
            onConfirm={popup.type === 'success' ? resetForm : hidePopup}
            onCancel={popup.type === 'success' ? resetForm : hidePopup}
          />
        )}
      </div>
    </div>
  );
};

export default AddProperty;