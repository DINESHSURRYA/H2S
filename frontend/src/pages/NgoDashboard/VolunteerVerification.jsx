import React, { useState, useEffect } from 'react';
import { getUnverifiedVolunteers, verifySkill } from '../../services/apiService';
import styles from './VolunteerVerification.module.css';

const VolunteerVerification = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null); // { volunteerId, skillName }
  const [report, setReport] = useState('');

  useEffect(() => {
    fetchUnverified();
  }, []);

  const fetchUnverified = async () => {
    try {
      const data = await getUnverifiedVolunteers();
      setVolunteers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!report.trim()) return alert('Please provide a verification report.');
    try {
      await verifySkill({
        volunteerId: verifying.volunteerId,
        skillName: verifying.skillName,
        report
      });
      alert('Skill verified successfully!');
      setVerifying(null);
      setReport('');
      fetchUnverified(); // Refresh list
    } catch (err) {
      alert('Verification failed.');
    }
  };

  if (loading) return <div>Loading unverified volunteers...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Skill Verification</h2>
      <p className={styles.subtitle}>Review and verify volunteer credentials to ensure task suitability.</p>

      {volunteers.length === 0 ? (
        <p className={styles.noData}>All volunteers are verified or no skills pending.</p>
      ) : (
        <div className={styles.grid}>
          {volunteers.map(v => (
            <div key={v._id} className={styles.card}>
              <h3>{v.name}</h3>
              <p>{v.email}</p>
              <div className={styles.skillsList}>
                {v.skills.filter(s => !s.verified).map(s => (
                  <div key={s.name} className={styles.skillItem}>
                    <span>{s.name}</span>
                    <button 
                        className={styles.verifyBtn}
                        onClick={() => setVerifying({ volunteerId: v._id, skillName: s.name })}
                    >
                        Verify
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {verifying && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Verify Skill: {verifying.skillName}</h3>
            <p>For Volunteer ID: {verifying.volunteerId}</p>
            <textarea 
                placeholder="Enter verification report (e.g., identity checked, certificates verified...)"
                value={report}
                onChange={(e) => setReport(e.target.value)}
                className={styles.textarea}
            />
            <div className={styles.modalActions}>
                <button className={styles.submitBtn} onClick={handleVerify}>Approve Skill</button>
                <button className={styles.cancelBtn} onClick={() => setVerifying(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerVerification;
