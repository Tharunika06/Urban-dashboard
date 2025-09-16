import React, { useState } from 'react';
import '../../styles/Notification.css';

const Notifications = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [webPushNotifications, setWebPushNotifications] = useState(false);

  const Toggle = ({ isOn, onToggle }) => (
    <button
      className={`toggle ${isOn ? 'toggle-on' : 'toggle-off'}`}
      onClick={onToggle}
    >
      <div className={`toggle-knob ${isOn ? 'toggle-knob-on' : 'toggle-knob-off'}`} />
    </button>
  );

  return (
    <div className="notifications-content">
    

      {/* Notification Preferences Section */}
      <div className="notification-preferences">
        <h2 className="section-title">Notification Preferences</h2>
        <p className="section-description">Configure how you want to receive notifications and alerts</p>
      </div>

      {/* Communication Channels Section */}
      <div className="communication-channels">
        <h3 className="channels-title">Communication Channels</h3>

        {/* Email Alerts */}
        <div className="notification-item">
          <div className="notification-info">
            <h4 className="notification-title">Email Alerts</h4>
            <p className="notification-description">Receive important notifications via email</p>
          </div>
          <Toggle 
            isOn={emailAlerts} 
            onToggle={() => setEmailAlerts(!emailAlerts)} 
          />
        </div>

        {/* SMS Alerts */}
        <div className="notification-item">
          <div className="notification-info">
            <h4 className="notification-title">SMS Alerts</h4>
            <p className="notification-description">Get critical updates via SMS</p>
          </div>
          <Toggle 
            isOn={smsAlerts} 
            onToggle={() => setSmsAlerts(!smsAlerts)} 
          />
        </div>

        {/* Web Push Notifications */}
        <div className="notification-item last-item">
          <div className="notification-info">
            <h4 className="notification-title">Web Push Notifications</h4>
            <p className="notification-description">Real-time browser notifications for immediate alerts</p>
          </div>
          <Toggle 
            isOn={webPushNotifications} 
            onToggle={() => setWebPushNotifications(!webPushNotifications)} 
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="save-section">
        <button className="save-button">Save Changes</button>
      </div>
    </div>
  );
};

export default Notifications;