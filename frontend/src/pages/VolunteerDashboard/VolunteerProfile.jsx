import React, { useState, useEffect } from 'react';
import { getVolunteerProfile, updateVolunteerProfile } from '../../services/apiService';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import styles from './VolunteerDashboard.module.css';

const VolunteerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);

  const volunteerData = JSON.parse(localStorage.getItem('volunteerData'));
  const volunteerId = volunteerData?._id || volunteerData?.id;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getVolunteerProfile(volunteerId);
      setProfile(data);
      setFormData({
        name: data.name,
        phone: data.phone,
        availability: data.availability,
        skills: data.skills.map(s => s.name)
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const updated = await updateVolunteerProfile(volunteerId, formData);
      setProfile(updated.volunteer);
      localStorage.setItem('volunteerData', JSON.stringify(updated.volunteer));
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile.');
    }
  };

  const AVAILABLE_ROLES = [
    'Medical Assistant',
    'Search & Rescue',
    'Heavy Vehicle Driver',
    'Logistics Coordinator',
    'Food & Water Distribution',
    'Emergency Shelter Support',
    'First Aid Responder',
    'Communication Specialist',
    'General Manual Labor'
  ];

  const addSkill = () => {
    if (!newSkill) return;
    if (formData.skills.includes(newSkill)) return;
    setFormData({ ...formData, skills: [...formData.skills, newSkill] });
    setNewSkill('');
  };

  const removeSkill = (skillName) => {
      setFormData({ ...formData, skills: formData.skills.filter(s => s !== skillName) });
  };

  if (loading) return <div className={styles.loading}>Initializing Secure Profile...</div>;

  const verifiedSkills = profile.skills.filter(s => s.verified);
  const pendingSkills = profile.skills.filter(s => !s.verified);

  return (
    <div className={styles.profileContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className={styles.sectionTitle} style={{ margin: 0 }}>OPERATIONAL PROFILE</h2>
        <button 
            className={styles.editBtn} 
            onClick={() => setIsEditing(!isEditing)}
            style={{ background: isEditing ? '#ef4444' : 'var(--accent-color)' }}
        >
            {isEditing ? 'CANCEL EDIT' : 'EDIT CREDENTIALS'}
        </button>
      </div>

      <div className={styles.bentoGrid} style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.5rem' }}>
        {isEditing ? (
          <div className={styles.bentoItem} style={{ gridColumn: 'span 12' }}>
            <div className={styles.form}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <InputField 
                    label="Full Name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
                <InputField 
                    label="Contact Phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                />
              </div>

              <div className={styles.selectGroup} style={{ marginTop: '1rem' }}>
                  <label className={styles.selectLabel}>Deployed Availability</label>
                  <select 
                      className={styles.select}
                      value={formData.availability}
                      onChange={(e) => setFormData({...formData, availability: e.target.value})}
                  >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="weekends">Weekends</option>
                      <option value="on-call">On-call</option>
                  </select>
              </div>

              <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                  <label className={styles.selectLabel}>Skill Acquisition (Fixed Roles Only)</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <select 
                          className={styles.select}
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          style={{ flex: 1 }}
                      >
                          <option value="">-- Select a Specialized Skill --</option>
                          {AVAILABLE_ROLES.map(role => (
                              <option key={role} value={role}>{role}</option>
                          ))}
                      </select>
                      <button className={styles.joinBtn} onClick={addSkill} disabled={!newSkill}>ADD SKILL</button>
                  </div>

                  <div className={styles.productTags}>
                      {formData.skills.map(s => {
                          const isVerified = profile.skills.find(ps => ps.name === s)?.verified;
                          return (
                            <span key={s} className={styles.tag} style={{ border: isVerified ? '1px solid #10b981' : '1px solid #f59e0b' }}>
                                {s} 
                                {!isVerified && <button onClick={() => removeSkill(s)} style={{ background: 'none', border: 'none', color: '#ef4444', marginLeft: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>×</button>}
                            </span>
                          );
                      })}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>* Only unverified skills can be removed.</p>
              </div>

              <Button onClick={handleUpdate} style={{ marginTop: '2.5rem', width: '100%' }}>UPDATE PROTOCOL & SAVE</Button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.bentoItem} style={{ gridColumn: 'span 4' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👤</div>
                <h3 style={{ margin: 0, color: 'white' }}>{profile.name}</h3>
                <span className={styles.statusBadge} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>{profile.status.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                <p><strong>EMAIL:</strong> {profile.email}</p>
                <p><strong>PHONE:</strong> {profile.phone || 'NOT SET'}</p>
                <p><strong>AVAILABILITY:</strong> {profile.availability.toUpperCase()}</p>
                <p><strong>TRUST SCORE:</strong> <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{profile.trustScore} XP</span></p>
              </div>
            </div>

            <div className={styles.bentoItem} style={{ gridColumn: 'span 8' }}>
                <h3 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>VERIFIED CAPABILITIES</h3>
                {verifiedSkills.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No skills verified by NGOs yet.</p>
                ) : (
                    <div className={styles.skillGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {verifiedSkills.map(s => (
                            <div key={s.name} className={styles.roleItem} style={{ borderLeft: '4px solid #10b981', background: 'rgba(16, 185, 129, 0.05)' }}>
                                <div>
                                    <strong style={{ color: '#10b981' }}>{s.name}</strong>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                                        AUTH BY: {s.verifiedBy?.name}
                                    </div>
                                </div>
                                <span style={{ color: '#10b981', fontSize: '0.8rem' }}>✓</span>
                            </div>
                        ))}
                    </div>
                )}

                <h3 style={{ color: 'white', marginTop: '2rem', marginBottom: '1.5rem', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>PENDING VERIFICATION</h3>
                {pendingSkills.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>All skills have been reviewed.</p>
                ) : (
                    <div className={styles.skillGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {pendingSkills.map(s => (
                            <div key={s.name} className={styles.roleItem} style={{ borderLeft: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
                                <div>
                                    <strong style={{ color: '#f59e0b' }}>{s.name}</strong>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem' }}>
                                        WAITING FOR NGO REVIEW
                                    </div>
                                </div>
                                <span style={{ color: '#f59e0b', fontSize: '0.8rem' }}>!</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VolunteerProfile;
