import React from "react";
import { Routes, Route } from "react-router-dom";

// Layout + Context
import Sidebar from "./components/layout/Sidebar";
import { useSidebar } from "./components/context/SidebarContext";

// Pages
import Signup from "./pages/Auth/Signup";
import Login from "./pages/Auth/Login";
import ForgetPassword from "./pages/Auth/ForgetPassword";
import ResetPassword from './pages/Auth/ResetPassword';
import Verification from './pages/Verification';
import Congratulations from './pages/Congratulations';
import Dashboard from "./pages/Dashboard/Dashboard";
import Property from "./pages/Property/Property";
import PropertyDetail from './pages/Property/PropertyDetail';
import Owners from "./pages/Owners/Owners"; // ✅ NEW: Owners Page
import OwnerDetail from "./pages/Owners/OwnerDetail"; // ✅ NEW: Owner Detail Page
import Customers from "./pages/Customers/Customers";
import CustomerDetail from "./pages/Customers/CustomerDetail";
import Orders from "./pages/Orders/Orders";
import Transaction from "./pages/Transaction/Transaction";
import Reviews from "./pages/Reviews/Reviews";
import Settings from "./pages/Settings/SettingsPage";

// Layout wrapper for pages with sidebar
const Layout = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="page-with-layout">
      <Sidebar />
      <div className={`main-content-panel ${isCollapsed ? 'collapsed' : ''}`}>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify" element={<Verification />} />
      <Route path="/congratulations" element={<Congratulations />} />

      {/* Protected Routes Wrapped with Layout */}
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      <Route path="/property" element={<Layout><Property /></Layout>} />
      <Route path="/property/:propertyId" element={<PropertyDetail />} />
      {/* ✅ Updated from Agents to Owners */}
      <Route path="/owners" element={<Layout><Owners /></Layout>} />
      <Route path="/owners/:ownerId" element={<Layout><OwnerDetail /></Layout>} />

      <Route path="/customers" element={<Layout><Customers /></Layout>} />
      <Route path="/customers/:customerId" element={<Layout><CustomerDetail /></Layout>} />
      <Route path="/orders" element={<Layout><Orders /></Layout>} />
      <Route path="/transaction" element={<Layout><Transaction /></Layout>} />
      <Route path="/reviews" element={<Layout><Reviews /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
    </Routes>
  );
}

export default App;
