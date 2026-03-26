import React from 'react';
import styles from './VolunteerDashboard.module.css';

const MyAcceptedTasks = ({ requests, volunteerData }) => {
  return (
    <div className={styles.bentoItem} style={{ gridColumn: 'span 12' }}>
      <h2 className={styles.cardTitle}>Active Missions // Operational</h2>
      {requests.length === 0 ? (
        <p className={styles.placeholderText}>No active sorties assigned to this unit.</p>
      ) : (
        <div className={styles.requestList}>
          {requests.map((req) => (
            <div key={req._id} className={`${styles.requestItem} ${styles.verifiedLayer}`}>
              <div className={styles.requestHeader}>
                <span className={styles.requestName}>
                  {req.publicUser?.name || 'Unknown Subject'}
                  <span className={styles.verifiedChip} style={{ marginLeft: '1rem' }}>IN-PROGRESS</span>
                </span>
                <span className={styles.metaCoords}>📍 {req.location?.latitude?.toFixed(4) || '—'} // {req.location?.longitude?.toFixed(4) || '—'}</span>
              </div>
              <p className={styles.requestDesc} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{req.crisisDescription}</p>
              <div className={styles.productTags} style={{ marginTop: '1rem' }}>
                {req.requirements?.map((p, idx) => (
                  <span key={idx} className={styles.tag} style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                    {p.quantity} × {p.itemName?.toUpperCase() || 'UNSPECIFIED'}
                  </span>
                ))}
              </div>
              <div className={styles.requestFooter} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '1.5rem', paddingTop: '1rem' }}>
                <span className={styles.timestamp}>ASSIGNMENT TIMESTAMP: {new Date(req.createdAt).toLocaleDateString()}</span>
                <span className={styles.metaCoords} style={{ color: 'var(--emerald-luminous)' }}>DEPLOYED UNIT: {volunteerData?.name?.toUpperCase() || 'UNKNOWN'} ON-SITE</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAcceptedTasks;

