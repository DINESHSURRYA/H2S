import React, { useState, useEffect, useCallback } from 'react';
import { getUnverifiedVolunteers, verifySkill } from '../../services/apiService';
import styles from './VolunteerVerification.module.css';

const VolunteerVerification = ({ onVerified }) => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);
  const [report, setReport] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchUnverified = useCallback(async () => {
    try {
      const data = await getUnverifiedVolunteers();
      setVolunteers(data || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Unable to load pending volunteer credentials.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnverified();
  }, [fetchUnverified]);

  const handleVerify = async () => {
    if (!report.trim()) {
      setMessage({ type: 'error', text: 'Please enter a verification report before approving.' });
      return;
    }
    try {
      await verifySkill({
        volunteerId: verifying.volunteerId,
        skillName: verifying.skillName,
        report: report.trim(),
      });
      setMessage({
        type: 'success',
        text: `Certified "${verifying.skillName}" for ${verifying.volunteerName} (+5 Trust XP)!`,
      });
      setVerifying(null);
      setReport('');
      await fetchUnverified();
      onVerified?.();
    } catch (err) {
      setMessage({ type: 'error', text: err?.data?.message || err.message || 'Verification failed.' });
    }
  };

  if (loading) return <div className={styles.noData}>Loading volunteers awaiting skill verification...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Volunteer Skill Verification</h2>
      <p className={styles.subtitle}>
        Review and certify responder credentials so qualified volunteers can join specialized crisis teams.
      </p>

      {message.text && (
        <div className={message.type === 'error' ? styles.errorBanner : styles.successBanner}>
          {message.text}
        </div>
      )}

      {volunteers.length === 0 ? (
        <p className={styles.noData}>All volunteer skills are currently verified!</p>
      ) : (
        <div className={styles.grid}>
          {volunteers.map((v) => (
            <div key={v._id} className={styles.card}>
              <h3 className={styles.volName}>{v.name}</h3>
              <p className={styles.volMeta}>
                {v.email} {v.phone ? `• ${v.phone}` : ''}
              </p>
              <div className={styles.skillsList}>
                {(v.skills || [])
                  .filter((s) => !s.verified)
                  .map((s) => (
                    <div key={s.name} className={styles.skillItem}>
                      <span>{s.name}</span>
                      <button
                        type="button"
                        className={styles.verifyBtn}
                        onClick={() =>
                          setVerifying({ volunteerId: v._id, volunteerName: v.name, skillName: s.name })
                        }
                      >
                        Certify
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {verifying && (
        <div className={styles.modalOverlay} onClick={() => setVerifying(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.volName}>Certify Skill: {verifying.skillName}</h3>
            <p className={styles.volMeta}>Responder: {verifying.volunteerName}</p>
            <textarea
              placeholder="Enter verification report (e.g., medical license reviewed, field training confirmed...)"
              value={report}
              onChange={(e) => setReport(e.target.value)}
              className={styles.textarea}
            />
            <div className={styles.modalActions}>
              <button type="button" className={styles.submitBtn} onClick={handleVerify}>
                Approve &amp; Certify
              </button>
              <button type="button" className={styles.cancelBtn} onClick={() => setVerifying(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerVerification;
