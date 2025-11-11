// src/pages/Auth/ResetPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/ResetPassword.css";
import authService, { handleAuthError, validatePassword, storage } from "../../services/authService";
import logo from "/assets/logo.png";
import lockIcon from "/assets/lock-icon.png";
import eyeIcon from "/assets/eye-icon.png";
import houseImg from "/assets/rpw.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    const email = storage.getResetEmail();

    if (!email) {
      setError("Session expired. Please start the password reset process again.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    setLoading(true);

    try {
      const data = await authService.resetPassword(email, password);

      if (data.ok) {
        storage.clearResetEmail();
        alert("Password reset successful! Please login with your new password.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError(handleAuthError(err));
      setLoading(false);
    }
  };

  return (
    <div className="reset-wrapper container-fluid">
      <div className="row h-100">
        {/* Left Section */}
        <div className="col-12 col-md-6 d-flex flex-column justify-content-center align-items-center reset-left px-5">
          <img src={logo} alt="Urban Logo" className="reset-logo mb-4" />
          <h2 className="reset-title mb-2">Enter New Password</h2>
          <p className="reset-subtext mb-4 text-center">Please enter your new password</p>

          <form onSubmit={handleSave} className="w-100" style={{ maxWidth: "320px" }}>
            {/* Password Field */}
            <div className="position-relative w-100 mb-3">
              <img
                src={lockIcon}
                alt="Password Icon"
                className="position-absolute"
                style={{ top: "50%", left: "12px", transform: "translateY(-50%)", width: "20px", opacity: 0.7 }}
              />
              <input
                type={showPassword ? "text" : "password"}
                className="form-control ps-5 pe-5"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                required
              />
              <img
                src={eyeIcon}
                alt="Toggle Password"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "20px",
                  cursor: "pointer",
                  opacity: 0.6
                }}
              />
            </div>

            {/* Confirm Password Field */}
            <div className="position-relative w-100 mb-3">
              <img
                src={lockIcon}
                alt="Confirm Password Icon"
                className="position-absolute"
                style={{ top: "50%", left: "12px", transform: "translateY(-50%)", width: "20px", opacity: 0.7 }}
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="form-control ps-5 pe-5"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                required
              />
              <img
                src={eyeIcon}
                alt="Toggle Confirm Password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "20px",
                  cursor: "pointer",
                  opacity: 0.6
                }}
              />
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-dark w-100 reset-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span 
                    className="spinner-border spinner-border-sm me-2" 
                    role="status" 
                    aria-hidden="true"
                  />
                  Resetting...
                </>
              ) : (
                "Save"
              )}
            </button>
          </form>
        </div>

        {/* Right Section */}
        <div className="col-12 col-md-6 p-0 d-none d-md-block reset-right">
          <img
            src={houseImg}
            alt="Modern house"
            className="img-fluid w-100 h-100 object-fit-cover rounded-end"
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;