import React, { useEffect, useState } from 'react';
import DashboardStatCard from '../../components/common/DashboardStatCard.jsx';
import axios from 'axios';
import '../../styles/Dashboard.css';

const Analytics = () => {
  const [stats, setStats] = useState({
    properties: 0,
    owners: 0,
    customers: 0,
    revenue: 0,
  });

  // Fetch counts from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://192.168.0.152:5000/api/stats'); 
        // 👆 Example API endpoint that returns:
        // { properties: 18854, owners: 8543, customers: 15974, revenue: 78300000 }

        setStats(res.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };

    fetchStats();

    // Optional: Poll every 10s for real-time updates
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* First Row */}
      <div className="row g-4">
        <div className="col-md-6">
          <DashboardStatCard
            title="No. Of Properties"
            value={stats.properties.toLocaleString()}
            change="8.5%"
            period="Up from yesterday"
            isNegative={false}
            icon="/assets/nop-icon.png"
            iconBg="#ebf3fe"
          />
        </div>
        <div className="col-md-6">
          <DashboardStatCard
            title="Total Owners"
            value={stats.owners.toLocaleString()}
            change="9.3%"
            period="Up from the last 1 Month"
            isNegative={false}
            icon="/assets/agents.png"
            iconBg="#ffeef6"
          />
        </div>
      </div>

      {/* Second Row */}
      <div className="row g-4 mt-0">
        <div className="col-md-6">
          <DashboardStatCard
            title="Customers"
            value={stats.customers.toLocaleString()}
            change="10.3%"
            period="Up from the last 1 Month"
            isNegative={true}
            icon="/assets/customers.png"
            iconBg="#fff5ec"
          />
        </div>
        <div className="col-md-6">
          <DashboardStatCard
            title="Revenue"
            value={`$${(stats.revenue / 1000000).toFixed(1)}M`}
            change="8.3%"
            period="Up from the last month"
            isNegative={false}
            icon="/assets/revenue.png"
            iconBg="#e6faf5"
          />
        </div>
      </div>
    </>
  );
};

export default Analytics;
