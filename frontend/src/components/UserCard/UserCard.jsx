import React from 'react';
import styles from './UserCard.module.css';

/**
 * Independent component to display general user details.
 * @param {object} user - Object containing user specific parameters.
 * @returns {JSX.Element} - Interactive card for user data.
 */
const UserCard = ({ user }) => {
  // Arrow functions and destructuring (ES6 Standards)
  const { name, role, age } = user || {};

  return (
    <div className={styles.card}>
      <div className={styles.indicator}></div>
      <div className={styles.header}>
        <span className={styles.userRef}>ID-REF: {user?.id}</span>
        <h3 className={styles.title}>System User Entity</h3>
      </div>
      
      <div className={styles.profileGrid}>
        <div className={styles.statBox}>
          <span className={styles.label}>Name</span>
          <span className={styles.value}>{name}</span>
        </div>
        
        <div className={styles.statBox}>
          <span className={styles.label}>Hierarchy</span>
          <span className={styles.value}>{role}</span>
        </div>
        
        <div className={styles.statBox}>
          <span className={styles.label}>Cycle Count</span>
          <span className={styles.value}>{age} Solar Cycles</span>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
