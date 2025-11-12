// src/utils/api.js
import axios from 'axios';
import { API_CONFIG } from './constants';

// ✅ Create axios instance with configuration from constants
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  maxContentLength: API_CONFIG.MAX_CONTENT_LENGTH,
  maxBodyLength: API_CONFIG.MAX_BODY_LENGTH,
  withCredentials: true, // ✅ CRITICAL: Enable sending cookies with requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Request interceptor - Supports both cookie and token methods
api.interceptors.request.use(
  (config) => {
    // For mobile apps or API testing, still support Authorization header
    // Web app will use cookies automatically
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug log in development
    if (import.meta.env.DEV) {
      console.log('🔵 API Request:', config.method?.toUpperCase(), config.url);
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
    if (import.meta.env.DEV) {
      console.log('🟢 API Response:', response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Unauthorized - redirecting to login');
      
      // Clear any stored tokens and user data
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Log other errors in development
    if (import.meta.env.DEV) {
      console.error('🔴 API Error:', error.response?.status, error.response?.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;

// ✅ Helper function to check if user is authenticated
export const isAuthenticated = () => {
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
    await api.post('/api/logout');
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    // Even if server request fails, clear local data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    return false;
  }
};