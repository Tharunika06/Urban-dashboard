import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Auth.css";
import "bootstrap/dist/css/bootstrap.min.css";

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

  const isValidPassword = (pass) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/;
    return regex.test(pass);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!agreeTerms) return setError("You must agree to the terms.");
    if (!isValidPassword(password)) {
      return setError("Password must be at least 8 characters, include a symbol and a number.");
    }

    try {
      const res = await fetch("http://192.168.1.45:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setError("");
        alert("OTP sent to your email.");
        navigate("/verify", { state: { email } });
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
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

              {error && <div className="alert alert-danger">{error}</div>}

              <div className="form-check mb-4">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms(!agreeTerms)}
                />
                <label htmlFor="agreeTerms" className="form-check-label">
                  By clicking the Register button, you agree to the public offer
                </label>
              </div>

              <button type="submit" className="btn btn-dark w-100 mb-3">
                Sign Up
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