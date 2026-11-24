import React from 'react';
import styles from './VolunteerDashboard.module.css';

const VolunteerOverview = ({ volunteerData, myRequestsCount, pendingRequestsCount }) => {
  const skills = volunteerData.skills || [];
  const verifiedSkillsCount = skills.filter((s) => s.verified).length;

  return (
    <>
      <div className={`${styles.bentoItem} ${styles.verifiedLayer} ${styles.colSpan5}`}>
        <h2 className={styles.cardTitle}>Responder Credentials</h2>
        <div className={styles.dataRow}>
          <span className={styles.label}>Email</span>
          <span className={styles.value}>{volunteerData.email}</span>
        </div>
        <div className={styles.dataRow}>
          <span className={styles.label}>Availability</span>
          <span className={styles.value}>{(volunteerData.availability || 'part-time').toUpperCase()}</span>
        </div>
        <div className={styles.dataRow}>
          <span className={styles.label}>Status</span>
          <span className={styles.verifiedChip}>{(volunteerData.status || 'active').toUpperCase()}</span>
        </div>
      </div>

      <div className={`${styles.bentoItem} ${styles.colSpan7}`}>
        <h2 className={styles.cardTitle}>Field Impact Telemetry</h2>
        <div className={styles.statsContainer}>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{volunteerData.trustScore || 0}</span>
            <span className={styles.statLabel}>Trust Score XP</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>
              {verifiedSkillsCount}/{skills.length}
            </span>
            <span className={styles.statLabel}>Verified Skills</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{myRequestsCount}</span>
            <span className={styles.statLabel}>Active Missions</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statValue}>{pendingRequestsCount}</span>
            <span className={styles.statLabel}>SOS Queue</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default VolunteerOverview;
