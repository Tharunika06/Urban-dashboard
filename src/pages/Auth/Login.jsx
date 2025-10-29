//AdminLogin.jsx - COMPLETE FIXED VERSION

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/Auth.css";

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

  useEffect(() => {
    setError("");
    setSuccess("");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // FIXED: Correct admin login endpoint
      const response = await axios.post("http://192.168.0.152:5000/api/admin-login", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.data.ok) {
        // CRITICAL FIX: Store authentication token
        localStorage.setItem("authToken", response.data.token);
        
        // Store user data
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // Remember Me logic
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("adminEmail", email);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("adminEmail");
        }

        setSuccess("Login successful! Redirecting to dashboard...");

        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setLoading(false);

      if (err.response?.status === 403) {
        setError("Access denied. Admin privileges required. Your account does not have admin access.");
      } else if (err.response?.status === 401) {
        setError("Access denied.Please try again.");
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message === "Network Error") {
        setError("Cannot connect to server. Please check your connection.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  useEffect(() => {
    const remembered = localStorage.getItem("rememberMe");
    const savedEmail = localStorage.getItem("adminEmail");
    
    if (remembered === "true" && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

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

            <form onSubmit={handleLogin}>
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
                  <strong>Error:</strong> {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success" role="alert">
                  <strong>Success!</strong> {success}
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
                    onChange={() => setRememberMe(!rememberMe)}
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

              <button 
                type="submit" 
                className="btn btn-dark w-100 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>

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
                <a>Sign Up</a>
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