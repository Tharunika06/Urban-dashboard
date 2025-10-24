import React from 'react';
import DashboardStatCard from '../../components/common/DashboardStatCard.jsx';
import '../../styles/Dashboard.css';

const Analytics = ({ stats, loading, error }) => {
  if (loading) {
    return <div style={{padding: '20px'}}>Loading analytics...</div>;
  }

  if (error) {
    return <div style={{padding: '20px', color: 'red'}}>Error: {error}</div>;
  }

  return (
    <>
      <div className="file" style={{gap:'10px', display:'flex', flexWrap:'wrap', marginBottom:'10px'}}>
        <div className="fold" style={{ width: '49%' ,height:'20%',fontFamily:'Montserrat'}}>
          <DashboardStatCard
            title="No. Of Properties"
            value={(stats.properties || 0).toLocaleString()}
            change="8.5%"
            period="Up from yesterday"
            isNegative={false}
            icon="/assets/nop-icon.png"
            iconBg="#ebf3fe"
          />
        </div>
        <div className="col-md-6" style={{ width: '49%' ,height:'20%',fontFamily:'Montserrat'}}>
          <DashboardStatCard
            title="Total Owners"
            value={(stats.owners || 0).toLocaleString()}
            change="9.3%"
            period="Up from the last 1 Month"
            isNegative={false}
            icon="/assets/agents.png"
            iconBg="#ffeef6"
          />
        </div>
      </div>

      <div className="file" style={{gap:'10px', display:'flex', flexWrap:'wrap', marginBottom:'10px'}}>
        <div className="col-md-6" style={{ width: '49%' ,height:'20%',fontFamily:'Montserrat'}}>
          <DashboardStatCard
            title="Customers"
            value={(stats.customers || 0).toLocaleString()}
            change="10.3%"
            period="Up from the last 1 Month"
            isNegative={true}
            icon="/assets/customers.png"
            iconBg="#fff5ec"
          />
        </div>
        <div className="col-md-6" style={{ width: '49%' ,height:'20%',fontFamily:'Montserrat'}}>
          <DashboardStatCard
            title="Revenue"
            value={`$${((stats.revenue || 0) / 1000000).toFixed(1)}M`}
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