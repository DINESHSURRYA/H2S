import React, { useState, useEffect } from 'react';
import { getMissions, grantHelp } from '../../services/apiService';
import styles from './NgoDashboard.module.css';

const NgoMissions = ({ filterMode }) => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grantingId, setGrantingId] = useState(null);
  const [grantAmounts, setGrantAmounts] = useState({}); // { requirementId: amount }

  const ngoDataStr = localStorage.getItem('ngoData');
  const ngo = ngoDataStr ? JSON.parse(ngoDataStr) : null;

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const data = await getMissions();
      setMissions(data);
    } catch (err) {
      console.error('Failed to fetch missions', err);
      setError('Failed to synchronize mission data. Check network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  const handleGrant = async (missionId, requirementId) => {
    const amount = grantAmounts[requirementId];
    if (!amount || amount <= 0) {
      alert('Please specify a valid quantity to grant.');
      return;
    }

    try {
      await grantHelp({
        quantityApproved: Number(amount),
        ngoId: ngo.id,
        requirementId: requirementId,
        helpRequestId: missionId
      });
      alert('Help granted successfully!');
      fetchMissions(); // Refresh to show updated progress?
    } catch (err) {
      alert('Failed to grant help: ' + err.message);
    }
  };

  // Switcher sync: 'verified' (Volunteer-Led/Approved) vs 'field' (Public/Pending)
  const displayMissions = filterMode === 'verified' 
    ? missions.filter(m => m.approvedBy)
    : missions.filter(m => !m.approvedBy);

  if (loading) return <div className={styles.placeholderText}>Synchronizing mission data...</div>;
  if (error) return <div className={styles.placeholderText}>{error}</div>;

  return (
    <div className={styles.bentoItem} style={{ gridColumn: 'span 12', background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}>
      <div className={styles.missionsGrid}>
        {displayMissions.length > 0 ? (
          displayMissions.map((mission) => (
            <div 
              key={mission._id} 
              className={`${styles.bentoItem} ${mission.approvedBy ? styles.verifiedLayer : styles.publicLayer} ${mission.urgency === 'high' && !mission.approvedBy ? styles.warningPulse : ''}`}
            >
              <div className={styles.cardTop}>
                <span className={`${styles.urgencyChip} ${styles[mission.urgency || 'medium']}`}>
                  {mission.urgency?.toUpperCase() || 'MEDIUM'} PRIORITY
                </span>
                <span className={styles.timestamp}>
                  SEC-LOG: {new Date(mission.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <h3 className={styles.missionTitle} style={{ fontSize: '1.25rem', fontWeight: '800', margin: '1rem 0', color: 'var(--text-primary)' }}>
                {mission.crisisDescription}
              </h3>
              
              <div className={styles.metaInfo} style={{ marginBottom: '1.5rem' }}>
                <span className={styles.metaCoords}>📍 {mission.location?.latitude?.toFixed(4) || '—'} // {mission.location?.longitude?.toFixed(4) || '—'}</span>
                <span className={styles.timestamp} style={{ color: 'var(--accent-color)' }}>
                  [{mission.approvedBy ? 'VOL-VALIDATED' : 'PUBLIC-UNVERIFIED'}]
                </span>
              </div>

              <div className={styles.requirementsList} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                {mission.requirements.map((req, idx) => (
                  <div key={idx} className={styles.requirementItem} style={{ marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span className={styles.label} style={{ color: 'var(--text-primary)' }}>{req.itemName?.toUpperCase() || 'UNSPECIFIED'}</span>
                      <span className={styles.value} style={{ color: 'var(--accent-color)' }}>Total: {req.quantity}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <input 
                            type="number" 
                            placeholder="Qty" 
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '4px', padding: '0.2rem 0.5rem', width: '60px' }}
                            value={grantAmounts[req._id] || ''}
                            onChange={(e) => setGrantAmounts({...grantAmounts, [req._id]: e.target.value})}
                        />
                        <button 
                            className={styles.grantBtn} 
                            style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}
                            onClick={() => handleGrant(mission._id, req._id)}
                        >
                            GRANT PARTIAL
                        </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.cardFooter} style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontSize: '0.7rem', opacity: 0.6 }}>CONTRIBUTIONS TRACKED VIA GRANTEDHELP LOGS</p>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.bentoItem} style={{ gridColumn: 'span 12', textAlign: 'center', padding: '4rem' }}>
            <p className={styles.placeholderText}>Zero active signals in this frequency.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NgoMissions;

