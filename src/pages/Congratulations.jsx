import React from 'react';
import { useNavigate } from 'react-router-dom';
import houseImage from '/assets/house-image.png';
import congratsIcon from '/assets/congrats-icon.png';
import '../styles/Congratulations.css';

const Congratulations = () => {
  const navigate = useNavigate();

  return (
    <div className="container-fluid congrats-wrapper">
      <div className="row h-100">
        {/* Left Section */}
        <div className="col-12 col-md-6 d-flex flex-column justify-content-center align-items-center congrats-left">
          <img src={congratsIcon} alt="Congrats Icon" className="congrats-icon img-fluid" />
          <h2 className="congrats-title text-center">Congratulations</h2>
          <p className="congrats-subtext text-center">Your account is ready to use</p>
          <button className="home-btn" onClick={() => navigate('/login')}>
            Go to Home
          </button>
        </div>

        {/* Right Section */}
        <div className="col-12 col-md-6 p-0 congrats-right">
          <img
            src={houseImage}
            alt="Modern house with pool"
            className="house-img img-fluid w-100 h-100"
          />
        </div>
      </div>
    </div>
  );
};

export default Congratulations;
