import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerVolunteer } from '../../services/apiService';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import styles from './VolunteerRegister.module.css';

const VolunteerRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    aadharNumber: '',
    phone: '',
    skills: [],
    otherSkill: '',
    availability: 'part-time',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const finalSkills = [...formData.skills];
      if (formData.otherSkill.trim()) {
        finalSkills.push(formData.otherSkill.trim());
      }
      
      const processedData = {
        ...formData,
        skills: finalSkills.map(s => ({ name: s, verified: false })),
      };
      
      const response = await registerVolunteer(processedData);
      localStorage.setItem('volunteerToken', response.token);
      localStorage.setItem('volunteerData', JSON.stringify(response.volunteer));
      navigate('/volunteer-dashboard'); // Updated to point to dashboard
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Volunteer Registration</h1>
        <p className={styles.subtitle}>Lend your skills to make a difference.</p>
        
        {error && <div className={styles.errorBanner}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <InputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
          />
          <InputField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          <InputField
            label="Aadhaar Number (UIDAI)"
            name="aadharNumber"
            value={formData.aadharNumber}
            onChange={handleChange}
            placeholder="XXXX XXXX XXXX (12-digit)"
            required
            maxLength="12"
          />
          <InputField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
          />
          <div className={styles.skillsGroup}>
            <label className={styles.selectLabel}>Skills / Specializations</label>
            <div className={styles.checkboxGrid}>
              {[
                'Medical Assistant',
                'Search & Rescue',
                'Heavy Vehicle Driver',
                'Logistics Coordinator',
                'Food & Water Distribution',
                'Emergency Shelter Support',
                'First Aid Responder',
                'Communication Specialist',
                'General Manual Labor'
              ].map(skill => (
                <label key={skill} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={(e) => {
                      const newSkills = e.target.checked
                        ? [...formData.skills, skill]
                        : formData.skills.filter(s => s !== skill);
                      setFormData({ ...formData, skills: newSkills });
                    }}
                  />
                  {skill}
                </label>
              ))}
            </div>
            <InputField
              label="Other Skills (Optional)"
              name="otherSkill"
              value={formData.otherSkill || ''}
              onChange={(e) => setFormData({ ...formData, otherSkill: e.target.value })}
              placeholder="e.g. Scuba Diving, Plumbing"
            />
          </div>
          
          <div className={styles.selectGroup}>
            <label className={styles.selectLabel}>Availability</label>
            <select 
              name="availability" 
              className={styles.select} 
              value={formData.availability} 
              onChange={handleChange}
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="weekends">Weekends</option>
              <option value="on-call">On-call</option>
            </select>
          </div>
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Join as Volunteer'}
          </Button>
        </form>
        
        <p className={styles.footer}>
          Already have an account? <Link to="/volunteer/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default VolunteerRegister;
