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
        // Save full user info + token
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("token", response.data.token);

        // Remember Me logic
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

        // Success message
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
    <div className="container-fluid">
      <div className="row g-0">
        {/* Form Column */}
        <div className="col-lg-5 col-md-12 col-12">
          <div className="form-box">
            <img src={logo} alt="Urban Logo" className="logo mx-auto d-block" />
            <h2 className="title">Welcome Back! 👋🏻</h2>
            <p className="subtitle">
              We're glad to see you again. Log in to access your account and explore our latest features.
            </p>

            <form onSubmit={handleLogin}>
              <div className="mb-3 position-relative">
                <img src={userIcon} alt="User Icon" className="input-icon" />
                <input
                  type="email"
                  className="form-control input"
                  placeholder="User Name"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                />
                <img
                  src={eyeIcon}
                  alt="Toggle Visibility"
                  className="input-icon"
                  style={{ right: "16px", left: "auto", cursor: "pointer" }}
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>

              {/* Show errors or success */}
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
                  <label className="form-check-label" htmlFor="rememberSwitch">
                    Remember Me
                  </label>
                </div>
                <p className="forgot-link">
                  <Link to="/forgot-password">Forgot Password?</Link>
                </p>
              </div>

              <button type="submit" className="btn btn-dark w-100 mb-3">
                Log In
              </button>

              <div className="divider d-flex align-items-center">
                <hr />
                <span>Or continue with</span>
                <hr />
              </div>

              <button type="button" className="btn google-button w-100 mb-3">
                <img src={googleIcon} alt="Google" />
                Continue With Google
              </button>

              <p className="signup">
                Don't have an account?{" "}
                <Link to="/signup">Sign up</Link>
              </p>
            </form>
          </div>
        </div>

        {/* Image Column */}
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