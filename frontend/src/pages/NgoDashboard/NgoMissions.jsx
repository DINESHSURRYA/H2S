import React, { useState, useEffect } from 'react';
import {
  getApprovedRequests,
  grantHelp,
  getNgoGrants
} from '../../services/apiService';
import styles from './NgoMissions.module.css';

const NgoMissions = ({ filterMode }) => {
  const [missions, setMissions] = useState([]);
  const [myGrants, setMyGrants] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [grantAmounts, setGrantAmounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);

  const ngoData = JSON.parse(localStorage.getItem('ngoData'));
  const ngoId = ngoData?._id || ngoData?.id;

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchMissions(), fetchMyGrants()]);
    setLoading(false);
  };

  const fetchMissions = async () => {
    try {
      const data = await getApprovedRequests();
      setMissions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyGrants = async () => {
    try {
      const data = await getNgoGrants(ngoId);
      setMyGrants(data);
    } catch (err) {
      console.error(err);
    }
  };

  const getRemaining = (req) => {
    const total = req.grantedList?.reduce((s, g) => s + g.quantityApproved, 0) || 0;
    return Math.max(0, req.quantity - total);
  };

  const openMission = (mission) => {
    setSelectedMission(mission);
    const init = {};
    mission.requirements.forEach(r => init[r._id] = '');
    setGrantAmounts(init);
  };

  const closeMission = () => {
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

      setSelectedMission(null);
      fetchAll();

    } catch (error) {
      alert(error.response?.data?.message || 'Failed to allocate');
    } finally {
      setAllocating(false);
    }
  };

  const isFullySatisfied = (mission) => {
    return mission.requirements.every(req => getRemaining(req) <= 0);
  };

  const availableMissions = missions.filter(m => !isFullySatisfied(m));

  if (loading) return <div className={styles.center}>Loading...</div>;

  return (
    <div className={styles.container}>

      {filterMode === 'verified' && (
        <div className={styles.grid}>
          {availableMissions.length > 0 ? (
            availableMissions.map(m => (
              <div key={m._id} className={styles.card}>
                <h3>{m.crisisDescription}</h3>
                <p className={styles.meta}>
                  🔥 {m.hype?.reduce((a, h) => a + h.points, 0) || 0}
                </p>
                <button onClick={() => openMission(m)}>
                  Contribute
                </button>
              </div>
            ))
          ) : (
            <p>No available requests requiring help.</p>
          )}
        </div>
      )}

      {filterMode === 'field' && (
        <div className={styles.grid}>
          {myGrants.length > 0 ? (
            // Grouping myGrants by helpRequestId
            Array.from(new Set(myGrants.map(g => g.helpRequestId?._id))).map(reqId => {
              const mission = myGrants.find(G => G.helpRequestId?._id === reqId)?.helpRequestId;
              if (!mission) return null;
              const myContribs = myGrants.filter(G => G.helpRequestId?._id === reqId);

              return (
                <div key={reqId} className={styles.card}>
                  <h3>{mission.crisisDescription}</h3>
                  <div className={styles.myContribs}>
                    {myContribs.map((c, idx) => (
                      <div key={idx} className={styles.contribLine}>
                        ✅ {c.quantityApproved} units for {mission.requirements.find(r => r._id === c.requirementId)?.itemName || 'Item'}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <p>You haven't contributed to any missions yet.</p>
          )}
        </div>
      )}

      {/* MODAL */}
      {selectedMission && (
        <div className={styles.modal} onClick={closeMission}>
          <div className={styles.modalBox} onClick={e => e.stopPropagation()}>

            <h3>{selectedMission.crisisDescription}</h3>

            {selectedMission.requirements.map(req => {
              const remaining = getRemaining(req);
              const isFulfilled = remaining <= 0;

              return (
                <div key={req._id} className={styles.req}>
                  <div className={styles.reqTop}>
                    <span>{req.itemName}</span>
                    <span>{remaining} / {req.quantity}</span>
                  </div>

                  <div className={styles.contrib}>
                    {req.grantedList?.map((g, i) => (
                      <div key={i}>
                        {g.ngoId?.name || 'NGO'}: {g.quantityApproved}
                      </div>
                    ))}
                  </div>

                  {!isFulfilled ? (
                    <div className={styles.row}>
                      <input
                        type="number"
                        placeholder="Qty"
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
                  ) : (
                    <div className={styles.fulfilledLabel}>Fully Satisfied</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default NgoMissions;