import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NgoDashboard.module.css';
import Button from '../../components/Button/Button';
import NgoOverview from './NgoOverview';
import NgoMissions from './NgoMissions';

const NgoDashboard = () => {
  const navigate = useNavigate();
  const [ngoData, setNgoData] = useState(null);
  const [filterMode, setFilterMode] = useState('verified'); // 'verified' or 'field'

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
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1 className={styles.title} style={{ letterSpacing: '-2px', fontWeight: '900' }}>NGO COMMAND HUB // v2.0</h1>
          <p className={styles.subtitle}>ORGANIZATION: {ngoData.name.toUpperCase()} // AUTHENTICATED ACCESS</p>
        </div>
        <Button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>TERMINATE SESSION</Button>
      </header>

      <div className={styles.bentoGrid}>
        <NgoOverview ngoData={ngoData} />

        <div className={styles.bentoItem} style={{ gridColumn: 'span 12', padding: 0, background: 'none', border: 'none', boxShadow: 'none' }}>
           <div className={styles.tabs} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                <button 
                    className={`${styles.tab} ${filterMode === 'verified' ? styles.activeTab : ''}`}
                    onClick={() => setFilterMode('verified')}
                    style={{ background: filterMode === 'verified' ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    VALIDATED MISSIONS
                </button>
                <button 
                    className={`${styles.tab} ${filterMode === 'field' ? styles.activeTab : ''}`}
                    onClick={() => setFilterMode('field')}
                    style={{ background: filterMode === 'field' ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    FIELD REPORTS (PENDING)
                </button>
           </div>

           <NgoMissions filterMode={filterMode} />
        </div>
      </div>
    </div>
  );
};

export default NgoDashboard;

