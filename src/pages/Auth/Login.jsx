// client/src/pages/Login.jsx
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

  // Clear messages when component loads
  useEffect(() => {
    setError("");
    setSuccess("");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://192.168.0.152:5000/api/login", {
        email,
        password,
      });

      if (response.data.ok) {
        // ✅ Save full user info + token
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);

        // ✅ Remember Me logic
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

        // ✅ Success message
        setSuccess("Login successful! Redirecting...");

        // Delay navigation so user sees notification
        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-0 min-vh-100">
        {/* Form Column */}
        <div className="col-lg-5 col-md-8 col-12 mx-auto d-flex align-items-center justify-content-center">
          <div className="form-box w-100">
            <img src={logo} alt="Urban Logo" className="logo mb-4 mx-auto d-block" />
            <h2 className="title text-center mb-2">Welcome Back! 👋🏻</h2>
            <p className="subtitle text-center mb-4">
              Log in to access your account and explore our latest features.
            </p>

            <form onSubmit={handleLogin}>
              <div className="mb-3 position-relative">
                <img src={userIcon} alt="User Icon" className="input-icon" />
                <input
                  type="email"
                  className="form-control input ps-5"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3 position-relative">
                <img src={lockIcon} alt="Lock Icon" className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control input ps-5 pe-5"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <img
                  src={eyeIcon}
                  alt="Toggle Visibility"
                  className="input-icon"
                  style={{ right: "16px", left: "auto", cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>

              {/* ✅ Show errors or success */}
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check form-switch remember-toggle d-flex align-items-center">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="rememberSwitch"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <label className="form-check-label ms-2" htmlFor="rememberSwitch">
                    Remember Me
                  </label>
                </div>
                <p className="forgot-link">
                  <Link to="/forgot-password">Forgot Password?</Link>
                </p>
              </div>

              <button type="submit" className="btn btn-dark w-100 mb-3 login-button">
                Log In
              </button>

              <div className="divider d-flex align-items-center my-3">
                <hr className="flex-grow-1" />
                <span className="mx-2 small text-muted">Or continue with</span>
                <hr className="flex-grow-1" />
              </div>

              <button type="button" className="btn google-button w-100 mb-3">
                <img src={googleIcon} alt="Google" className="me-2" />
                Continue With Google
              </button>

              <p className="signup text-center small">
                Don't have an account?{" "}
                <Link to="/signup" className="fw-medium text-primary">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Image Column */}
        <div className="col-lg-7 d-none d-lg-flex align-items-center justify-content-center login-right-pane p-5">
          <img src="/assets/login-bg.png" alt="Login Visual" className="img-fluid" />
        </div>
      </div>
    </div>
  );
};

export default Login;
