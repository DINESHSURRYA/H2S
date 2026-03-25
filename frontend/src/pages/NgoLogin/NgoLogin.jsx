import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginNgo } from '../../services/apiService';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import styles from './NgoLogin.module.css';

const NgoLogin = () => {
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
      const response = await loginNgo(formData);
      localStorage.setItem('ngoToken', response.token);
      localStorage.setItem('ngoData', JSON.stringify(response.ngo));
      navigate('/ngo/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>NGO Login</h1>
        <p className={styles.subtitle}>Enter your credentials to access the dashboard.</p>
        
        {error && <div className={styles.errorBanner}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <InputField
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="contact@ngo.org"
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
          Don't have an account? <Link to="/ngo/register">Register your NGO</Link>
        </p>
      </div>
    </div>
  );
};

export default NgoLogin;
