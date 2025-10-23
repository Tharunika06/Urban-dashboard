import React, { useState, useEffect } from "react";
import "../../styles/GeneralSettings.css";

const GeneralSettings = () => {
  const [adminName, setAdminName] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE_URL = "http://192.168.1.45:5000/api";

  useEffect(() => {
    loadAdminProfile();
  }, []);

  // ✅ FIXED: Get auth token helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  // ✅ FIXED: Load admin profile with auth token
  const loadAdminProfile = async () => {
    try {
      setLoading(true);
      console.log("Loading admin profile...");
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Not authenticated. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ Added token
        }
      });

      console.log("Response status:", response.status);

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        setAdminName(data.profile.name || "");
        setPhone(data.profile.phone || "");
        setProfilePhoto(data.profile.photo || "");
        setError("");
      } else {
        throw new Error(data.message || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(`Failed to load profile: ${err.message}`);
      
      // Fallback to localStorage
      const savedProfile = localStorage.getItem("adminProfile");
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setAdminName(parsed.name || "");
        setPhone(parsed.phone || "");
        setProfilePhoto(parsed.photo || "");
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

  // ✅ FIXED: Save profile with auth token
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log("Starting profile save...");

      if (!adminName.trim()) {
        setError('Admin name is required');
        return;
      }

      if (!phone.trim()) {
        setError('Phone number is required');
        return;
      }

      const cleanPhone = phone.replace(/\D/g, '');
      if (!/^[0-9]{10}$/.test(cleanPhone)) {
        setError('Please enter a valid 10-digit phone number');
        return;
      }

      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Not authenticated. Please login again.');
        return;
      }

      const formData = new FormData();
      formData.append('name', adminName.trim());
      formData.append('phone', cleanPhone);
      
      if (profilePhotoFile) {
        console.log("Adding photo file to form data");
        formData.append('profilePhoto', profilePhotoFile);
      }

      console.log("Sending request with auth token");

      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}` // ✅ Added token (no Content-Type for FormData)
        },
        body: formData
      });

      console.log("Response status:", response.status);

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        return;
      }

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        setProfilePhoto(data.profile.photo || "");
        
        const profileData = {
          name: adminName.trim(),
          phone: cleanPhone,
          photo: data.profile.photo
        };
        localStorage.setItem("adminProfile", JSON.stringify(profileData));
        
        window.dispatchEvent(new CustomEvent("profileUpdated", {
          detail: profileData
        }));
        
        setSuccess("Profile updated successfully!");
        setError('');
        setProfilePhotoFile(null);
        
        const fileInput = document.getElementById('upload-photo');
        if (fileInput) fileInput.value = '';
        
      } else {
        throw new Error(data.message || 'Failed to save profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(`Failed to save profile: ${err.message}`);
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Remove photo with auth token
  const handleRemovePhoto = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Not authenticated. Please login again.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/profile/photo`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // ✅ Added token
        }
      });

      if (response.status === 401) {
        setError('Session expired. Please login again.');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setProfilePhoto("");
        setProfilePhotoFile(null);
        
        const fileInput = document.getElementById('upload-photo');
        if (fileInput) fileInput.value = '';
        
        setSuccess("Profile photo removed successfully!");
        setTimeout(() => setSuccess(''), 3000);
        
        const savedProfile = JSON.parse(localStorage.getItem("adminProfile") || '{}');
        savedProfile.photo = "";
        localStorage.setItem("adminProfile", JSON.stringify(savedProfile));
        
      } else {
        setError(data.message || 'Failed to remove photo');
      }
    } catch (err) {
      console.error('Error removing photo:', err);
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
            Update your profile details and contact information
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
              <label>Admin Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Save only Admin Info */}
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
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>
      <br></br>
      
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
      <br></br>
      
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

        {/* Save Company + Preferences */}
        <div className="save-btn-container">
          <button className="save-btn">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;