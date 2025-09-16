// src/pages/Auth/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/ForgotPassword.css";

import logo from "/assets/logo.png";
import userIcon from "/assets/user-icon.png";
import peopleImg from "/assets/fgp.png";

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleContinue = async () => {
    try {
      await axios.post("http://192.168.0.152:5000/api/forgot-password", { email });
      localStorage.setItem("resetEmail", email);
      navigate("/verify", { state: { email, type: "reset" } });
    } catch (err) {
      console.error("Error sending OTP:", err);
      alert("Error sending OTP");
    }
  };

  return (
    <div className="forgot-wrapper container-fluid">
      <div className="row h-100">
        {/* Left Side */}
        <div className="col-12 col-md-6 d-flex flex-column justify-content-center align-items-center forgot-left px-5">
          <img src={logo} alt="Urban Logo" className="forgot-logo mb-4" />
          <h2 className="forgot-title mb-2">Forget Password</h2>
          <p className="forgot-subtext mb-4 text-center">
            Select which contact details should we use to reset your password
          </p>

          {/* Input with Icon */}
          <div className="position-relative w-100 mb-3" style={{ maxWidth: "320px" }}>
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
            />
          </div>

          <button className="btn btn-dark w-100 forgot-button" style={{ maxWidth: "320px" }} onClick={handleContinue}>
            Continue
          </button>
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

export default ForgetPassword;
