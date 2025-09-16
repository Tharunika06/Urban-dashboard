import React from 'react';
import '../../styles/Dashboard.css';

const DashboardStatCard = ({ title, value, change, period, isNegative, icon, iconBg }) => {
  const trendIcon = isNegative ? '/assets/redarrow-up.png' : '/assets/arrow-up-right.png';
  const trendClass = isNegative ? 'negative' : 'positive';

  return (
    <div className="card dashboard-stat-card h-100">
      {/* THE FIX: This new inner container handles the flex layout INSIDE the padded card */}
      <div className="dashboard-stat-card-content">
        {/* Left Column: All text content */}
        <div className="stat-text-wrapper">
          <p className="stat-title">{title}</p>
          <h3 className="stat-value">{value}</h3>
          <div className="stat-trend">
            <img src={trendIcon} alt="trend" className="trend-icon-img" />
            <span className={`percent-change ${trendClass}`}>{change}</span>
            <span className="trend-period">{period}</span>
          </div>
        </div>

        {/* Right Column: The icon */}
        <div className="stat-icon-wrapper" style={{ backgroundColor: iconBg }}>
          <img src={icon} alt="stat icon" className="stat-icon" />
        </div>
      </div>
    </div>
  );
};

export default DashboardStatCard;