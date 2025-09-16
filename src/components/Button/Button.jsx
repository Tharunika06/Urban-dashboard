import React from "react";
import "./Button.css";

const Button = ({ type = "button", onClick, children, className = "" }) => {
  return (
    <button type={type} className={`common-button ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
