import React from "react";

const PropertyRevenueItem = ({ icon, iconBg, title, value, target, progress, progressColor }) => (
  <div className="property-revenue-card">
    <div className="pr-icon" style={{ backgroundColor: iconBg }}>
      <img src={icon} alt={`${title} icon`} style={{ width: "20px", height: "25px" }} />
    </div>
    <div className="pr-value">{value}</div>
    <div className="pr-target">{target}</div>
    <div className="progress">
      <div
        className="progress-bar"
        role="progressbar"
        style={{ width: progress, backgroundColor: progressColor }}
        aria-valuenow={parseInt(progress)}
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>
  </div>
);

const PropertyRevenue = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">Property & Revenue</h5>
        </div>
        <div style={{padding: '20px', textAlign: 'center'}}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h5 className="card-title">Property & Revenue</h5>
        </div>
        <div style={{padding: '20px', textAlign: 'center', color: 'red'}}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title">Property & Revenue</h5>
      </div>

      <div className="row g-3">
        <div className="col-6">
          <PropertyRevenueItem
            title="Property"
            icon="/assets/property-iconn.png"
            iconBg="#DFD9FF"
            value={(stats.properties || 0).toLocaleString()}
            target="60% Target"
            progress="60%"
            progressColor="#897AE3"
          />
        </div>
        <div className="col-6">
          <PropertyRevenueItem
            title="Revenue"
            icon="/assets/revenue-icon.png"
            iconBg="#FFE0D2"
            value={`$${((stats.revenue || 0) / 1000000).toFixed(1)}M`}
            target="80% Target"
            progress="80%"
            progressColor="#DE7548"
          />
        </div>
      </div>

      <a href="#view-more" className="view-more-link">
        View More →
      </a>
    </div>
  );
};

export default PropertyRevenue;