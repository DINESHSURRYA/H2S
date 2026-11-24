import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginVolunteer } from '../../services/apiService';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import styles from './VolunteerLogin.module.css';

const VolunteerLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
      const response = await loginVolunteer(formData);
      const vol = response.volunteer;
      const normalizedVol = {
        ...vol,
        _id: vol._id || vol.id,
        id: vol.id || vol._id,
      };

      // Clear any stale NGO session so tokens never conflict
      localStorage.removeItem('ngoToken');
      localStorage.removeItem('ngoData');

      localStorage.setItem('volunteerToken', response.token);
      localStorage.setItem('volunteerData', JSON.stringify(normalizedVol));
      navigate('/volunteer/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Volunteer Login</h1>
        <p className={styles.subtitle}>Enter your credentials to access your field interface.</p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="jane_doe@gmail.com"
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

          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </Button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <Link to="/volunteer/register">Register as Volunteer</Link>
        </p>
      </div>
    </div>
  );
};

export default VolunteerLogin;
