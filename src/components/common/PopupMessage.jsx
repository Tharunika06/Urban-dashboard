// src/components/common/PopupMessage.jsx
import React from "react";
import "../../styles/PopupMessage.css";

const PopupMessage = ({ onConfirm, onCancel }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <button className="close-btn" onClick={onCancel}>×</button>
        <img
          src="/assets/remove.png"
          alt="confirm"
          className="popup-icon"
        />
        <h2>Are You Sure?</h2>
        <p>
          Do you really want to delete these records? This process cannot be undone.
        </p>
        <div className="popup-actions">
          <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          <button className="delete-btn" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default PopupMessage;
