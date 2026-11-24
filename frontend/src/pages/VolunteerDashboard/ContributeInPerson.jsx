import React, { useState, useEffect, useCallback } from 'react';
import { getApprovedRequests, assignVolunteer, unassignVolunteer } from '../../services/apiService';
import styles from './VolunteerDashboard.module.css';

const ContributeInPerson = ({ volunteerData: propVolData, onJoined, onToast }) => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyRole, setBusyRole] = useState(null);

  const volunteerData = propVolData || JSON.parse(localStorage.getItem('volunteerData') || '{}');
  const volunteerId = volunteerData?._id || volunteerData?.id;
  const volunteerSkills = volunteerData?.skills || [];

  const fetchMissions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getApprovedRequests();
      const withRoles = data.filter(
        (m) => m.status !== 'resolved' && m.requiredVolunteers && m.requiredVolunteers.length > 0
      );
      setMissions(withRoles);
    } catch (err) {
      console.error('Failed to fetch field team opportunities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  const handleJoin = async (missionId, roleId) => {
    if (!volunteerId) return;
    setBusyRole(roleId);
    try {
      await assignVolunteer(missionId, roleId, volunteerId);
      onToast?.('Assigned to field role (+10 Trust XP)!');
      await fetchMissions();
      onJoined?.();
    } catch (err) {
      onToast?.(err?.data?.message || err.message || 'Failed to join role.');
    } finally {
      setBusyRole(null);
    }
  };

  const handleLeave = async (missionId, roleId) => {
    if (!volunteerId) return;
    setBusyRole(roleId);
    try {
      await unassignVolunteer(missionId, roleId, volunteerId);
      onToast?.('Unassigned from field role.');
      await fetchMissions();
      onJoined?.();
    } catch (err) {
      onToast?.(err?.data?.message || err.message || 'Failed to leave role.');
    } finally {
      setBusyRole(null);
    }
  };

  if (loading) return <div className={styles.placeholderText}>Loading field deployment opportunities...</div>;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>In-Person Field Team Deployments</h2>
      <p className={styles.sectionSubtitle}>
        Join specialized crisis roles matching your NGO-verified skills. Unverified skills stay locked until certified by an NGO.
      </p>

      {missions.length === 0 ? (
        <p className={styles.placeholderText}>No active missions currently requesting field manpower.</p>
      ) : (
        <div className={styles.requestGrid}>
          {missions.map((m) => (
            <div key={m._id} className={styles.requestCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.requestName}>{m.crisisDescription}</h3>
                <span className={`${styles.urgencyChip} ${styles[`urgency_${m.urgency || 'medium'}`]}`}>
                  {(m.urgency || 'medium').toUpperCase()}
                </span>
              </div>

              <div className={styles.metaRow}>
                <span className={styles.categoryTag}>{m.category || 'Other'}</span>
                <span className={styles.metaCoords}>
                  📍 {m.location?.latitude?.toFixed(4)}, {m.location?.longitude?.toFixed(4)}
                </span>
              </div>

              <div className={styles.rolesList}>
                <h4 className={styles.subHeading}>Needed Roles</h4>
                {m.requiredVolunteers.map((rv) => {
                  const skill = volunteerSkills.find((s) => s.name === rv.role);
                  const isVerified = Boolean(skill && skill.verified);
                  const isFull = (rv.assignedVolunteers?.length || 0) >= rv.count;
                  const alreadyJoined = rv.assignedVolunteers?.some(
                    (v) => (v?._id || v) === volunteerId
                  );

                  return (
                    <div key={rv._id} className={styles.roleItem}>
                      <div>
                        <strong className={styles.roleTitle}>
                          {rv.role} ({rv.assignedVolunteers?.length || 0}/{rv.count})
                        </strong>
                        {alreadyJoined ? (
                          <div className={styles.roleJoinedNote}>✓ You are deployed in this role</div>
                        ) : !skill ? (
                          <div className={styles.roleLockedNote}>Add "{rv.role}" in your Profile to qualify</div>
                        ) : !isVerified ? (
                          <div className={styles.rolePendingNote}>Awaiting NGO skill verification</div>
                        ) : isFull ? (
                          <div className={styles.roleLockedNote}>Team capacity full</div>
                        ) : (
                          <div className={styles.roleReadyNote}>✓ Verified skill matches</div>
                        )}
                      </div>

                      {alreadyJoined ? (
                        <button
                          type="button"
                          className={styles.leaveBtn}
                          disabled={busyRole === rv._id}
                          onClick={() => handleLeave(m._id, rv._id)}
                        >
                          {busyRole === rv._id ? '...' : 'Leave'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={styles.joinBtn}
                          onClick={() => handleJoin(m._id, rv._id)}
                          disabled={!isVerified || isFull || busyRole === rv._id}
                        >
                          {busyRole === rv._id ? '...' : isFull ? 'Full' : isVerified ? 'Join Team' : 'Locked'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContributeInPerson;
