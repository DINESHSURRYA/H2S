import React from 'react';
import styles from './ProfileCard.module.css';

import Button from '../Button/Button';

/**
 * Independent component to display profile details.
 * @param {object} profile - Object containing profile specific details.
 * @returns {JSX.Element} - Interactive card for profile info.
 */
const ProfileCard = ({ profile, onRefresh, isSyncing }) => {
  // Destructuring object data for cleaner usage
  const { name, role, details } = profile || {};

  return (
    <div className={`${styles.card} ${isSyncing ? styles.syncing : ''}`}>
      {/* Overlay indicator for active background sync */}
      {isSyncing && <div className={styles.syncOverlay}>Refreshing Node...</div>}

      <div className={styles.header}>
        <div className={styles.badge}>PORT:3000</div>
        <h3 className={styles.title}>System Entity Profile</h3>
      </div>
      
      <div className={styles.body}>
        <div className={styles.detail}>
          <span className={styles.label}>Identity Tag</span>
          <div className={styles.value}>{name}</div>
        </div>
        
        <div className={styles.detail}>
          <span className={styles.label}>Execution Role</span>
          <div className={styles.value}>{role}</div>
        </div>
        
        <div className={styles.detail}>
          <span className={styles.label}>Core Parameters</span>
          <p className={styles.bio}>{details}</p>
        </div>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.actions}>
          <Button onClick={onRefresh}>
            {isSyncing ? 'Syncing...' : 'Refresh Sync'}
          </Button>
          <span className={styles.status}>
            {isSyncing ? 'UPDATING...' : 'ONLINE • CONNECTED'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
