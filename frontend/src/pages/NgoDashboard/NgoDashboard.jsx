import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NgoDashboard.module.css';
import Button from '../../components/Button/Button';

const NgoDashboard = () => {
  const navigate = useNavigate();
  const [ngoData, setNgoData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('ngoData');
    const token = localStorage.getItem('ngoToken');
    
    if (!token || !data) {
      navigate('/ngo/login');
      return;
    }
    
    try {
      setNgoData(JSON.parse(data));
    } catch (error) {
      console.error('Failed to parse NGO data');
      navigate('/ngo/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('ngoToken');
    localStorage.removeItem('ngoData');
    navigate('/ngo/login');
  };

  if (!ngoData) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1 className={styles.title}>NGO Dashboard</h1>
          <p className={styles.subtitle}>Welcome back, {ngoData.name}</p>
        </div>
        <Button onClick={handleLogout}>Log Out</Button>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Profile Summary</h2>
          <div className={styles.dataRow}>
            <span className={styles.label}>Email:</span>
            <span className={styles.value}>{ngoData.email}</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.label}>Status:</span>
            <span className={`${styles.statusBadge} ${styles[ngoData.status] || ''}`}>
              {ngoData.status}
            </span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.label}>Registration No:</span>
            <span className={styles.value}>{ngoData.registrationNumber || 'N/A'}</span>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Quick Stats</h2>
          <div className={styles.statsContainer}>
            <div className={styles.statBox}>
              <span className={styles.statValue}>0</span>
              <span className={styles.statLabel}>Active Campaigns</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>0</span>
              <span className={styles.statLabel}>Volunteers</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.mainContent}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Recent Help Requests (Coming Soon)</h2>
          <p className={styles.placeholderText}>No recent requests match your service area.</p>
        </div>
      </div>
    </div>
  );
};

export default NgoDashboard;
