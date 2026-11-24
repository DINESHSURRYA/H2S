import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trackHelpRequest } from '../../services/apiService';
import MapPicker from '../../components/MapPicker/MapPicker';
import Button from '../../components/Button/Button';
import styles from './TrackRequest.module.css';

const STEPS = ['pending', 'validated', 'in-progress', 'resolved'];
const STEP_LABELS = {
  pending: 'SOS Received',
  validated: 'Field Validated',
  'in-progress': 'Relief Dispatched',
  resolved: 'Resolved',
};

const TrackRequest = () => {
  const { id: urlId } = useParams();
  const navigate = useNavigate();

  const [queryId, setQueryId] = useState(urlId || '');
  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracker = useCallback(async (targetId) => {
    const trimmed = targetId?.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const data = await trackHelpRequest(trimmed);
      setTracker(data);
    } catch (err) {
      setTracker(null);
      setError(err.message || 'Unable to locate crisis request.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (urlId) {
      setQueryId(urlId);
      fetchTracker(urlId);
    }
  }, [urlId, fetchTracker]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!queryId.trim()) return;
    navigate(`/track-request/${queryId.trim()}`);
    fetchTracker(queryId.trim());
  };

  const currentStepIndex = tracker ? STEPS.indexOf(tracker.status) : -1;

  return (
    <div className={styles.container}>
      <div className={styles.searchCard}>
        <h1 className={styles.title}>Track Crisis Request</h1>
        <p className={styles.subtitle}>
          Enter your 24-character Request ID to view live validation, NGO supply pledges, and delivery confirmation.
        </p>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Paste Request ID (e.g., 67e2...)"
            value={queryId}
            onChange={(e) => setQueryId(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Track Status'}
          </Button>
        </form>

        {error && <div className={styles.errorBanner}>{error}</div>}
      </div>

      {tracker && (
        <div className={styles.resultGrid}>
          {/* Status Timeline */}
          <div className={styles.cardFull}>
            <div className={styles.headerRow}>
              <div>
                <div className={styles.badges}>
                  <span className={styles.categoryChip}>{tracker.category}</span>
                  <span className={`${styles.urgencyChip} ${styles[`urgency_${tracker.urgency}`]}`}>
                    {tracker.urgency.toUpperCase()} URGENCY
                  </span>
                  <span className={styles.metaPill}>{tracker.affectedCount} affected</span>
                </div>
                <h2 className={styles.crisisTitle}>{tracker.crisisDescription}</h2>
                <p className={styles.metaText}>
                  Request ID: <span className={styles.mono}>{tracker.id}</span> • Reported by{' '}
                  <strong>{tracker.reporterName}</strong>
                  {tracker.validatedBy && <> • Validated by <strong>{tracker.validatedBy}</strong></>}
                </p>
              </div>
              <div className={styles.progressSummary}>
                <span className={styles.bigPct}>{tracker.fulfillment.grantedPercent}%</span>
                <span className={styles.pctLabel}>Supplies Pledged</span>
              </div>
            </div>

            <div className={styles.timeline}>
              {STEPS.map((step, idx) => {
                const isComplete = idx <= currentStepIndex;
                return (
                  <div key={step} className={`${styles.timelineStep} ${isComplete ? styles.stepDone : ''}`}>
                    <div className={styles.stepDot}>{isComplete ? '✓' : idx + 1}</div>
                    <span className={styles.stepLabel}>{STEP_LABELS[step]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supply Fulfillment Breakdown */}
          <div className={styles.card}>
            <h3 className={styles.cardHeading}>Requested Supplies &amp; NGO Allocations</h3>
            <div className={styles.reqList}>
              {tracker.requirements.map((item) => {
                const pct = item.quantity > 0 ? Math.min(100, Math.round((item.grantedQty / item.quantity) * 100)) : 0;
                return (
                  <div key={item.id} className={styles.reqBox}>
                    <div className={styles.reqTop}>
                      <strong>{item.itemName}</strong>
                      <span className={styles.mono}>
                        {item.grantedQty} / {item.quantity} pledged ({item.receivedQty} delivered)
                      </span>
                    </div>
                    <p className={styles.reqDesc}>{item.description}</p>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressFill} style={{ width: `${pct}%` }} />
                    </div>
                    {item.grants.length > 0 ? (
                      <div className={styles.grantList}>
                        {item.grants.map((g) => (
                          <div key={g.id} className={styles.grantRow}>
                            <span>🏢 {g.ngoName} — {g.quantityApproved} units</span>
                            <span className={g.isReceived ? styles.deliveredTag : styles.pendingTag}>
                              {g.isReceived ? '✓ Delivered' : g.status === 'fulfilled' ? 'Dispatched' : 'Pledged'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.noGrants}>Awaiting NGO allocation...</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location & Manpower */}
          <div className={styles.card}>
            <h3 className={styles.cardHeading}>Crisis Zone &amp; Field Team</h3>
            <p className={styles.coordsText}>
              📍 Coordinates: {tracker.location?.latitude?.toFixed(4)}, {tracker.location?.longitude?.toFixed(4)}
            </p>
            {tracker.location && <MapPicker initialLocation={tracker.location} readOnly />}

            {tracker.requiredVolunteers?.length > 0 && (
              <div className={styles.rolesBox}>
                <h4 className={styles.rolesTitle}>Assigned Field Personnel</h4>
                {tracker.requiredVolunteers.map((rv) => (
                  <div key={rv.id} className={styles.roleRow}>
                    <span>{rv.role}</span>
                    <span className={styles.mono}>
                      {rv.assignedCount} / {rv.count} deployed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackRequest;
