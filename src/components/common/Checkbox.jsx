// Checkbox.jsx
import React from 'react';
import './Checkbox.css'; // Optional: if you want custom styling

/**
 * Reusable Checkbox Component
 * @param {boolean} checked - Whether the checkbox is checked
 * @param {function} onChange - Handler function when checkbox state changes
 * @param {string} id - Unique identifier for the checkbox
 * @param {string} label - Optional label text to display next to checkbox
 * @param {string} className - Additional CSS classes
 * @param {boolean} disabled - Whether the checkbox is disabled
 * @param {boolean} indeterminate - Whether to show indeterminate state (for "select all" scenarios)
 */
const Checkbox = ({ 
  checked = false, 
  onChange, 
  id, 
  label, 
  className = '', 
  disabled = false,
  indeterminate = false,
  ...props 
}) => {
  const checkboxRef = React.useRef(null);

  // Handle indeterminate state (useful for "select all" when some but not all items are selected)
  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className={`checkbox-wrapper ${className}`}>
      <input
        ref={checkboxRef}
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="checkbox-input"
        {...props}
      />
      {label && (
        <label htmlFor={id} className="checkbox-label">
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;