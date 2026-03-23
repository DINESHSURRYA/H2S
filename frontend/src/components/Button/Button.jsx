import React from 'react';
import styles from './Button.module.css';

/**
 * Reusable Button component with modular styling.
 * @param {string} children - Content of the button.
 * @param {function} onClick - Click handler.
 * @returns {JSX.Element} - Styled interactive button.
 */
const Button = ({ children, onClick, type = "button" }) => {
  // Use CSS module class instead of inline styles
  return (
    <button 
      className={styles.button} 
      type={type} 
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
