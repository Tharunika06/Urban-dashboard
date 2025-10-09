import React from 'react';
import '../../styles/Dashboard.css';

const DashboardStatCard = ({ title, value, change, period, isNegative, icon, iconBg }) => {
  return (
    <div className="dashboard-stat-card">
      <div className="dashboard-stat-card-content">
        <div className="stat-text-section">
          <div className="stat-card-title">{title}</div>
          <div className="stat-card-value">{value}</div>
          <div className="stat-card-trend">
            <img 
              src={isNegative ? "/assets/down-arrow.png" : "/assets/up-arrow.png"} 
              alt="trend" 
              className="stat-trend-arrow"
            />
            <span className={`stat-trend-percent ${isNegative ? 'negative' : 'positive'}`}>
              {change}
            </span>
            <span className="stat-trend-period">{period}</span>
          </div>
        </div>
        <div className="stat-icon-container" style={{ backgroundColor: iconBg }}>
          <img src={icon} alt={title} className="stat-card-icon" />
        </div>
      </div>
    </div>
  );
};

export default DashboardStatCard;