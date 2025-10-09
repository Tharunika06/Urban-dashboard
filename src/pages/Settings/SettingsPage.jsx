//SettingsPage.jsx
import React, { useState } from "react";
import GeneralSettings from "./GeneralSettings";
import UserRoles from "./UserRoles";
import Notifications from "./Notifications";
import Header from "../../components/layout/Header";
import "../../styles/Settings.css";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="main-content">
      <Header />
      <div className="container mt-4">
        
        {/* Tabs */}
        <div className="settings-card">
                  <h3 className="settings-title mb-4" style={{fontFamily:"Prompt",fontSize:'20'}} >Settings</h3>

          <ul className="nav nav-tabs settings-tabs">
            
            <li className="nav-item">

              <button
                className={`settings-nav-link ${activeTab === "general" ? "active" : ""}`}
                onClick={() => setActiveTab("general")}
                style={{
                  backgroundColor: activeTab === "general" ? "#fff" : "transparent"
                }}
              >
                General Settings
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`settings-nav-link ${activeTab === "roles" ? "active" : ""}`}
                onClick={() => setActiveTab("roles")}
                style={{
                  backgroundColor: activeTab === "roles" ? "#fff" : "transparent"
                }}
              >
                User Roles
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`settings-nav-link ${activeTab === "notifications" ? "active" : ""}`}
                onClick={() => setActiveTab("notifications")}
                style={{
                  backgroundColor: activeTab === "notifications" ? "#fff" : "transparent"
                }}
              >
                Notifications
              </button>
            </li>
          </ul>

          {/* Render Active Tab Inside Card */}
          <div className="p-3">
            {activeTab === "general" && <GeneralSettings />}
            {activeTab === "roles" && <UserRoles />}
            {activeTab === "notifications" && <Notifications />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;