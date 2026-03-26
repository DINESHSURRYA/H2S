import React, { useState, useEffect } from 'react';
import { getMissions, grantHelp, toggleLock } from '../../services/apiService';
import styles from './NgoDashboard.module.css';

const NgoMissions = ({ filterMode }) => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [grantAmounts, setGrantAmounts] = useState({}); // { requirementId: amount }

  const ngoDataStr = localStorage.getItem('ngoData');
  const ngo = ngoDataStr ? JSON.parse(ngoDataStr) : null;

  useEffect(() => {
    fetchMissions();
    const interval = setInterval(fetchMissions, 8000); // Poll every 8s
    return () => clearInterval(interval);
  }, []);

  const fetchMissions = async () => {
    try {
      const data = await getMissions();
      setMissions(data);
      // If modal is open, update the selected mission with fresh data
      if (selectedMission) {
          const fresh = data.find(m => m._id === selectedMission._id);
          if (fresh) setSelectedMission(fresh);
      }
    } catch (err) {
      console.error('Failed to sync missions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenContribute = async (mission) => {
    if (mission.isLocked && mission.lockedByNGO !== ngo.id) {
        alert('LOCKED BY ANOTHER NGO');
        return;
    }

    try {
        await toggleLock(mission._id, true, ngo.id);
        // Refresh everything to ensure sync
        const data = await getMissions();
        setMissions(data);
        const fresh = data.find(m => m._id === mission._id);
        setSelectedMission(fresh);

        // Reset grant amounts
        const initialAmounts = {};
        mission.requirements.forEach(req => initialAmounts[req._id] = '');
        setGrantAmounts(initialAmounts);
    } catch (err) {
        alert('Failed to lock mission unit.');
    }
  };

  const handleCloseContribute = async () => {
    if (selectedMission) {
        try {
            await toggleLock(selectedMission._id, false, ngo.id);
            const data = await getMissions();
            setMissions(data);
            setSelectedMission(null);
        } catch (err) {
            console.error('Failed to release lock', err);
            setSelectedMission(null);
        }
    }
  };

  const handleGrant = async (requirementId) => {
    const amount = grantAmounts[requirementId];
    if (!amount || Number(amount) <= 0) {
      alert('Specify VALID quantity');
      return;
    }

    try {
      await grantHelp({
        quantityApproved: Number(amount),
        ngoId: ngo.id,
        requirementId: requirementId,
        helpRequestId: selectedMission._id
      });
      alert('RESOURCES ALLOCATED');
      await fetchMissions();
    } catch (err) {
      alert('GRANT_FAILED: ' + err.message);
    }
  };

  // Filter based on verified vs field status
  const displayMissions = filterMode === 'verified' 
    ? missions.filter(m => m.status === 'validated' || m.status === 'in-progress')
    : missions.filter(m => m.status === 'pending');

  if (loading && missions.length === 0) return <div className={styles.placeholderText}>Initializing Mission Stream...</div>;

  return (
    <div className={styles.bentoItem} style={{ gridColumn: 'span 12', background: 'none', border: 'none', boxShadow: 'none', padding: 0 }}>
      <div className={styles.missionsGrid}>
        {displayMissions.length > 0 ? (
          displayMissions.map((mission) => (
            <div 
              key={mission._id} 
              className={`${styles.bentoItem} ${mission.status === 'validated' || mission.status === 'in-progress' ? styles.verifiedLayer : styles.publicLayer}`}
              style={{ borderLeft: mission.isLocked ? '4px solid #ef4444' : (mission.status === 'validated' ? '4px solid #22c55e' : '4px solid #3b82f6') }}
            >
              <div className={styles.cardTop}>
                <span className={styles.urgencyChip} style={{ color: mission.status === 'validated' ? '#22c55e' : '#3b82f6' }}>
                  {mission.status?.toUpperCase()}
                </span>
                <span className={styles.timestamp}>
                  {new Date(mission.createdAt).toLocaleTimeString()}
                </span>
              </div>

              <h3 className={styles.missionTitle} style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{mission.crisisDescription}</h3>
              
              <div className={styles.metaInfo} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.75rem' }}>
                <span className={styles.metaCoords}>📍 {mission.location?.latitude?.toFixed(2)} / {mission.location?.longitude?.toFixed(2)}</span>
                <span style={{ color: '#fbbf24' }}>🔥 {mission.hype?.reduce((acc, h) => acc + h.points, 0) || 0}</span>
              </div>

              <button 
                className={styles.actionBtn} 
                onClick={() => handleOpenContribute(mission)}
                disabled={mission.isLocked && mission.lockedByNGO !== ngo.id}
                style={{ 
                    padding: '0.4rem 0.8rem', 
                    fontSize: '0.7rem', 
                    background: mission.isLocked && mission.lockedByNGO !== ngo.id ? '#1e293b' : '#3b82f6',
                    cursor: mission.isLocked && mission.lockedByNGO !== ngo.id ? 'not-allowed' : 'pointer'
                }}
              >
                {mission.isLocked && mission.lockedByNGO !== ngo.id ? 'LOCKED // OTHER NGO' : 'CONCENTRATE SUPPORT'}
              </button>
            </div>
          ))
        ) : (
          <div className={styles.bentoItem} style={{ gridColumn: 'span 12', textAlign: 'center', padding: '4rem' }}>
            <p className={styles.placeholderText}>No intelligence currently matches this frequency filter.</p>
          </div>
        )}
      </div>

      {/* Modal Integration */}
      {selectedMission && (
          <div className={styles.modalOverlay} onClick={handleCloseContribute}>
              <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ border: '2px solid #3b82f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                      <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#3b82f6' }}>DETAILED OPERATIONAL ASPECT</h2>
                      <button onClick={handleCloseContribute} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.25rem', cursor: 'pointer' }}>×</button>
                  </div>

                  <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: '1.5' }}>
                      <p><strong>INTEL_SOURCE:</strong> {selectedMission.publicUser?.name}</p>
                      <p><strong>OBJECTIVE:</strong> {selectedMission.crisisDescription}</p>
                      <p><strong>VALIDATOR:</strong> <span style={{ color: '#22c55e' }}>{selectedMission.approvedBy?.name || 'FIELD_PENDING'}</span></p>
                  </div>

                  <h3 style={{ fontSize: '0.85rem', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px' }}>Resource Requirements</h3>
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {selectedMission.requirements.map((req) => (
                          <div key={req._id} style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                  <span style={{ color: '#f8fafc' }}>{req.itemName?.toUpperCase()}</span>
                                  <span style={{ color: '#3b82f6' }}>Req: {req.quantity}</span>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                  <input 
                                      type="number" 
                                      placeholder="Qty" 
                                      style={{ width: '80px', background: '#000', border: '1px solid #333', color: 'white', padding: '0.3rem', borderRadius: '4px', fontSize: '0.75rem' }}
                                      value={grantAmounts[req._id] || ''}
                                      onChange={(e) => setGrantAmounts({...grantAmounts, [req._id]: e.target.value})}
                                  />
                                  <button 
                                      onClick={() => handleGrant(req._id)}
                                      style={{ flex: 1, background: '#22c55e', color: 'white', border: 'none', padding: '0.3rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}
                                  >
                                      ALLOCATE
                                  </button>
                              </div>
                          </div>
                      ))}
                  </div>

                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={handleCloseContribute} className={styles.closeBtn}>
                          RELEASE SECTOR & EXIT
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default NgoMissions;



