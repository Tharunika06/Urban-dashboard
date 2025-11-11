// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

/**
 * ProtectedRoute Component
 * Verifies authentication via httpOnly cookie before rendering protected pages
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true/false = result
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log("🔐 Verifying authentication...");
        
        // Try to get current user (this validates the httpOnly cookie)
        const response = await authService.getCurrentUser();
        
        if (response.ok && response.user) {
          console.log("✅ User authenticated:", response.user.email, "Role:", response.user.role);
          setIsAuthenticated(true);
          setUserRole(response.user.role);
        } else {
          console.log("❌ Authentication failed");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("❌ Auth verification error:", error);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, [location.pathname]); // Re-verify on route change

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        <div>
          <div className="spinner-border" role="status" style={{ marginBottom: '10px' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <div>Verifying authentication...</div>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    console.log("🚫 Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin requirement
  if (requireAdmin && userRole !== 'admin') {
    console.log("🚫 Admin access required, user role:", userRole);
    return <Navigate to="/unauthorized" replace />;
  }

  // Authenticated - render protected content
  console.log("✅ Access granted to:", location.pathname);
  return children;
};

export default ProtectedRoute;