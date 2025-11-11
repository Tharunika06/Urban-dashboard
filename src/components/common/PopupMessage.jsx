// src/components/common/PopupMessage.jsx
import React from "react";
import "../../styles/PopupMessage.css";

const PopupMessage = ({
  title = "Are You Sure?",
  message = "Do you really want to delete these records? This process cannot be undone.",
  icon = "/assets/remove.png",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel
}) => {
  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <button className="close-btn" onClick={onCancel}>×</button>

        {icon && <img src={icon} alt="popup icon" className="popup-icon" />}

        <h2>{title}</h2>
        <p>{message}</p>

        <div className="popup-actions">
          {/* Only show cancel button if cancelLabel is provided */}
          {cancelLabel && (
            <button className="cancel-btn" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button className="delete-btn" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupMessage;  