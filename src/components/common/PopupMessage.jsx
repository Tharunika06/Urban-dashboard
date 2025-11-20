// src/components/common/PopupMessage.jsx
import React from "react";
import GradientButton from "./GradientButton";
import "../../styles/PopupMessage.css";

const PopupMessage = ({
  title = "Are You Sure?",
  message = "Do you really want to delete these records? This process cannot be undone.",
  icon = "/assets/remove.png",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  buttonSize = "medium" // "small", "medium", "large"
}) => {
  // Button size configurations
  const buttonSizes = {
    small: { width: "80px", height: "32px", padding: "8px 16px" },
    medium: { width: "100px", height: "38px", padding: "12px 20px" },
    large: { width: "120px", height: "44px", padding: "16px 24px" }
  };

  const sizeConfig = buttonSizes[buttonSize] || buttonSizes.medium;

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <button className="close-btn" onClick={onCancel}>×</button>

        {icon && <img src="/assets/popup.png" alt="popup icon" className="popup-icon" />}

        <h2>{title}</h2>
        <p>{message}</p>

        <div className="popup-actions">
          {/* Only show cancel button if cancelLabel is provided */}
          {cancelLabel && (
            <GradientButton
              onClick={onCancel}
              width={sizeConfig.width}
              height={sizeConfig.height}
              style={{ 
                padding: sizeConfig.padding
              }}
            >
              {cancelLabel}
            </GradientButton>
          )}
          <GradientButton
            onClick={onConfirm}
            width={sizeConfig.width}
            height={sizeConfig.height}
            style={{ 
              padding: sizeConfig.padding
            }}
          >
            {confirmLabel}
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default PopupMessage;