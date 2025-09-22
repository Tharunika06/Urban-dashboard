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
import "/src/styles/Dashboard.css";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const socket = socketIO(SOCKET_URL, { withCredentials: true });

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    socket.on("new-transaction", () => {
      setRefreshKey((prev) => prev + 1);
    });
    socket.on("update-analytics", () => {
      setRefreshKey((prev) => prev + 1);
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

        <main className="dashboard-body">
          <div className="container-xxl p-0">
            {/* Row 1: Analytics Stat Cards */}
            <Analytics key={`analytics-${refreshKey}`} />

            {/* Row 2: Sales Analytic + Weekly Sales */}
            <div className="row g-4 mt-3">
              <div className="col-lg-8">
                <SalesAnalytic key={`sales-${refreshKey}`} />
              </div>
              <div className="col-lg-4">
                <WeeklySales key={`weekly-${refreshKey}`} />
              </div>
            </div>

            {/* Row 3: Sales Location, Social Source, Property Revenue */}
            <div className="row g-4 mt-3">
              <div className="col-lg-4 col-md-6">
                <SalesLocation key={`location-${refreshKey}`} />
              </div>
              <div className="col-lg-4 col-md-6">
                <SocialSource key={`social-${refreshKey}`} />
              </div>
              <div className="col-lg-4 col-md-12">
                <PropertyRevenue key={`revenue-${refreshKey}`} />
              </div>
            </div>

            {/* Row 4: Transactions Table */}
            <div className="row mt-3">
              <div className="col-12">
                <Transactions key={`transactions-${refreshKey}`} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
