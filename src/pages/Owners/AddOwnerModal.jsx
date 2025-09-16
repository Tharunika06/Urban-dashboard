// AddOwnerModal.jsx

import React, { useState } from 'react';
import axios from 'axios';

const AddOwnerModal = ({ isOpen, onClose, onSave }) => {
  const initialForm = {
    // Step 1
    name: '',
    email: '',
    contact: '',
    address: '',
    doj: '',
    status: 'Active',
    city: '',
    // Step 2
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleOwnerFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOwnerPhoto(file);
      setOwnerPhotoName(file.name);
    } else {
      setOwnerPhoto(null);
      setOwnerPhotoName('No file chosen');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (ownerPhoto) {
      data.append('photo', ownerPhoto);
    }

    try {
      const response = await axios.post('http://192.168.0.152:5000/api/owners/add-owner', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Owner added successfully!');
      onSave(response.data);
      onClose();

      setForm(initialForm);
      setOwnerPhoto(null);
      setOwnerPhotoName('No file chosen');
      setStep(1);
    } catch (error) {
      console.error('Error saving owner:', error.response ? error.response.data : error.message);
      alert('Failed to save owner. Check console for details.');
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

        <form onSubmit={handleFormSubmit} encType="multipart/form-data">
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
                    <label htmlFor="ownerNumber">Owner Number</label>
                    <input type="text" id="ownerNumber" name="contact" value={form.contact} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="joiningDate">Joining Date</label>
                    <input type="date" id="joiningDate" name="doj" value={form.doj} onChange={handleChange} />
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
      </div>
    </div>
  );
};

export default AddOwnerModal;
