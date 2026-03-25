import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerNgo } from '../../services/apiService';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import styles from './NgoRegister.module.css';

const NgoRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    registrationNumber: '',
    address: '',
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
      const response = await registerNgo(formData);
      localStorage.setItem('ngoToken', response.token);
      localStorage.setItem('ngoData', JSON.stringify(response.ngo));
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
        <h1 className={styles.title}>NGO Registration</h1>
        <p className={styles.subtitle}>Join H2S to coordinate crisis response.</p>
        
        {error && <div className={styles.errorBanner}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <InputField
            label="NGO Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Official NGO Name"
            required
          />
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
          <InputField
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
          />
          <InputField
            label="Registration Number"
            name="registrationNumber"
            value={formData.registrationNumber}
            onChange={handleChange}
            placeholder="Official ID"
          />
          <InputField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Full Office Address"
          />
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Complete Registration'}
          </Button>
        </form>
        
        <p className={styles.footer}>
          Already registered? <Link to="/ngo/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default NgoRegister;
