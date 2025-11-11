// src/pages/Settings/GeneralSettings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService, { storage } from "../../services/authService";
import { saveProfile } from "../../services/profileService"; // ✅ ADD THIS
import "../../styles/GeneralSettings.css";

const GeneralSettings = () => {
  const navigate = useNavigate();
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
    console.log("❌ Session expired - redirecting to login");
    setError('Session expired. Please login again.');
    
    storage.clearAll();
    
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 1500);
  };

  const loadAdminProfile = async () => {
    try {
      setLoading(true);
      console.log("🔄 Loading admin profile...");

      const data = await authService.getAdminProfile();
      console.log("✅ Profile data received:", data);

      // ✅ CRITICAL FIX: Check for success first
      if (!data.success) {
        throw new Error(data.message || 'Failed to load profile');
      }

      // Check if this is a new profile or existing
      if (data.isNewProfile) {
        console.log("ℹ️ No profile found - ready to create new profile");
        setIsNewProfile(true);
        setAdminName("");
        setPhone("");
        setProfilePhoto("");
        setError(""); // ✅ Clear any errors
      } else {
        console.log("✅ Loaded existing profile from database");
        setIsNewProfile(false);
        setAdminName(data.profile.name || "");
        setPhone(data.profile.phone || "");
        setProfilePhoto(data.profile.photo || "");
        setError(""); // ✅ Clear any errors
      }
      
    } catch (err) {
      console.error('❌ Error loading profile:', err);
      console.error('Error details:', err.response?.data);
      
      // ✅ CRITICAL FIX: Only redirect on 401 Unauthorized
      if (err.response?.status === 401) {
        handleUnauthorized();
        return; // ✅ Stop execution here
      }
      
      // ✅ For other errors (like network issues), show as new profile
      // This prevents automatic logout on profile load errors
      console.log("⚠️ Profile load error, treating as new profile...");
      setIsNewProfile(true);
      setAdminName("");
      setPhone("");
      setProfilePhoto("");
      
      // Only show error if it's not a "profile not found" scenario
      if (err.response?.status !== 404) {
        setError("Could not load profile. You can create a new one below.");
      } else {
        setError(""); // Don't show error for new profiles
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

      console.log(`💾 ${isNewProfile ? 'Creating new' : 'Updating'} profile...`);

      // ✅ Validate inputs
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
        console.log("📸 Adding photo file to form data");
        formData.append('profilePhoto', profilePhotoFile);
      }

      // Log form data for debugging
      console.log("📤 Sending data:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }

      const data = await authService.updateAdminProfile(formData);
      console.log("✅ Save response:", data);

      if (data.success) {
        setProfilePhoto(data.profile.photo || "");
        setIsNewProfile(false); // ✅ Mark as no longer new
        
        // Dispatch event for other components (like navbar) to update
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
      
      // ✅ Only redirect on 401
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

      const data = await authService.deleteAdminPhoto();

      if (data.success) {
        setProfilePhoto("");
        setProfilePhotoFile(null);
        
        const fileInput = document.getElementById('upload-photo');
        if (fileInput) fileInput.value = '';
        
        // Dispatch event for navbar update
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
            <div style={{ 
              color: '#dc3545', 
              backgroundColor: '#f8d7da', 
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ 
              color: '#155724', 
              backgroundColor: '#d4edda', 
              border: '1px solid #c3e6cb',
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {success}
            </div>
          )}

          {isNewProfile && !loading && !error && (
            <div style={{ 
              color: '#856404', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              ℹ️ Welcome! Please create your admin profile below.
            </div>
          )}

          <div className="form-grid">
            <div className="form-group file-upload">
              <label>Profile Photo</label>
              <div className="file-box">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  width: '100%'
                }}>
                  {profilePhoto ? (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px' 
                    }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                          src={profilePhoto}
                          alt="Profile"
                          className="preview-photo"
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #ddd'
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={loading}
                          style={{
                            position: 'absolute',
                            top: '-5px',
                            right: '-5px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                      <span style={{ color: '#333', fontSize: '12px' }}>Photo selected</span>
                    </div>
                  ) : (
                    <span style={{ color: '#666', fontSize: '12px' }}>No photo selected</span>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                    id="upload-photo"
                    disabled={loading}
                  />
                  <label 
                    htmlFor="upload-photo" 
                    className={`file-btn ${loading ? 'disabled' : ''}`}
                    style={{
                      fontSize:"10px",
                      color:"white",
                      alignItems:"center",
                      justifyContent:"center",
                      display:"flex",
                      margin:"0px",
                      padding: "8px 16px",
                      backgroundColor: "#007bff",
                      borderRadius: "4px",
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      border: 'none',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {profilePhoto ? 'Change Photo' : 'Select file'}
                  </label>
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

          <div className="save-btn-container">
            <button 
              className="save-btn" 
              onClick={handleSaveProfile}
              disabled={loading}
              style={{
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading 
                ? 'Saving...' 
                : isNewProfile 
                  ? 'Create Profile' 
                  : 'Save Profile'}
            </button>
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
          <button className="save-btn">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;