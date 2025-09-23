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

  // API base URL
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    loadAdminProfile();
  }, []);

  // Load admin profile from database
  const loadAdminProfile = async () => {
    try {
      setLoading(true);
      console.log("Loading admin profile...");
      
      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        setAdminName(data.profile.name || "");
        setPhone(data.profile.phone || "");
        
        // Set photo directly - it's already a base64 data URL
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
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Store the file for upload
      setProfilePhotoFile(file);

      // Create preview URL (base64)
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result); // This will be base64 data URL
        setError(''); // Clear any previous errors
      };
      reader.readAsDataURL(file);
    }
  };

  // Save admin profile to database
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      console.log("Starting profile save...");

      // Validate inputs
      if (!adminName.trim()) {
        setError('Admin name is required');
        return;
      }

      if (!phone.trim()) {
        setError('Phone number is required');
        return;
      }

      // Phone number validation (10 digits)
      const cleanPhone = phone.replace(/\D/g, '');
      if (!/^[0-9]{10}$/.test(cleanPhone)) {
        setError('Please enter a valid 10-digit phone number');
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('name', adminName.trim());
      formData.append('phone', cleanPhone);
      
      // Add photo file if selected
      if (profilePhotoFile) {
        console.log("Adding photo file to form data");
        formData.append('profilePhoto', profilePhotoFile);
      }

      console.log("Sending request to:", `${API_BASE_URL}/admin/profile`);

      const response = await fetch(`${API_BASE_URL}/admin/profile`, {
        method: 'PUT',
        body: formData
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        // Update local state with the returned data
        setProfilePhoto(data.profile.photo || "");
        
        // Keep localStorage as backup
        const profileData = {
          name: adminName.trim(),
          phone: cleanPhone,
          photo: data.profile.photo
        };
        localStorage.setItem("adminProfile", JSON.stringify(profileData));
        
        // Dispatch custom event with updated profile data
        window.dispatchEvent(new CustomEvent("profileUpdated", {
          detail: profileData
        }));
        
        setSuccess("Profile updated successfully!");
        setError('');
        
        // Clear the file input
        setProfilePhotoFile(null);
        
        // Reset file input
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

  // Remove profile photo
  const handleRemovePhoto = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/profile/photo`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.success) {
        setProfilePhoto("");
        setProfilePhotoFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('upload-photo');
        if (fileInput) fileInput.value = '';
        
        setSuccess("Profile photo removed successfully!");
        setTimeout(() => setSuccess(''), 3000);
        
        // Update localStorage
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