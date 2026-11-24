import React from 'react';
import styles from './NgoDashboard.module.css';

const NgoOverview = ({ ngoData, stats }) => {
  return (
    <>
      <div className={`${styles.bentoItem} ${styles.verifiedLayer} ${styles.colSpan4}`}>
        <h2 className={styles.cardTitle}>Organization Profile</h2>
        <div className={styles.dataRow}>
          <span className={styles.label}>HQ Email</span>
          <span className={styles.value}>{ngoData.email}</span>
        </div>
        <div className={styles.dataRow}>
          <span className={styles.label}>Registration ID</span>
          <span className={styles.value}>{ngoData.registrationNumber || 'Not Provided'}</span>
        </div>
        <div className={styles.dataRow}>
          <span className={styles.label}>Status</span>
          <span className={`${styles.statusBadge} ${styles[`status_${ngoData.status || 'pending'}`]}`}>
            {(ngoData.status || 'pending').toUpperCase()}
          </span>
        </div>
      </div>

      <div className={`${styles.bentoItem} ${styles.colSpan8}`}>
        <h2 className={styles.cardTitle}>Verified Impact Statistics</h2>
        <div className={styles.statsContainer}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{stats?.missionsSupported ?? 0}</span>
            <span className={styles.statLabel}>Missions Supported</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{stats?.totalUnitsAllocated ?? 0}</span>
            <span className={styles.statLabel}>Units Allocated</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{stats?.confirmedDeliveries ?? 0}</span>
            <span className={styles.statLabel}>Verified Deliveries</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{ngoData.trustScore || 0}</span>
            <span className={styles.statLabel}>Trust Score XP</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default NgoOverview;
