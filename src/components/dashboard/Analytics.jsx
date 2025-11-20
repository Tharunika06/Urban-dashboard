import React from 'react';
import DashboardStatCard from '../../components/common/DashboardStatCard.jsx';
import '../../styles/Dashboard.css';
import '../../styles/Analytics.css';

const Analytics = ({ stats, loading, error }) => {
  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (error) {
    return <div className="analytics-error">Error: {error}</div>;
  }

  const statCards = [
    {
      title: "No. Of Properties",
      value: (stats.properties || 0).toLocaleString(),
      change: "8.5%",
      period: "Up from yesterday",
      isNegative: false,
      icon: "/assets/nop-icon.png",
      iconBg: "#ebf3fe"
    },
    {
      title: "Total Owners",
      value: (stats.owners || 0).toLocaleString(),
      change: "9.3%",
      period: "Up from the last 1 Month",
      isNegative: false,
      icon: "/assets/agents.png",
      iconBg: "#ffeef6"
    },
    {
      title: "Customers",
      value: (stats.customers || 0).toLocaleString(),
      change: "10.3%",
      period: "Up from the last 1 Month",
      isNegative: true,
      icon: "/assets/customers.png",
      iconBg: "#fff5ec"
    },
    {
      title: "Revenue",
      value: `$${((stats.revenue || 0) / 1000000).toFixed(1)}M`,
      change: "8.3%",
      period: "Up from the last month",
      isNegative: false,
      icon: "/assets/revenue.png",
      iconBg: "#e6faf5"
    }
  ];

  return (
    <div className="analytics-container">
      {statCards.map((card, index) => (
        <div key={index} className="analytics-card-wrapper">
          <DashboardStatCard {...card} />
        </div>
      ))}
    </div>
  );
};

export default Analytics;