import React from 'react';
import styles from './VolunteerDashboard.module.css';

const VolunteerOverview = ({ volunteerData, myRequestsCount, raisedRequestsCount }) => {
  return (
    <>
      <div className={`${styles.bentoItem} ${styles.verifiedLayer}`} style={{ gridColumn: 'span 4' }}>
        <h2 className={styles.cardTitle}>Personnel ID // Verified</h2>
        <div className={styles.dataRow}>
          <span className={styles.label}>COM-LINK:</span>
          <span className={styles.value}>{volunteerData.email}</span>
        </div>
        <div className={styles.dataRow}>
          <span className={styles.label}>AUTH STATUS:</span>
          <span className={styles.verifiedChip}>{volunteerData.status}</span>
        </div>
      </div>

      <div className={styles.bentoItem} style={{ gridColumn: 'span 8' }}>
        <h2 className={styles.cardTitle}>Operational Metrics</h2>
        <div className={styles.statsContainer} style={{ display: 'flex', gap: '3rem' }}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{myRequestsCount}</span>
            <span className={styles.statLabel}>Active Missions</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{raisedRequestsCount}</span>
            <span className={styles.statLabel}>Field Intel Reports</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default VolunteerOverview;
