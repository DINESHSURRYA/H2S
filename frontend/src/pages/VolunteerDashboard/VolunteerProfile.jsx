import React, { useState, useEffect, useCallback } from 'react';
import { getVolunteerProfile, updateVolunteerProfile } from '../../services/apiService';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import styles from './VolunteerDashboard.module.css';

const AVAILABLE_ROLES = [
  'Medical Assistant',
  'Search & Rescue',
  'Heavy Vehicle Driver',
  'Logistics Coordinator',
  'Food & Water Distribution',
  'Emergency Shelter Support',
  'First Aid Responder',
  'Communication Specialist',
  'General Manual Labor',
];

const VolunteerProfile = ({ onProfileSaved }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', availability: 'part-time', skills: [] });
  const [newSkill, setNewSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const volunteerData = JSON.parse(localStorage.getItem('volunteerData') || '{}');
  const volunteerId = volunteerData?._id || volunteerData?.id;

  const fetchProfile = useCallback(async () => {
    if (!volunteerId) {
      setError('Session expired. Please log in again.');
      setLoading(false);
      return;
    }
    try {
      const data = await getVolunteerProfile(volunteerId);
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        availability: data.availability || 'part-time',
        skills: (data.skills || []).map((s) => s.name),
      });
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load volunteer profile.');
    } finally {
      setLoading(false);
    }
  }, [volunteerId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdate = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await updateVolunteerProfile(volunteerId, formData);
      const v = updated.volunteer;
      const normalized = { ...v, _id: v._id || v.id, id: v.id || v._id };
      setProfile(normalized);
      localStorage.setItem('volunteerData', JSON.stringify(normalized));
      setIsEditing(false);
      onProfileSaved?.();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill || formData.skills.includes(newSkill)) return;
    setFormData({ ...formData, skills: [...formData.skills, newSkill] });
    setNewSkill('');
  };

  const removeSkill = (skillName) => {
    setFormData({ ...formData, skills: formData.skills.filter((s) => s !== skillName) });
  };

  if (loading) return <div className={styles.placeholderText}>Loading Responder Profile...</div>;
  if (!profile) return <div className={styles.errorBanner}>{error || 'Profile unavailable.'}</div>;

  const verifiedSkills = (profile.skills || []).filter((s) => s.verified);
  const pendingSkills = (profile.skills || []).filter((s) => !s.verified);

  return (
    <div className={styles.profileContainer}>
      <div className={styles.sectionTopBar}>
        <h2 className={styles.sectionTitle}>Operational Profile &amp; Skills</h2>
        <button
          type="button"
          className={isEditing ? styles.cancelEditBtn : styles.primaryActionBtn}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel Edit' : 'Edit Credentials'}
        </button>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <div className={styles.bentoGrid}>
        {isEditing ? (
          <div className={`${styles.bentoItem} ${styles.colSpan12}`}>
            <div className={styles.formTwoCol}>
              <InputField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <InputField
                label="Contact Phone"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className={styles.selectGroup}>
              <label className={styles.selectLabel}>Availability</label>
              <select
                className={styles.select}
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="weekends">Weekends</option>
                <option value="on-call">On-call</option>
              </select>
            </div>

            <div className={styles.skillEditorSection}>
              <label className={styles.selectLabel}>Add Specialized Crisis Skills</label>
              <div className={styles.skillAddRow}>
                <select
                  className={styles.select}
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                >
                  <option value="">-- Select a Specialized Skill --</option>
                  {AVAILABLE_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <button type="button" className={styles.joinBtn} onClick={addSkill} disabled={!newSkill}>
                  Add Skill
                </button>
              </div>

              <div className={styles.productTags}>
                {formData.skills.map((s) => {
                  const isVerified = profile.skills.find((ps) => ps.name === s)?.verified;
                  return (
                    <span
                      key={s}
                      className={isVerified ? styles.verifiedSkillChip : styles.pendingSkillChip}
                    >
                      {s}
                      {!isVerified && (
                        <button
                          type="button"
                          onClick={() => removeSkill(s)}
                          className={styles.removeSkillBtn}
                        >
                          ×
                        </button>
                      )}
                    </span>
                  );
                })}
              </div>
              <p className={styles.helperHint}>* NGO-verified skills are permanently locked to your trust record.</p>
            </div>

            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? 'Saving Profile...' : 'Save Profile Updates'}
            </Button>
          </div>
        ) : (
          <>
            <div className={`${styles.bentoItem} ${styles.colSpan4}`}>
              <div className={styles.avatarHeader}>
                <div className={styles.avatarCircle}>👤</div>
                <h3 className={styles.profileName}>{profile.name}</h3>
                <span className={styles.verifiedChip}>{(profile.status || 'active').toUpperCase()}</span>
              </div>
              <div className={styles.profileMeta}>
                <div className={styles.dataRow}>
                  <span className={styles.label}>Email</span>
                  <span className={styles.value}>{profile.email}</span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.label}>Phone</span>
                  <span className={styles.value}>{profile.phone || 'Not set'}</span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.label}>Availability</span>
                  <span className={styles.value}>{(profile.availability || 'part-time').toUpperCase()}</span>
                </div>
                <div className={styles.dataRow}>
                  <span className={styles.label}>Trust Score</span>
                  <span className={styles.trustValue}>{profile.trustScore || 0} XP</span>
                </div>
              </div>
            </div>

            <div className={`${styles.bentoItem} ${styles.colSpan8}`}>
              <h3 className={styles.cardTitle}>Verified Capabilities</h3>
              {verifiedSkills.length === 0 ? (
                <p className={styles.pendingNote}>No skills certified by an NGO yet.</p>
              ) : (
                <div className={styles.skillGrid}>
                  {verifiedSkills.map((s) => (
                    <div key={s.name} className={styles.skillCardVerified}>
                      <div>
                        <strong className={styles.skillVerifiedName}>{s.name}</strong>
                        <div className={styles.skillSubtext}>
                          Certified by: {s.verifiedBy?.name || 'Verified NGO'}
                        </div>
                        {s.verificationReport && (
                          <div className={styles.skillSubtext}>Note: {s.verificationReport}</div>
                        )}
                      </div>
                      <span className={styles.receivedLabel}>✓</span>
                    </div>
                  ))}
                </div>
              )}

              <h3 className={`${styles.cardTitle} ${styles.sectionDividerTitle}`}>Pending NGO Verification</h3>
              {pendingSkills.length === 0 ? (
                <p className={styles.pendingNote}>All listed skills have been certified.</p>
              ) : (
                <div className={styles.skillGrid}>
                  {pendingSkills.map((s) => (
                    <div key={s.name} className={styles.skillCardPending}>
                      <div>
                        <strong className={styles.skillPendingName}>{s.name}</strong>
                        <div className={styles.skillSubtext}>Awaiting NGO skill review</div>
                      </div>
                      <span className={styles.rolePendingNote}>⏳</span>
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
