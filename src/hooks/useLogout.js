// src/hooks/useLogout.js
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:5000/api";

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      // ✅ Call backend logout endpoint to clear httpOnly cookie
      await fetch(`${API_URL}/admin/logout`, {
        method: 'POST',
        credentials: 'include', // ✅ Send cookie to be cleared
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('adminProfile');
      
      // Don't remove rememberMe data (keep email if they checked remember me)
      // localStorage.removeItem('rememberMe');
      // localStorage.removeItem('adminEmail');

      // Redirect to login
      navigate('/login', { replace: true });
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if API call fails, clear local data and redirect
      localStorage.removeItem('user');
      localStorage.removeItem('adminProfile');
      navigate('/login', { replace: true });
    }
  };

  return logout;
};