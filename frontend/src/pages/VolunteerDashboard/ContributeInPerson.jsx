import React, { useState, useEffect } from 'react';
import { getApprovedRequests } from '../../services/apiService';
import styles from './VolunteerDashboard.module.css';
import axios from 'axios';

const ContributeInPerson = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const volunteerData = JSON.parse(localStorage.getItem('volunteerData'));
  const volunteerId = volunteerData?._id;
  const volunteerSkills = volunteerData?.skills || [];

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const data = await getApprovedRequests();
      // Filter missions that need people and match volunteer's VERIFIED skills
      const filtered = data.filter(m => 
        m.requiredVolunteers && m.requiredVolunteers.length > 0 &&
        m.requiredVolunteers.some(rv => {
            const skill = volunteerSkills.find(s => s.name === rv.role);
            return skill && skill.verified && 
                   rv.assignedVolunteers.length < rv.count &&
                   !rv.assignedVolunteers.some(v => v._id === volunteerId || v === volunteerId);
        })
      );
      setMissions(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (missionId, roleId) => {
    try {
      const token = localStorage.getItem('volunteerToken');
      await axios.post(`http://localhost:5000/api/help-request/${missionId}/assign/${roleId}`, 
        { volunteerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Successfully assigned to role!');
      fetchMissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join');
    }
  };

  if (loading) return <div>Loading specialized missions...</div>;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>In-Person Opportunities</h2>
      <p className={styles.subtitle}>Missions that match your specific skills and need manpower.</p>
      
      <div className={styles.requestGrid}>
        {missions.length > 0 ? (
          missions.map(m => (
            <div key={m._id} className={styles.requestCard}>
              <div className={styles.cardHeader}>
                <h3>{m.crisisDescription}</h3>
                <span className={styles.statusBadge}>ACTIVE</span>
              </div>
              
              <div className={styles.requirementsList}>
                <h4>Needed Roles:</h4>
                {m.requiredVolunteers.map(rv => {
                    const skill = volunteerSkills.find(s => s.name === rv.role);
                    const isVerified = skill && skill.verified;
                    const isFull = rv.assignedVolunteers.length >= rv.count;
                    const alreadyJoined = rv.assignedVolunteers.some(v => (v._id || v) === volunteerId);

                    if (!skill || isFull || alreadyJoined) return null;

                    return (
                        <div key={rv._id} className={styles.roleItem}>
                            <div>
                                <span>{rv.role} ({rv.assignedVolunteers.length}/{rv.count})</span>
                                {!isVerified && <div style={{ color: '#f59e0b', fontSize: '0.75rem' }}>✕ Verification Required</div>}
                            </div>
                            <button 
                                className={styles.joinBtn}
                                onClick={() => handleJoin(m._id, rv._id)}
                                disabled={!isVerified}
                                style={{ opacity: isVerified ? 1 : 0.5 }}
                            >
                                {isVerified ? 'Join' : 'Locked'}
                            </button>
                        </div>
                    );
                })}
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noData}>No specialized missions matching your skills at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default ContributeInPerson;
