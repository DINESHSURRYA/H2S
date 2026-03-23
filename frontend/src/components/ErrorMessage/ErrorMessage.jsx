import React from 'react';
import styles from './ErrorMessage.module.css';

/**
 * Reusable Error Message Component to display state failures.
 * @param {string} message - Descriptive text of the error.
 * @returns {JSX.Element} - Styled alert message.
 */
const ErrorMessage = ({ message }) => {
  // Use modular styles to avoid global pollution
  return (
    <div className={styles.errorBox}>
      <span className={styles.icon}>⚠️</span>
      <div className={styles.content}>
        <h4 className={styles.title}>Data Sync Failure</h4>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;
