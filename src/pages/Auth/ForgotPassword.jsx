// src/pages/Auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/ForgotPassword.css";
import authService, { handleAuthError, storage } from '../../services/authService';
import GradientButton from "../../components/common/GradientButton";
import logo from "/assets/logo.png";
import userIcon from "/assets/user-icon.png";
import peopleImg from "/assets/fgp.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleContinue = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.forgotPassword(email);

      if (data.ok) {
        storage.saveResetEmail(email);
        navigate("/verify", { state: { email, type: "reset" } });
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(handleAuthError(err));
      setLoading(false);
    }
  };

  return (
    <div className="forgot-wrapper container-fluid">
      <div className="row h-100">
        {/* Left Side */}
        <div className="col-12 col-md-6 d-flex flex-column justify-content-center align-items-center forgot-left px-5">
          <img src={logo} alt="Urban Logo" className="forgot-logo mb-4" />
          <h2 className="forgot-title mb-2">Forgot Password</h2>
          <p className="forgot-subtext mb-4 text-center">
            Select which contact details should we use to reset your password
          </p>

          <form onSubmit={handleContinue} className="w-100" style={{ maxWidth: "320px" }}>
            {/* Input with Icon */}
            <div className="position-relative w-100 mb-3">
              <img
                src={userIcon}
                alt="User"
                className="position-absolute"
                style={{ top: "50%", left: "12px", transform: "translateY(-50%)", width: "20px", opacity: 0.7 }}
              />
              <input
                type="email"
                className="form-control ps-5"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <GradientButton 
              type="submit" 
              className="w-100"
              disabled={loading}
              width="100%"
              height="48px"
            >
              {loading ? (
                <>
                  <span 
                    className="spinner-border spinner-border-sm me-2" 
                    role="status" 
                    aria-hidden="true"
                  />
                  Sending OTP...
                </>
              ) : (
                "Continue"
              )}
            </GradientButton>
          </form>
        </div>

        {/* Right Side */}
        <div className="col-12 col-md-6 p-0 d-none d-md-block forgot-right">
          <img
            src={peopleImg}
            alt="Handshake"
            className="img-fluid w-100 h-100 object-fit-cover rounded-end"
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;