import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/Verification.css";

import authService, { storage } from "../../services/authService";
import GradientButton from "../../components/common/GradientButton";
import logo from "/assets/logo.png";
import houseImage from "/assets/image.png";

const Verification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState("signup"); // default type

  useEffect(() => {
    const passedEmail = location.state?.email || storage.getResetEmail();
    const passedType = location.state?.type || "signup";

    if (!passedEmail) {
      navigate("/signup");
    } else {
      setEmail(passedEmail);
      setType(passedType);
    }
  }, [location, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    if (value && index < 5) {
      document.getElementById(`digit${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`digit${index - 1}`).focus();
    }
  };

  const handleSubmit = async () => {
    const enteredCode = code.join("");
    if (enteredCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    try {
      let response;
      
      // ✅ Use different authService methods based on type
      if (type === "reset") {
        response = await authService.verifyResetOTP(email, enteredCode);
      } else {
        response = await authService.verifySignupOTP(email, enteredCode);
      }

      console.log("Server response:", response);

      if (response.ok) {
        if (type === "reset") {
          storage.saveResetEmail(email);
          navigate("/reset-password");
        } else if (type === "signup") {
          navigate("/congratulations");
        }
      } else {
        setError(response.error || "Invalid verification code");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError(
        error.response?.data?.error || 
        "Verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verify-body">
      <div className="verify-container">
        <div className="verify-left text-center">
          <img src={logo} alt="Urban Logo" className="verify-logo mb-4" />
          <h1 className="verify-heading">Enter Verification Code</h1>
          <p className="verify-subtext">
            We have sent the verification code to <strong>{email}</strong>
          </p>

          <div className="verify-inputs">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`digit${index}`}
                type="text"
                maxLength="1"
                className="verify-box"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isLoading}
              />
            ))}
          </div>

          {error && <div className="alert alert-danger mt-2">{error}</div>}

          <GradientButton
            className="mt-3"
            onClick={handleSubmit}
            disabled={isLoading}
            width="320px"
            height="48px"
          >
            {isLoading ? "Verifying..." : "Continue"}
          </GradientButton>
        </div>

        <div className="verify-right d-none d-md-flex">
          <img
            src={houseImage}
            alt="A man in a suit holding a miniature house"
            className="verify-right-img"
          />
        </div>
      </div>
    </div>
  );
};

export default Verification;