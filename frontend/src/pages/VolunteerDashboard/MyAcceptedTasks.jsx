import React from 'react';
import { Link } from 'react-router-dom';
import styles from './VolunteerDashboard.module.css';
import { markAsReceived, resolveHelpRequest } from '../../services/apiService';

const MyAcceptedTasks = ({ requests, volunteerData, onUpdate, onEdit, onToast }) => {
  const volunteerId = volunteerData?._id || volunteerData?.id;

  const handleMarkReceived = async (grantId) => {
    try {
      const res = await markAsReceived(grantId);
      onToast?.(res.message || 'Supply delivery confirmed!');
      onUpdate?.();
    } catch (err) {
      onToast?.(err.message || 'Failed to confirm delivery.');
    }
  };

  const handleResolve = async (requestId) => {
    try {
      const res = await resolveHelpRequest(requestId, volunteerId);
      onToast?.(res.message || 'Mission marked as resolved (+20 Trust XP)!');
      onUpdate?.();
    } catch (err) {
      onToast?.(err.message || 'Failed to resolve mission.');
    }
  };

  const canConfirmDelivery = (req) => {
    const approverId = req.approvedBy?._id || req.approvedBy;
    const creatorId = req.volunteer?._id || req.volunteer;
    if (approverId === volunteerId || creatorId === volunteerId) return true;
    return req.requiredVolunteers?.some((rv) =>
      rv.assignedVolunteers?.some((v) => (v?._id || v) === volunteerId)
    );
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>My Active &amp; Validated Missions</h2>
      {requests.length === 0 ? (
        <p className={styles.placeholderText}>
          You haven't validated, raised, or joined any missions yet. Validate a request in the SOS Queue or raise a field report!
        </p>
      ) : (
        <div className={styles.requestGrid}>
          {requests.map((req) => {
            const eligible = canConfirmDelivery(req);
            const isResolved = req.status === 'resolved';

            return (
              <div key={req._id} className={`${styles.requestCard} ${styles.verifiedLayer}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.headerMeta}>
                    <h3 className={styles.requestName}>
                      {req.publicUser?.name || req.volunteer?.name || 'Field Mission'}
                    </h3>
                    <span className={isResolved ? styles.resolvedChip : styles.verifiedChip}>
                      {(req.status || 'validated').toUpperCase()}
                    </span>
                    <span className={`${styles.urgencyChip} ${styles[`urgency_${req.urgency || 'medium'}`]}`}>
                      {(req.urgency || 'medium').toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.headerActions}>
                    <Link to={`/track-request/${req._id}`} className={styles.trackLink}>
                      Tracker
                    </Link>
                    {!isResolved && (
                      <button type="button" onClick={() => onEdit(req)} className={styles.editBtn}>
                        Edit Needs
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.metaRow}>
                  <span className={styles.categoryTag}>{req.category || 'Other'}</span>
                  <span className={styles.metaCoords}>
                    📍 {req.location?.latitude?.toFixed(4) || '—'}, {req.location?.longitude?.toFixed(4) || '—'}
                  </span>
                  <span className={styles.metaCoords}>👥 {req.affectedCount || 1} affected</span>
                </div>

                <p className={styles.requestDesc}>{req.crisisDescription}</p>

                <div className={styles.subSection}>
                  <h4 className={styles.subHeading}>Supply Allocation &amp; Delivery Tracking</h4>
                  {req.requirements?.map((p, idx) => (
                    <div key={p._id || idx} className={styles.supplyBlock}>
                      <span className={styles.supplyTag}>
                        {p.quantity} × {p.itemName}
                      </span>
                      {p.grantedList?.length > 0 ? (
                        p.grantedList.map((g, gi) => (
                          <div key={g._id || gi} className={styles.grantLine}>
                            <span>
                              📦 {g.ngoId?.name || 'Verified NGO'}: <strong>{g.quantityApproved} units</strong>
                            </span>
                            {g.isReceived ? (
                              <span className={styles.receivedLabel}>✓ RECEIVED</span>
                            ) : eligible ? (
                              <button
                                type="button"
                                className={styles.receivedBtn}
                                onClick={() => handleMarkReceived(g._id || g)}
                              >
                                Confirm Delivery
                              </button>
                            ) : (
                              <span className={styles.pendingNote}>In Transit</span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className={styles.pendingNote}>Awaiting NGO supply pledge</div>
                      )}
                    </div>
                  ))}
                </div>

                {req.requiredVolunteers?.length > 0 && (
                  <div className={styles.subSection}>
                    <h4 className={styles.subHeading}>Field Team Roster</h4>
                    <div className={styles.productTags}>
                      {req.requiredVolunteers.map((rv, i) => (
                        <span key={rv._id || i} className={styles.tag}>
                          {rv.role}: {rv.assignedVolunteers?.length || 0}/{rv.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.requestFooter}>
                  <span className={styles.timestamp}>
                    Created: {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                  {!isResolved && (
                    <button
                      type="button"
                      className={styles.resolveBtn}
                      onClick={() => handleResolve(req._id)}
                    >
                      Mark Mission Resolved
                    </button>
                  )}
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
