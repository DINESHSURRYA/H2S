import React from 'react';
import styles from './VolunteerDashboard.module.css';
import { markAsReceived } from '../../services/apiService';

const MyAcceptedTasks = ({ requests, volunteerData, onUpdate, onEdit }) => {
  const volunteerId = volunteerData?._id || volunteerData?.id;

  const handleMarkReceived = async (grantId) => {
    try {
      await markAsReceived(grantId);
      alert('Items marked as received!');
      onUpdate?.();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  // This function is no longer used based on the provided diff,
  // as the "MARK AS RECEIVED" button is now always available for accepted tasks.
  // Keeping it commented out or removing it depends on the full context,
  // but the diff implies its removal from the rendering logic.
  // const isVolunteerAssigned = (req) => {
  //   return req.requiredVolunteers?.some(rv =>
  //       rv.assignedVolunteers?.some(v => (v._id || v) === volunteerId)
  //   );
  // };

  return (
    <div className={styles.section}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className={styles.sectionTitle}>MY ACTIVE MISSIONS</h2>
      </div>
      {requests.length === 0 ? (
        <p className={styles.placeholderText}>Not approved any requests yet...</p>
      ) : (
        <div className={styles.requestGrid}>
          {requests.map((req) => {
            const isAssigned = (req) => {
                return req.requiredVolunteers?.some(rv => 
                    rv.assignedVolunteers?.some(v => (v._id || v) === volunteerId)
                );
            };

            return (
              <div key={req._id} className={`${styles.requestCard} ${styles.verifiedLayer}`}>
                <div className={styles.cardHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <h3 style={{ margin: 0 }}>{req.publicUser?.name || 'Unknown Subject'}</h3>
                    <span className={styles.verifiedChip}>IN-PROGRESS</span>
                  </div>
                  <button 
                    onClick={() => onEdit(req)}
                    className={styles.editBtn}
                    style={{ background: '#4b5563', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    EDIT NEEDS
                  </button>
                </div>
                
                <span className={styles.metaCoords}>📍 {req.location?.latitude?.toFixed(4) || '—'} // {req.location?.longitude?.toFixed(4) || '—'}</span>
                <p className={styles.requestDesc} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{req.crisisDescription}</p>
                
                <div className={styles.productTags} style={{ marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>SUPPLY TRACKING:</h4>
                  {req.requirements?.map((p, idx) => (
                    <div key={idx} style={{ marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span className={styles.tag} style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                              {p.quantity} × {p.itemName?.toUpperCase() || 'UNSPECIFIED'}
                          </span>
                      </div>
                      {p.grantedList?.map((g, gi) => (
                          <div key={gi} style={{ marginLeft: '1.5rem', marginTop: '0.4rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
                               📦 {g.ngoId?.name || 'NGO'}: {g.quantityApproved}
                               {g.isReceived ? (
                                   <span className={styles.receivedLabel} style={{ marginLeft: '1rem', color: '#10b981', fontWeight: 'bold' }}>✓ RECEIVED</span>
                               ) : (
                                   isAssigned(req) ? (
                                       <button 
                                          className={styles.receivedBtn}
                                          onClick={() => handleMarkReceived(g._id || g)}
                                          style={{ marginLeft: '1rem', background: '#10b981', color: 'white', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
                                       >
                                           MARK RECEIVED
                                       </button>
                                   ) : (
                                       <span style={{ marginLeft: '1rem', color: '#64748b', fontSize: '0.7rem' }}>(Pending)</span>
                                   )
                               )}
                          </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className={styles.requestFooter} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '1.5rem', paddingTop: '1rem' }}>
                  <span className={styles.timestamp}>ASSIGNMENT TIMESTAMP: {new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAcceptedTasks;

