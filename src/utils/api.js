// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // ✅ CRITICAL: Enable sending cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Request interceptor - Now supports both cookie and token methods
api.interceptors.request.use(
  (config) => {
    // For mobile apps or API testing, still support Authorization header
    // Web app will use cookies automatically
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔵 API Request:', config.method.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor - Handle authentication errors
api.interceptors.response.use(
  (response) => {
    // Debug log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🟢 API Response:', response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Unauthorized - redirecting to login');
      
      // Clear any stored tokens (for backward compatibility)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Log other errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 API Error:', error.response?.status, error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;

// ✅ Helper function to check if user is authenticated
export const isAuthenticated = () => {
  // In cookie-based auth, we can't check cookie from JS
  // Instead, make a request to a protected endpoint or check localStorage for user info
  const user = localStorage.getItem('user');
  return !!user;
};

// ✅ Helper function to get current user from localStorage
export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// ✅ Helper function to set current user in localStorage
export const setCurrentUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

// ✅ Helper function to logout (clear localStorage only, server handles cookie)
export const logout = async () => {
  try {
    // Call logout endpoint (server will clear the cookie)
    await api.post('/auth/logout');
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Remove legacy token if exists
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    // Even if server request fails, clear local data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return false;
  }
};