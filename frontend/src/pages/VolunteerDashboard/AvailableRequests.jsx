import React from 'react';
import styles from './VolunteerDashboard.module.css';
import Button from '../../components/Button/Button';

const AvailableRequests = ({ requests, onApprove, onHype, loadingAction }) => {
  return (
    <div className={styles.bentoItem} style={{ gridColumn: 'span 12' }}>
      {requests.length === 0 ? (
        <p className={styles.placeholderText}>No Requests available</p>
      ) : (
        <div className={styles.requestList}>
          {requests.map((req) => (
            <div 
              key={req._id} 
              className={`${styles.requestItem} ${req.approvedBy ? styles.verifiedLayer : styles.publicLayer} ${req.urgency === 'high' ? styles.warningPulse : ''}`}
            >
              <div className={styles.requestHeader}>
                <span className={styles.requestName}>
                  {req.publicUser?.name || 'Unknown Source'}
                  {req.approvedBy ? (
                    <span className={styles.verifiedChip} style={{ marginLeft: '1rem' }}>VALIDATED // VOL-APPROVED</span>
                  ) : (
                    <span className={styles.verifiedChip} style={{ marginLeft: '1rem', background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b' }}>PENDING VALIDATION // PUBLIC-SOURCED</span>
                  )}
                </span>
                <span className={styles.metaCoords}>📍 {req.location?.latitude?.toFixed(4) || '—'} // {req.location?.longitude?.toFixed(4) || '—'}</span>
              </div>
              <p className={styles.requestDesc} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{req.crisisDescription}</p>
              
              <div className={styles.metaInfo} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                      🔥 HYPE: {req.hype?.reduce((acc, h) => acc + h.points, 0) || 0}
                  </span>
                  <button 
                    onClick={() => onHype(req._id)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer' }}
                  >
                      + HYPE
                  </button>
              </div>

              <div className={styles.productTags} style={{ marginTop: '1rem' }}>
                {req.requirements?.map((p, idx) => (
                  <span key={idx} className={styles.tag} style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                    {p.quantity} × {p.itemName?.toUpperCase() || 'UNSPECIFIED'}
                  </span>
                ))}
              </div>
              <div className={styles.requestFooter} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '1.5rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={styles.timestamp}>REPORT RECEIVED: {new Date(req.createdAt).toLocaleTimeString()}</span>
                <Button 
                  onClick={() => onApprove(req._id)} 
                  disabled={loadingAction}
                  style={{ background: 'var(--accent-color)', color: 'white', fontWeight: '800', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem' }}
                >
                  {loadingAction ? '...' : 'VALIDATE & APPROVE'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableRequests;


