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

// ✅ Use Vite env variable for socket backend
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
const socket = socketIO(SOCKET_URL, { withCredentials: true });

const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // 👈 force refresh when new data arrives

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    // 👂 Listen for new transaction event
    socket.on("new-transaction", () => {
      setRefreshKey((prev) => prev + 1);
    });

    // 👂 Listen for other events if needed (analytics, sales, etc.)
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
            {/* Row 1: Stat Cards */}
            <Analytics key={`analytics-${refreshKey}`} />

            {/* Row 2: Main Charts and Side Cards */}
            <div className="row g-4 my-4">
              {/* Left Column */}
              <div className="col-lg-8 d-flex flex-column gap-4">
                <SalesAnalytic key={`sales-${refreshKey}`} />
                <div className="row g-4">
                  <div className="col-md-6">
                    <SalesLocation key={`location-${refreshKey}`} />
                  </div>
                  <div className="col-md-6">
                    <SocialSource key={`social-${refreshKey}`} />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="col-lg-4 d-flex flex-column gap-4">
                <WeeklySales key={`weekly-${refreshKey}`} />
                <PropertyRevenue key={`revenue-${refreshKey}`} />
              </div>
            </div>

            {/* Row 3: Transactions */}
            <div className="row">
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
