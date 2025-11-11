// Dashboard.jsx
import React, { useState, useEffect } from "react"; 
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Analytics from "./Analytics";
import SalesAnalytic from "./SalesAnalytic";
import WeeklySales from "./WeeklySales";
import SalesLocation from "./SalesLocation";
import SocialSource from "./SocialSource";
import PropertyRevenue from "./PropertyRevenue";
import Transactions from "./Transactions";
import { io as socketIO } from "socket.io-client";
import api from "../../utils/api";
import "/src/styles/Dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const socket = socketIO(SOCKET_URL, { withCredentials: true });

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    properties: 0,
    owners: 0,
    customers: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Centralized stats fetching function
  const fetchStats = async () => {
    try {
      setError(null);
      const res = await api.get('/stats');
      
      console.log('Dashboard stats fetched:', res.data);
      
      setStats({
        properties: res.data?.properties || 0,
        owners: res.data?.owners || 0,
        customers: res.data?.customers || 0,
        revenue: res.data?.revenue || 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch on component mount
    fetchStats();

    // Socket listeners - refresh only on real-time events
    socket.on("new-transaction", () => {
      console.log("New transaction detected - refreshing stats");
      fetchStats();
    });
    
    socket.on("update-analytics", () => {
      console.log("Analytics update detected - refreshing stats");
      fetchStats();
    });

    return () => {
      socket.off("new-transaction");
      socket.off("update-analytics");
    };
  }, []);

  return (
    
    <div className="dashboard-container">
      <div className="main-content">
        <Header title="Dashboard" onToggleSidebar={toggleSidebar} />
       {/*<Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />*/}
        <main className="dashboard-body">
          <div className="dashboard-content">
            {/* Row 1: Analytics Stat Cards */}
            <Analytics stats={stats} loading={loading} error={error} />

            {/* Row 2: Sales Analytic + Weekly Sales */}
            <div className="row g-4 mt-3">
              <div className="col-lg-8">
                <SalesAnalytic />
              </div>
              <div className="col-lg-4">
                <WeeklySales />
              </div>
            </div>

            {/* Row 3: Sales Location, Social Source, Property Revenue */}
            <div className="row g-4 mt-3">
              <div className="col-lg-4 col-md-6">
                <SalesLocation />
              </div>
              <div className="col-lg-4 col-md-6">
                <SocialSource />
              </div>
              <div className="col-lg-4 col-md-12">
                <PropertyRevenue stats={stats} loading={loading} error={error} />
              </div>
            </div>

            {/* Row 4: Transactions Table */}
            <div className="row mt-3">
              <div className="col-12">
                <Transactions />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
       

  );
};

export default Dashboard;