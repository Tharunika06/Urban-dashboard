import React, { useState, useEffect } from "react";
import "../../styles/GeneralSettings.css";

const GeneralSettings = () => {
  const [adminName, setAdminName] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    // Load saved profile data
    const savedProfile = localStorage.getItem("adminProfile");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setAdminName(parsed.name || "");
      setPhone(parsed.phone || "");
      setProfilePhoto(parsed.photo || null);
    }
  }, []);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    const profileData = {
      name: adminName,
      phone: phone,
      photo: profilePhoto,
    };
    localStorage.setItem("adminProfile", JSON.stringify(profileData));
    
    // Dispatch custom event with updated profile data
    window.dispatchEvent(new CustomEvent("profileUpdated", {
      detail: profileData
    }));
    
    alert("Profile updated successfully!");
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

          <div className="form-grid">
            <div className="form-group file-upload">
              <label>Profile Photo</label>
              <div className="file-box">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    className="preview-photo"
                  />
                ) : (
                  <span>No photo selected</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: "none" }}
                  id="upload-photo"
                />
                <label htmlFor="upload-photo" className="ad-file-btn" style={{fontSize:"11px",color:"white",alignItems:"center",justifyContent:"center",display:"flex",margin:"0px"}}>
                  Upload Photo
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Admin Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Save only Admin Info */}
          <div className="save-btn-container">
            <button className="save-btn" onClick={handleSaveProfile}>
              Save Profile
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