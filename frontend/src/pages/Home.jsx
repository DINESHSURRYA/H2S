import React from 'react';
import styles from './Home.module.css';

/**
 * Landing page for the H2S Smart Crisis Management System.
 * @returns {JSX.Element} - Home dashboard.
 */
const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <h2 className={styles.title}>
        Welcome to <span className={styles.highlight}>H2S</span>
      </h2>
      <p className={styles.description}>
        Smart Crisis Management System — built with a clean layered architecture.
      </p>
    </div>
  );
};

export default Home;
