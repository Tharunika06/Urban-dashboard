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
      const res = await fetch("http://192.168.0.152:5000/api/signup", {
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
    <div className="container-fluid p-0">
      <div className="row g-0 min-vh-100">
        {/* Form Column */}
        <div className="col-lg-5 col-md-8 col-12 mx-auto d-flex align-items-center justify-content-center">
          <div className="form-box w-100">
            <img src={logo} alt="Urban Logo" className="logo mb-4 mx-auto d-block" />
            <h2 className="title text-center mb-2">Create Your Account</h2>
            <p className="subtitle text-center mb-4">
              Sign up now to gain access to member-only discounts and personalized recommendations.
            </p>

            <form onSubmit={handleSignup}>
              <div className="mb-3 position-relative">
                <img src={userIcon} alt="Email Icon" className="input-icon" />
                <input
                  type="email"
                  className="form-control input ps-5"
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
                  className="form-control input ps-5 pe-5"
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

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms(!agreeTerms)}
                />
                <label htmlFor="agreeTerms" className="form-check-label ms-2">
                  By clicking the Register button, you agree to the public offer
                </label>
              </div>

              <button type="submit" className="btn btn-dark w-100 mb-3">
                Sign Up
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
                Already Have an Account?{" "}
                <Link to="/login" className="fw-medium text-primary">
                  Log In
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Image Column */}
        <div className="col-lg-7 d-none d-lg-flex align-items-center justify-content-center signup-right-pane p-5">
          <img src="/assets/signup-bg.png" alt="Signup Visual" className="img-fluid" />
        </div>
      </div>
    </div>
  );
};

export default Signup;
