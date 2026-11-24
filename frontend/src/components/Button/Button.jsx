import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, onClick, type = 'button', disabled = false, className = '', ...rest }) => {
  return (
    <button
      className={`${styles.button} ${className}`.trim()}
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
