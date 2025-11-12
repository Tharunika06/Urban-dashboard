import React from 'react';

const GradientButton = ({ 
  onClick,
  children,
  className = '',
  disabled = false,
  width = '161px',
  height = '40px',
  style = {}
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'linear-gradient(180deg, #474747 0%,#000000  100%)',
        width: width,
        height: height,
        borderRadius: '8px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...style, // Allow additional custom styles
      }}
      className={`
        text-white
        font-medium
        transition-all
        duration-300
        focus:outline-none
        focus:ring-2
        focus:ring-gray-500
        focus:ring-offset-2
        shadow-lg
        hover:shadow-xl
        hover:opacity-90
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default GradientButton;