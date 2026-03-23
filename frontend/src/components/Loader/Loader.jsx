import React from 'react';
import styles from './Loader.module.css';

/**
 * Reusable Loader Component for consistent indeterminate states.
 * @returns {JSX.Element} - Styled spinner within a container.
 */
const Loader = () => {
  // Use CSS module styles for isolation
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.text}>Synchronizing Layers...</p>
    </div>
  );
};

export default Loader;
