import React from 'react';
import './Button.css';

/**
 * Reusable button component following the premium design system.
 * Props:
 *   - type: button | submit | reset (default: 'button')
 *   - variant: 'primary' | 'secondary' (default: 'primary')
 *   - onClick: handler function
 *   - children: button label/content
 */
export const Button = ({ type = 'button', variant = 'primary', onClick, children, disabled }) => (
  <button
    type={type}
    className={`btn btn-${variant}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

export default Button;
