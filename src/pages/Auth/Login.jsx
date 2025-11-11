// src/pages/Auth/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/Auth.css";
import authService, { handleAuthError, storage } from "../../services/authService";
import logo from "/assets/logo.png";
import userIcon from "/assets/user-icon.png";
import lockIcon from "/assets/lock-icon.png";
import eyeIcon from "/assets/eye-icon.png";
import googleIcon from "/assets/google-icon.png";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Clear any stale data on mount
  useEffect(() => {
    console.log("🔄 Login component mounted");
    
    // Load remembered email
    const rememberedEmail = storage.getRememberedEmail();
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
      console.log("📧 Loaded remembered email:", rememberedEmail);
    }
  }, []);

  // ✅ FIXED: Proper async handler with error handling
  const handleLogin = async (e) => {
    e.preventDefault(); // ✅ Prevent form default submission
    e.stopPropagation(); // ✅ Stop event bubbling
    
    // Prevent multiple submissions
    if (loading) {
      console.log("⚠️ Already processing login, ignoring duplicate submission");
      return;
    }
    
    setError("");
    setSuccess("");
    setLoading(true);

    console.log("🔐 Starting admin login for:", email);

    try {
      const data = await authService.adminLogin(email, password);
      console.log("✅ Login response:", data);

      if (data.ok) {
        // ✅ Store only non-sensitive user data for UI display
        const userData = {
          email: data.user.email,
          name: data.user.firstName || data.user.email.split('@')[0],
          role: data.user.role,
          firstName: data.user.firstName,
          lastName: data.user.lastName
        };
        
        storage.saveUser(userData);
        console.log("💾 User data saved to localStorage:", userData);

        // Handle Remember Me
        if (rememberMe) {
          storage.saveRememberMe(email);
          console.log("✅ Email saved for Remember Me");
        } else {
          storage.clearRememberMe();
          console.log("🗑️ Remember Me cleared");
        }

        setSuccess(data.message || "Login successful! Redirecting...");
        
        // ✅ Redirect after short delay
        setTimeout(() => {
          console.log("🚀 Redirecting to dashboard...");
          navigate("/dashboard", { replace: true });
        }, 1200);
      } else {
        // Handle non-OK response
        setError(data.error || "Login failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Admin login error:", err);
      console.error("Error details:", err.response?.data);
      setError(handleAuthError(err));
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row g-0">
        <div className="col-lg-5 col-md-12 col-12">
          <div className="form-box">
            <img src={logo} alt="Urban Logo" className="logo mx-auto d-block" />
            <h2 className="title">Admin Login 🔐</h2>
            <p className="subtitle">
              Welcome back, Admin! Please log in with your admin credentials to access the dashboard.
            </p>

            {/* ✅ CRITICAL FIX: Added onSubmit handler and prevented default */}
            <form onSubmit={handleLogin} autoComplete="off" noValidate>
              <div className="mb-3 position-relative">
                <img src={userIcon} alt="User Icon" className="input-icon" />
                <input
                  type="email"
                  className="form-control input"
                  placeholder="Admin Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="mb-3 position-relative">
                <img src={lockIcon} alt="Lock Icon" className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control input"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  onKeyDown={(e) => {
                    // ✅ Prevent Enter key from submitting if already loading
                    if (e.key === 'Enter' && loading) {
                      e.preventDefault();
                    }
                  }}
                />
                <img
                  src={eyeIcon}
                  alt="Toggle Visibility"
                  className="input-icon"
                  style={{ right: "16px", left: "auto", cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="alert alert-success" role="alert">
                  {success}
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check form-switch remember-toggle d-flex align-items-center">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="rememberSwitch"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="rememberSwitch">
                    Remember Me
                  </label>
                </div>
                <p className="forgot-link">
                  <Link to="/forgot-password">Forgot Password?</Link>
                </p>
              </div>

              {/* ✅ CRITICAL: Button type="submit" to trigger form submission */}
              <button 
                type="submit" 
                className="btn btn-dark w-100 mb-3"
                disabled={loading}
                style={{
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? (
                  <>
                    <span 
                      className="spinner-border spinner-border-sm me-2" 
                      role="status" 
                      aria-hidden="true"
                    />
                    Logging in...
                  </>
                ) : (
                  "Log In"
                )}
              </button>

              <div className="divider d-flex align-items-center">
                <hr />
                <span>Or continue with</span>
                <hr />
              </div>

              <button 
                type="button" 
                className="btn google-button w-100 mb-3"
                disabled={loading}
              >
                <img src={googleIcon} alt="Google" />
                Continue With Google
              </button>

              <p className="signup">
                Don't have admin access?{" "}
                <a href="#" onClick={(e) => e.preventDefault()}>Contact Support</a>
              </p>
            </form>
          </div>
        </div>

        <div className="col-lg-7 d-none d-lg-flex">
          <div className="login-right-pane">
            <img src="/assets/login-bg.png" alt="Login Visual" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;