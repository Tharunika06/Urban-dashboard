// src/pages/Auth/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Auth.css";
import "bootstrap/dist/css/bootstrap.min.css";
import authService, { handleAuthError, validatePassword } from "../../services/authService";
import logo from "/assets/logo.png";
import userIcon from "/assets/user-icon.png";
import lockIcon from "/assets/lock-icon.png";
import eyeIcon from "/assets/eye-icon.png";
import googleIcon from "/assets/google-icon.png";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreeTerms) {
      return setError("You must agree to the terms.");
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return setError(passwordValidation.message);
    }

    setLoading(true);

    try {
      const data = await authService.signup(email, password);

      if (data.ok) {
        setError("");
        alert("OTP sent to your email.");
        navigate("/verify", { state: { email } });
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(handleAuthError(err));
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row g-0">
        {/* Form Column */}
        <div className="col-lg-5 col-md-12 col-12">
          <div className="form-box">
            <img src={logo} alt="Urban Logo" className="logo mx-auto d-block" />
            <h2 className="title">Create Your Account</h2>
            <p className="subtitle">
              Sign up now to gain access to member-only discounts and personalized recommendations.
            </p>

            <form onSubmit={handleSignup}>
              <div className="mb-3 position-relative">
                <img src={userIcon} alt="Email Icon" className="input-icon" />
                <input
                  type="email"
                  className="form-control input"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="mb-3 position-relative">
                <img src={lockIcon} alt="Lock Icon" className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control input"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="new-password"
                  required
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

              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms(!agreeTerms)}
                  disabled={loading}
                />
                <label htmlFor="agreeTerms" className="form-check-label">
                  By clicking the Register button, you agree to the public offer
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-dark w-100 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span 
                      className="spinner-border spinner-border-sm me-2" 
                      role="status" 
                      aria-hidden="true"
                    />
                    Signing up...
                  </>
                ) : (
                  "Sign Up"
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
                Already Have an Account?{" "}
                <Link to="/login">Log In</Link>
              </p>
            </form>
          </div>
        </div>

        {/* Image Column */}
        <div className="col-lg-7 d-none d-lg-flex">
          <div className="signup-right-pane">
            <img src="/assets/signup-bg.png" alt="Signup Visual" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;