import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginNgo } from '../../services/apiService';
import styles from './NgoLogin.module.css';

const NgoLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginNgo(formData);

      // 🔥 Normalize NGO
      const ngo = response.ngo;
      const normalizedNgo = {
        ...ngo,
        _id: ngo._id || ngo.id
      };

      localStorage.setItem('ngoToken', response.token);
      localStorage.setItem('ngoData', JSON.stringify(normalizedNgo));

      navigate('/ngo/dashboard');

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err.message ||
        'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <h1 className={styles.title}>NGO Login</h1>
        <p className={styles.subtitle}>Access your mission dashboard</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className={styles.footer}>
          New NGO? <Link to="/ngo/register">Register</Link>
        </p>

      </div>
    </div>
  );
};

export default NgoLogin;