// src/pages/Settings/GeneralSettings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService, { storage } from "../../services/authService";
import { saveProfile } from "../../services/profileService";
import GradientButton from "../../components/common/GradientButton";
import "../../styles/GeneralSettings.css";

const GeneralSettings = () => {
  const navigate = useNavigate();
  const [adminId, setAdminId] = useState(null);
  const [adminName, setAdminName] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isNewProfile, setIsNewProfile] = useState(false);

  useEffect(() => {
    loadAdminProfile();
  }, []);

  const handleUnauthorized = () => {
    setError('Session expired. Please login again.');
    
    storage.clearAll();
    
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 1500);
  };

  const loadAdminProfile = async () => {
    try {
      setLoading(true);

      const data = await authService.getAdminProfile();

      if (!data.success) {
        throw new Error(data.message || 'Failed to load profile');
      }

      if (data.isNewProfile) {
        const adminIdFromResponse = data.adminId || data.profile?._id || data.userId;
        setAdminId(adminIdFromResponse);
        setIsNewProfile(true);
        setAdminName("");
        setPhone("");
        setProfilePhoto("");
        setError("");
      } else {
        setAdminId(data.profile._id);
        setIsNewProfile(false);
        setAdminName(data.profile.name || "");
        setPhone(data.profile.phone || "");
        setProfilePhoto(data.profile.photo || "");
        setError("");
      }
      
    } catch (err) {
      console.error('❌ Error loading profile:', err);
      console.error('Error details:', err.response?.data);
      
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      
      const storedUser = storage.getUser();
      const adminIdFromStorage = storedUser?.id || storedUser?._id;
      
      setAdminId(adminIdFromStorage);
      setIsNewProfile(true);
      setAdminName("");
      setPhone("");
      setProfilePhoto("");
      
      if (err.response?.status !== 404) {
        setError("Could not load profile. You can create a new one below.");
      } else {
        setError("");
      }
      
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      setProfilePhotoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!adminId) {
        setError('Admin ID not found. Please refresh the page.');
        setLoading(false);
        return;
      }

      if (!adminName.trim()) {
        setError('Admin name is required');
        setLoading(false);
        return;
      }

      if (!phone.trim()) {
        setError('Phone number is required');
        setLoading(false);
        return;
      }

      const cleanPhone = phone.replace(/\D/g, '');
      if (!/^[0-9]{10}$/.test(cleanPhone)) {
        setError('Please enter a valid 10-digit phone number');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('name', adminName.trim());
      formData.append('phone', cleanPhone);
      
      if (profilePhotoFile) {
        formData.append('profilePhoto', profilePhotoFile);
      }

      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      const data = await authService.updateAdminProfile(adminId, formData);

      if (data.success) {
        setProfilePhoto(data.profile.photo || "");
        setIsNewProfile(false);
        
        saveProfile({
          name: adminName.trim(),
          phone: cleanPhone,
          photo: data.profile.photo
        });
        
        window.dispatchEvent(new CustomEvent("profileUpdated", {
          detail: {
            name: adminName.trim(),
            phone: cleanPhone,
            photo: data.profile.photo
          }
        }));
        
        setSuccess(data.message || "Profile saved successfully!");
        setError('');
        setProfilePhotoFile(null);
        
        const fileInput = document.getElementById('upload-photo');
        if (fileInput) fileInput.value = '';
        
        setTimeout(() => setSuccess(''), 3000);
        
      } else {
        throw new Error(data.message || 'Failed to save profile');
      }
    } catch (err) {
      console.error('❌ Error saving profile:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      
      setError(`Failed to save profile: ${err.response?.data?.error || err.message}`);
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setLoading(true);
      setError('');

      if (!adminId) {
        setError('Admin ID not found. Please refresh the page.');
        setLoading(false);
        return;
      }

      const data = await authService.deleteAdminPhoto(adminId);

      if (data.success) {
        setProfilePhoto("");
        setProfilePhotoFile(null);
        
        const fileInput = document.getElementById('upload-photo');
        if (fileInput) fileInput.value = '';
        
        saveProfile({
          name: adminName,
          phone: phone,
          photo: ""
        });
        
        window.dispatchEvent(new CustomEvent("profileUpdated", {
          detail: {
            name: adminName,
            phone: phone,
            photo: ""
          }
        }));
        
        setSuccess("Profile photo removed successfully!");
        setTimeout(() => setSuccess(''), 3000);
        
      } else {
        setError(data.message || 'Failed to remove photo');
      }
    } catch (err) {
      console.error('❌ Error removing photo:', err);
      
      if (err.response?.status === 401) {
        handleUnauthorized();
        return;
      }
      
      setError('Failed to remove photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* === Admin Profile Card === */}
      <div className="settings-card">
        <div className="section">
          <h3>Admin Profile</h3>
          <p className="section-subtitle">
            {isNewProfile 
              ? "Create your admin profile to get started" 
              : "Update your profile details and contact information"}
          </p>

          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert-success">
              {success}
            </div>
          )}

          {isNewProfile && !loading && !error && (
            <div className="alert-warning">
              Welcome! Please create your admin profile below.
            </div>
          )}

          <div className="form-grid">
            <div className="form-group file-upload">
              <label>Profile Photo</label>
              <div className="file-box">
                <div className="file-box-container">
                  {profilePhoto ? (
                    <div className="photo-preview-wrapper">
                      <div className="photo-preview-container">
                        <img
                          src={profilePhoto}
                          alt="Profile"
                          className="preview-photo"
                        />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={loading}
                          className="remove-photo-btn"
                          title="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                      <span className="photo-selected-text">Photo selected</span>
                    </div>
                  ) : (
                    <span className="no-photo-text">No photo selected</span>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="file-input-hidden"
                    id="upload-photo"
                    disabled={loading}
                  />
                               <button className="file-btn">Select file</button>

                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Admin Name *</label>
              <input
                type="text"
                placeholder="John Doe"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="profile-save-btn-container">
            <GradientButton 
              onClick={handleSaveProfile}
              disabled={loading || !adminId}
              width="200px"
              height="48px"
            >
              {loading 
                ? 'Saving...' 
                : isNewProfile 
                  ? 'Create Profile' 
                  : 'Save Profile'}
            </GradientButton>
          </div>
        </div>
      </div>
      <br />
      
      {/* === Company Information Card === */}
      <div className="settings-card">
        <div className="section">
          <h3>Company Information</h3>
          <p className="section-subtitle">
            Update your company details and contact information
          </p>

          <div className="form-grid">
            <div className="form-group file-upload">
              <label>Company Logo</label>
              <div className="file-box">
                <span>Select or drag file</span>
                <button className="file-btn">Select file</button>
              </div>
            </div>

            <div className="form-group">
              <label>Company Name</label>
              <input type="text" placeholder="Swift Ship" />
            </div>

            <div className="form-group">
              <label>Contact Email</label>
              <input type="email" placeholder="support@swiftship.com" />
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input type="text" placeholder="9876543210" />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Address</label>
            <textarea placeholder="201, Logistics Tower, Mumbai, Maharashtra 400001"></textarea>
          </div>
        </div>
      </div>
      <br />
      
      {/* === Preferences Card === */}
      <div className="settings-card">
        <div className="section">
          <h3>Preferences</h3>
          <p className="section-subtitle">
            Configure your default system preferences
          </p>

          <div className="form-grid">
            <div className="form-group">
              <label>Default Currency</label>
              <select>
                <option>₹ INR - Indian Rupee</option>
                <option>$ USD - US Dollar</option>
                <option>€ EUR - Euro</option>
              </select>
            </div>

            <div className="form-group">
              <label>Timezone</label>
              <select>
                <option>Asia/Kolkata (GMT+5:30)</option>
                <option>UTC (GMT+0)</option>
                <option>EST (GMT-5)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Language</label>
              <select>
                <option>English</option>
                <option>Hindi</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>

        <div className="save-btn-container">
          <GradientButton 
            width="200px"
            height="48px"
          >
            Save Changes
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;