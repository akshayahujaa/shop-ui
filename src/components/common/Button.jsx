import React from 'react';
import PropTypes from 'prop-types';
import './Button.css';

/**
 * Premium reusable button component.
 * Uses CSS variables defined in variables.css for color, transition, and glassmorphism.
 */
export const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled }) => (
  <button
    type={type}
    className={`btn btn-${variant}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  disabled: PropTypes.bool,
};

export default Button;
