// src/components/common/Card.jsx

import React from 'react';
import './Card.css'; // Optional: Add styling if needed

const Card = ({ title, children, className = '' }) => {
  return (
    <div className={`card-container ${className}`}>
      <div className="card-header">
        <h4>{title}</h4>
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;