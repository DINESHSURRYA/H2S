import React, { useState } from 'react';
import styles from './VolunteerDashboard.module.css';
import Button from '../../components/Button/Button';

const AvailableRequests = ({ requests, onApprove, onHype, loadingAction, onEdit }) => {
  const [search, setSearch] = useState('');

  const filtered = requests.filter((req) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      req.crisisDescription?.toLowerCase().includes(q) ||
      req.category?.toLowerCase().includes(q) ||
      req.publicUser?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.section}>
      <div className={styles.sectionTopBar}>
        <h2 className={styles.sectionTitle}>Incoming Public SOS Queue</h2>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Filter by keyword or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className={styles.placeholderText}>No pending public SOS alerts require validation right now.</p>
      ) : (
        <div className={styles.requestGrid}>
          {filtered.map((req) => {
            const hypeTotal = req.hype?.reduce((acc, h) => acc + (h.points || 0), 0) || 0;
            return (
              <div
                key={req._id}
                className={`${styles.requestCard} ${req.approvedBy ? styles.verifiedLayer : styles.publicLayer}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.headerMeta}>
                    <span className={styles.requestName}>{req.publicUser?.name || 'Citizen SOS'}</span>
                    <span className={styles.pendingChip}>PENDING FIELD VALIDATION</span>
                    <span className={`${styles.urgencyChip} ${styles[`urgency_${req.urgency || 'medium'}`]}`}>
                      {(req.urgency || 'medium').toUpperCase()}
                    </span>
                  </div>
                  {req.approvedBy && (
                    <button type="button" className={styles.editBtn} onClick={() => onEdit(req)}>
                      Edit Needs
                    </button>
                  )}
                </div>

                <div className={styles.metaRow}>
                  <span className={styles.categoryTag}>{req.category || 'Other'}</span>
                  <span className={styles.metaCoords}>
                    📍 {req.location?.latitude?.toFixed(4) || '—'}, {req.location?.longitude?.toFixed(4) || '—'}
                  </span>
                  <span className={styles.metaCoords}>👥 {req.affectedCount || 1} affected</span>
                </div>

                <p className={styles.requestDesc}>{req.crisisDescription}</p>

                <div className={styles.hypeRow}>
                  <span className={styles.hypeScore}>🔥 Priority Hype: {hypeTotal}</span>
                  <button type="button" onClick={() => onHype(req._id, 1)} className={styles.hypeBtn}>
                    +1 Boost
                  </button>
                  <button type="button" onClick={() => onHype(req._id, 3)} className={styles.hypeBtn}>
                    +3 Urgent
                  </button>
                </div>

                {req.requiredVolunteers?.length > 0 && (
                  <div className={styles.subSection}>
                    <h4 className={styles.subHeading}>Manpower Needed</h4>
                    <div className={styles.productTags}>
                      {req.requiredVolunteers.map((rv, i) => (
                        <span key={i} className={styles.tag}>
                          {rv.role} ({rv.assignedVolunteers?.length || 0}/{rv.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.subSection}>
                  <h4 className={styles.subHeading}>Requested Supplies</h4>
                  <div className={styles.productTags}>
                    {req.requirements?.map((p, idx) => (
                      <span key={idx} className={styles.supplyTag}>
                        {p.quantity} × {p.itemName}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.requestFooter}>
                  <span className={styles.timestamp}>
                    Reported: {new Date(req.createdAt).toLocaleString()}
                  </span>
                  {!req.approvedBy && (
                    <Button onClick={() => onApprove(req._id)} disabled={loadingAction}>
                      {loadingAction ? 'Validating...' : 'Validate & Approve'}
                    </Button>
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

export default AvailableRequests;
