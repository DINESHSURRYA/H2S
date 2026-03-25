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
    skills: '',
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
      // Split skills by comma and trim
      const processedData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
      };
      
      const response = await registerVolunteer(processedData);
      localStorage.setItem('volunteerToken', response.token);
      localStorage.setItem('volunteerData', JSON.stringify(response.volunteer));
      navigate('/');
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
          <InputField
            label="Skills (comma separated)"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="First Aid, Driving, Tech Support"
          />
          
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
