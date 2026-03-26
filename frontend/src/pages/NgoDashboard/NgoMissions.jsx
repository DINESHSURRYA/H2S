import React, { useState, useEffect } from 'react';
import {
  getApprovedRequests,
  grantHelp,
  toggleLock
} from '../../services/apiService';
import styles from './NgoMissions.module.css';

const NgoMissions = () => {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [grantAmounts, setGrantAmounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);

  const ngoData = JSON.parse(localStorage.getItem('ngoData'));
  const ngoId = ngoData?._id || ngoData?.id;

  useEffect(() => {
    fetchMissions();
    const i = setInterval(fetchMissions, 8000);
    return () => clearInterval(i);
  }, []);

  const fetchMissions = async () => {
    try {
      const data = await getApprovedRequests();
      setMissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRemaining = (req) => {
    const total = req.grantedList?.reduce((s, g) => s + g.quantityApproved, 0) || 0;
    return Math.max(0, req.quantity - total);
  };

  const openMission = async (mission) => {
    if (mission.isLocked && mission.lockedByNGO !== ngoId) {
      alert('Locked by another NGO');
      return;
    }

    await toggleLock(mission._id, true, ngoId);
    setSelectedMission(mission);

    const init = {};
    mission.requirements.forEach(r => init[r._id] = '');
    setGrantAmounts(init);
  };

  const closeMission = async () => {
    await toggleLock(selectedMission._id, false, ngoId);
    setSelectedMission(null);
  };

  const handleGrant = async (reqId) => {
    if (allocating) return;

    const amt = grantAmounts[reqId];
    if (!amt || amt <= 0) return alert('Invalid amount');

    const req = selectedMission.requirements.find(r => r._id === reqId);
    if (amt > getRemaining(req)) return alert('Exceeds requirement');

    try {
      setAllocating(true);

      await grantHelp({
        quantityApproved: amt,
        ngoId,
        requirementId: reqId,
        helpRequestId: selectedMission._id
      });

      await toggleLock(selectedMission._id, false, ngoId);
      setSelectedMission(null);
      fetchMissions();

    } catch {
      alert('Failed');
    } finally {
      setAllocating(false);
    }
  };

  if (loading) return <div className={styles.center}>Loading...</div>;

  return (
    <div className={styles.container}>

      <h2>Mission Stream</h2>

      <div className={styles.grid}>
        {missions.map(m => (
          <div key={m._id} className={styles.card}>
            <h3>{m.crisisDescription}</h3>

            <p className={styles.meta}>
              🔥 {m.hype?.reduce((a, h) => a + h.points, 0) || 0}
            </p>

            <button onClick={() => openMission(m)}>
              {m.isLocked ? 'Locked' : 'Contribute'}
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedMission && (
        <div className={styles.modal} onClick={closeMission}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>

            <h3>{selectedMission.crisisDescription}</h3>

            {selectedMission.requirements.map(req => (
              <div key={req._id} className={styles.req}>

                <div className={styles.reqTop}>
                  <span>{req.itemName}</span>
                  <span>{getRemaining(req)} / {req.quantity}</span>
                </div>

                <div className={styles.contrib}>
                  {req.grantedList?.map((g, i) => (
                    <div key={i}>
                      {g.ngoId?.name || 'NGO'}: {g.quantityApproved}
                    </div>
                  ))}
                </div>

                <div className={styles.row}>
                  <input
                    type="number"
                    value={grantAmounts[req._id] || ''}
                    onChange={(e) =>
                      setGrantAmounts({
                        ...grantAmounts,
                        [req._id]: Number(e.target.value)
                      })
                    }
                  />

                  <button onClick={() => handleGrant(req._id)}>
                    Allocate
                  </button>
                </div>

              </div>
            ))}

          </div>
        </div>
      )}

    </div>
  );
};

export default NgoMissions;