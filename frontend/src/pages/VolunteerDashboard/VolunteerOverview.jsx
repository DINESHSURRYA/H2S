import React from 'react';
import styles from './VolunteerDashboard.module.css';

const VolunteerOverview = ({ volunteerData, myRequestsCount, raisedRequestsCount }) => {
  return (
    <>
      <div className={`${styles.bentoItem} ${styles.verifiedLayer}`} style={{ gridColumn: 'span 4' }}>
        <h2 className={styles.cardTitle}>Personnel ID</h2>
        <div className={styles.dataRow}>
          <span className={styles.label}>Email ID :</span>
          <span className={styles.value}>{volunteerData.email}</span>
        </div>
        <div className={styles.dataRow}>
          <span className={styles.label}>AUTH STATUS:</span>
          <span className={styles.verifiedChip}>{volunteerData.status}</span>
        </div>
      </div>
    </>
  );
};

export default VolunteerOverview;
