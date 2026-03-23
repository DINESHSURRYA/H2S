import React from 'react';
import Button from '../components/Button/Button';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

/**
 * Modern SPA landing page component.
 * @returns {JSX.Element} - Home dashboard for the GH Core system.
 */
const Home = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.homeContainer}>
      <h2 className={styles.title}>
        Welcome to the <span className={styles.highlight}>Core Ecosystem</span>
      </h2>
      <p className={styles.description}>
        This Single Page Application (SPA) is architected for maximum interaction. 
        Experience the modular component layers and our signature interactive GH cursor system.
      </p>
      
      <div className={styles.actionGrid}>
        <Button onClick={() => navigate('/user')}>Explore User Entity</Button>
        <Button onClick={() => navigate('/profile')}>View Profile Context</Button>
      </div>
    </div>
  );
};

export default Home;
