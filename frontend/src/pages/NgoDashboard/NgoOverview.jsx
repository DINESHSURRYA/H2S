import React from 'react';
import styles from './NgoDashboard.module.css';

const NgoOverview = ({ ngoData }) => {
  return (
    <>
      <div className={`${styles.bentoItem} ${styles.verifiedLayer}`} style={{ gridColumn: 'span 4' }}>
        <h2 className={styles.cardTitle}>Unit Profile // Authorized</h2>
        <div className={styles.dataRow}>
          <span className={styles.label}>HQ-MAIL:</span>
          <span className={styles.value}>{ngoData.email}</span>
        </div>
        <div className={styles.dataRow}>
          <span className={styles.label}>REGISTRATION:</span>
          <span className={styles.value}>{ngoData.registrationNumber || 'AUTH-PENDING'}</span>
        </div>
        <div className={styles.dataRow} style={{ borderBottom: 'none' }}>
          <span className={styles.label}>OPS-STATUS:</span>
          <span className={styles.verifiedChip}>{ngoData.status.toUpperCase()}</span>
        </div>
      </div>

      <div className={styles.bentoItem} style={{ gridColumn: 'span 8' }}>
        <h2 className={styles.cardTitle}>Operational Statistics</h2>
        <div className={styles.statsContainer} style={{ display: 'flex', gap: '3rem' }}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>0</span>
            <span className={styles.statLabel}>Active Sectors</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>0</span>
            <span className={styles.statLabel}>Deployed Units</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default NgoOverview;
