import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getApprovedRequests,
  grantHelp,
  getNgoGrants,
  updateGrantStatus,
} from '../../services/apiService';
import styles from './NgoMissions.module.css';

const URGENCY_RANK = { critical: 4, high: 3, medium: 2, low: 1 };

const NgoMissions = ({ filterMode, onAllocationChange }) => {
  const [missions, setMissions] = useState([]);
  const [myGrants, setMyGrants] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [grantAmounts, setGrantAmounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const ngoData = JSON.parse(localStorage.getItem('ngoData') || '{}');
  const ngoId = ngoData?._id || ngoData?.id;

  const notify = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [missionsData, grantsData] = await Promise.all([
        getApprovedRequests(),
        ngoId ? getNgoGrants(ngoId) : Promise.resolve([]),
      ]);
      setMissions(missionsData || []);
      setMyGrants(grantsData || []);
    } catch (err) {
      console.error('Failed to load NGO missions:', err);
    } finally {
      setLoading(false);
    }
  }, [ngoId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const getRemaining = (reqItem) => {
    const activeGrants = (reqItem.grantedList || []).filter((g) => g && g.status !== 'cancelled');
    const total = activeGrants.reduce((s, g) => s + (Number(g.quantityApproved) || 0), 0);
    return Math.max(0, (Number(reqItem.quantity) || 0) - total);
  };

  const getFulfillmentPct = (mission) => {
    const totalReq = (mission.requirements || []).reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
    if (totalReq === 0) return 0;
    const totalRem = (mission.requirements || []).reduce((sum, r) => sum + getRemaining(r), 0);
    return Math.min(100, Math.round(((totalReq - totalRem) / totalReq) * 100));
  };

  const openMission = (mission) => {
    setSelectedMission(mission);
    const init = {};
    (mission.requirements || []).forEach((r) => {
      init[r._id] = getRemaining(r) || '';
    });
    setGrantAmounts(init);
  };

  const closeMission = () => {
    setSelectedMission(null);
  };

  const handleGrant = async (reqId) => {
    if (allocating) return;

    const amt = Number(grantAmounts[reqId]);
    if (!amt || amt <= 0) {
      notify('error', 'Please enter a valid positive supply quantity.');
      return;
    }

    const reqItem = selectedMission.requirements.find((r) => r._id === reqId);
    if (amt > getRemaining(reqItem)) {
      notify('error', `Quantity exceeds remaining need (${getRemaining(reqItem)} left).`);
      return;
    }

    try {
      setAllocating(true);
      await grantHelp({
        quantityApproved: amt,
        ngoId,
        requirementId: reqId,
        helpRequestId: selectedMission._id,
      });

      notify('success', `Allocated ${amt} × ${reqItem.itemName} (+15 Trust XP)!`);
      setSelectedMission(null);
      await fetchAll();
      onAllocationChange?.();
    } catch (error) {
      notify('error', error?.data?.message || error.message || 'Failed to allocate supplies.');
    } finally {
      setAllocating(false);
    }
  };

  const handleMarkDispatched = async (grantId) => {
    try {
      await updateGrantStatus(grantId, 'fulfilled');
      notify('success', 'Grant marked as dispatched to the field.');
      await fetchAll();
    } catch (error) {
      notify('error', error?.data?.message || error.message || 'Failed to update dispatch status.');
    }
  };

  const isFullySatisfied = (mission) =>
    mission.status === 'resolved' ||
    (mission.requirements || []).every((reqItem) => getRemaining(reqItem) <= 0);

  const availableMissions = missions
    .filter((m) => !isFullySatisfied(m))
    .filter((m) => {
      if (categoryFilter !== 'ALL' && (m.category || 'Other') !== categoryFilter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        m.crisisDescription?.toLowerCase().includes(q) ||
        (m.category || '').toLowerCase().includes(q) ||
        m.requirements?.some((r) => r.itemName?.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      const urgDiff = (URGENCY_RANK[b.urgency] || 2) - (URGENCY_RANK[a.urgency] || 2);
      if (urgDiff !== 0) return urgDiff;
      const hypeA = a.hype?.reduce((acc, h) => acc + (h.points || 0), 0) || 0;
      const hypeB = b.hype?.reduce((acc, h) => acc + (h.points || 0), 0) || 0;
      return hypeB - hypeA;
    });

  if (loading) return <div className={styles.center}>Loading crisis operations...</div>;

  return (
    <div className={styles.container}>
      {feedback.text && (
        <div className={feedback.type === 'error' ? styles.errorToast : styles.successToast}>
          {feedback.text}
        </div>
      )}

      {filterMode === 'verified' && (
        <>
          <div className={styles.filterBar}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search missions or supply items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className={styles.filterSelect}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              <option value="Food & Water">Food &amp; Water</option>
              <option value="Medical">Medical</option>
              <option value="Rescue">Rescue</option>
              <option value="Shelter">Shelter</option>
              <option value="Logistics">Logistics</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className={styles.grid}>
            {availableMissions.length > 0 ? (
              availableMissions.map((m) => {
                const hypeTotal = m.hype?.reduce((a, h) => a + (h.points || 0), 0) || 0;
                const pct = getFulfillmentPct(m);

                return (
                  <div key={m._id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <span className={styles.categoryChip}>{m.category || 'Other'}</span>
                      <span className={`${styles.urgencyChip} ${styles[`urgency_${m.urgency || 'medium'}`]}`}>
                        {(m.urgency || 'medium').toUpperCase()}
                      </span>
                    </div>

                    <h3 className={styles.cardTitle}>{m.crisisDescription}</h3>

                    <div className={styles.metaLine}>
                      <span>🔥 Priority: {hypeTotal}</span>
                      <span>👥 {m.affectedCount || 1} affected</span>
                    </div>

                    <p className={styles.coords}>
                      📍 {m.location?.latitude?.toFixed(4)}, {m.location?.longitude?.toFixed(4)}
                    </p>

                    <div className={styles.progressWrap}>
                      <div className={styles.progressLabels}>
                        <span>Supplies Funded</span>
                        <span>{pct}%</span>
                      </div>
                      <div className={styles.progressTrack}>
                        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <button type="button" className={styles.primaryBtn} onClick={() => openMission(m)}>
                        Allocate Supplies
                      </button>
                      <Link to={`/track-request/${m._id}`} className={styles.trackLink}>
                        Track
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className={styles.emptyState}>No validated crisis requests currently need supplies.</p>
            )}
          </div>
        </>
      )}

      {filterMode === 'field' && (
        <div className={styles.grid}>
          {myGrants.length > 0 ? (
            Array.from(new Set(myGrants.map((g) => g.helpRequestId?._id).filter(Boolean))).map((reqId) => {
              const mission = myGrants.find((g) => g.helpRequestId?._id === reqId)?.helpRequestId;
              if (!mission) return null;
              const myContribs = myGrants.filter((g) => g.helpRequestId?._id === reqId);

              return (
                <div key={reqId} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.categoryChip}>{mission.category || 'Relief'}</span>
                    <span className={styles.statusPill}>{(mission.status || 'in-progress').toUpperCase()}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{mission.crisisDescription}</h3>
                  <div className={styles.myContribs}>
                    {myContribs.map((c) => {
                      const matchedItem = mission.requirements?.find(
                        (r) => r._id?.toString() === c.requirementId?.toString()
                      );
                      return (
                        <div key={c._id} className={styles.contribLine}>
                          <div>
                            <strong>{c.quantityApproved} × {matchedItem?.itemName || 'Supply Item'}</strong>
                            <div className={styles.contribStatus}>
                              {c.isReceived
                                ? '✓ Received & Confirmed by Field Team'
                                : c.status === 'fulfilled'
                                ? '🚚 Dispatched — Awaiting Field Confirmation'
                                : '📦 Pledged — Preparing Dispatch'}
                            </div>
                          </div>
                          {!c.isReceived && c.status === 'pending' && (
                            <button
                              type="button"
                              className={styles.dispatchBtn}
                              onClick={() => handleMarkDispatched(c._id)}
                            >
                              Mark Dispatched
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Link to={`/track-request/${mission._id}`} className={styles.trackLinkFull}>
                    Open Mission Tracker
                  </Link>
                </div>
              );
            })
          ) : (
            <p className={styles.emptyState}>You haven't pledged supplies to any crisis missions yet.</p>
          )}
        </div>
      )}

      {/* Allocation Modal */}
      {selectedMission && (
        <div className={styles.modal} onClick={closeMission}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.categoryChip}>{selectedMission.category || 'Crisis'}</span>
                <h3 className={styles.modalTitle}>{selectedMission.crisisDescription}</h3>
              </div>
              <button type="button" className={styles.closeBtn} onClick={closeMission}>
                ✕
              </button>
            </div>

            {selectedMission.requirements.map((reqItem) => {
              const remaining = getRemaining(reqItem);
              const isFulfilled = remaining <= 0;

              return (
                <div key={reqItem._id} className={styles.req}>
                  <div className={styles.reqTop}>
                    <strong>{reqItem.itemName}</strong>
                    <span className={styles.qtyBadge}>
                      {remaining} left of {reqItem.quantity}
                    </span>
                  </div>
                  <p className={styles.reqDesc}>{reqItem.description}</p>

                  {reqItem.grantedList?.length > 0 && (
                    <div className={styles.contrib}>
                      {reqItem.grantedList.map((g, i) => (
                        <div key={g._id || i}>
                          🏢 {g.ngoId?.name || 'NGO'}: {g.quantityApproved} units{' '}
                          {g.isReceived ? '(Received ✓)' : ''}
                        </div>
                      ))}
                    </div>
                  )}

                  {!isFulfilled ? (
                    <div className={styles.row}>
                      <input
                        type="number"
                        min={1}
                        max={remaining}
                        placeholder={`Max ${remaining}`}
                        value={grantAmounts[reqItem._id] ?? ''}
                        onChange={(e) =>
                          setGrantAmounts({
                            ...grantAmounts,
                            [reqItem._id]: e.target.value,
                          })
                        }
                      />
                      <button
                        type="button"
                        disabled={allocating}
                        onClick={() => handleGrant(reqItem._id)}
                      >
                        {allocating ? 'Allocating...' : 'Allocate'}
                      </button>
                    </div>
                  ) : (
                    <div className={styles.fulfilledLabel}>✓ Requirement Fully Funded</div>
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
