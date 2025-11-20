// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout + Context
import Sidebar from "./components/layout/Sidebar";
import { useSidebar } from "./components/context/SidebarContext";

// Pages
import Signup from "./pages/Auth/Signup";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from './pages/Auth/ResetPassword';
import Verification from './pages/Auth/Verification';
import Congratulations from './pages/Congratulations';
import Dashboard from "./pages/Dashboard/Dashboard";
import Property from "./pages/Property/Property";
import PropertyDetail from './pages/Property/PropertyDetail';
import Owners from "./pages/Owners/Owners";
import OwnerDetail from "./pages/Owners/OwnerDetail";
import Customers from "./pages/Customers/Customers";
import CustomerDetail from "./pages/Customers/CustomerDetail";
import Orders from "./pages/Orders/Orders";
import Transaction from "./pages/Transaction/Transaction";
import Reviews from "./pages/Reviews/Reviews";
import Settings from "./pages/Settings/SettingsPage";

// ✅ FIXED: Check for user data instead of authToken (since token is in httpOnly cookie)
const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  const isLoggedIn = Boolean(user);

  console.log("PrivateRoute check:", { isLoggedIn, user: user ? JSON.parse(user) : null });

  if (!isLoggedIn) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return children;
};

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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify" element={<Verification />} />
      <Route path="/congratulations" element={<Congratulations />} />

      {/* Protected Routes Wrapped with Layout */}
      <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
      <Route path="/property" element={<PrivateRoute><Layout><Property /></Layout></PrivateRoute>} />
      <Route path="/property/:propertyId" element={<PrivateRoute><PropertyDetail /></PrivateRoute>} />
      <Route path="/owners" element={<PrivateRoute><Layout><Owners /></Layout></PrivateRoute>} />
      <Route path="/owners/:ownerId" element={<PrivateRoute><Layout><OwnerDetail /></Layout></PrivateRoute>} />
      <Route path="/customers" element={<PrivateRoute><Layout><Customers /></Layout></PrivateRoute>} />
      <Route path="/customers/:customerId" element={<PrivateRoute><Layout><CustomerDetail /></Layout></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><Layout><Orders /></Layout></PrivateRoute>} />
      <Route path="/transaction" element={<PrivateRoute><Layout><Transaction /></Layout></PrivateRoute>} />
      <Route path="/reviews" element={<PrivateRoute><Layout><Reviews /></Layout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
    </Routes>
  );
}

export default App;