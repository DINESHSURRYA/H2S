import React from 'react';
import styles from './VolunteerDashboard.module.css';

const MyRaisedRequests = ({ requests }) => {
  return (
    <div className={styles.bentoItem} style={{ gridColumn: 'span 12' }}>
      <h2 className={styles.cardTitle}>Field Intel // Intelligence Reports</h2>
      {requests.length === 0 ? (
        <p className={styles.placeholderText}>No intelligence reports filed by this unit.</p>
      ) : (
        <div className={styles.requestList}>
          {requests.map((req) => (
            <div key={req._id} className={`${styles.requestItem} ${styles.verifiedLayer}`}>
              <div className={styles.requestHeader}>
                <span className={styles.requestName}>OP-ID: {req._id.slice(-8).toUpperCase()}</span>
                <span className={styles.metaCoords}>📍 {req.location?.latitude?.toFixed(4) || '—'} // {req.location?.longitude?.toFixed(4) || '—'}</span>
              </div>
              <p className={styles.requestDesc} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{req.crisisDescription}</p>
              <div className={styles.statusRow} style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span className={styles.verifiedChip}>{req.status?.toUpperCase() || 'UNKNOWN'}</span>
                <span className={styles.timestamp}>TRANSMITTED: {new Date(req.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRaisedRequests;
