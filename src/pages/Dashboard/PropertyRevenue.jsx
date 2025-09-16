import React, { useEffect, useState } from "react";
import axios from "axios";

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

const PropertyRevenue = () => {
  const [stats, setStats] = useState({
    properties: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("http://192.168.0.152:5000/api/stats");
        // Expected response: { properties: 18854, owners: 8543, customers: 15974, revenue: 78300000 }
        setStats({
          properties: res.data.properties,
          revenue: res.data.revenue,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();

    // Optional polling for real-time updates
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      {/* Title */}
      <div className="card-header">
        <h5 className="card-title">Property & Revenue</h5>
      </div>

      <div className="row g-3">
        <div className="col-6">
          <PropertyRevenueItem
            title="Property"
            icon="/assets/property-iconn.png"
            iconBg="var(--stat-icon-bg-1)"
            value={stats.properties.toLocaleString()}
            target="60% Target"
            progress="60%"
            progressColor="var(--progress-bar-1)"
          />
        </div>
        <div className="col-6">
          <PropertyRevenueItem
            title="Revenue"
            icon="/assets/revenue-bag.png"
            iconBg="var(--stat-icon-bg-3)"
            value={`$${(stats.revenue / 1000000).toFixed(1)}M`}
            target="80% Target"
            progress="80%"
            progressColor="var(--progress-bar-2)"
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
