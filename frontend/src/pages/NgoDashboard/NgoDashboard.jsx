import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNgoStats } from '../../services/apiService';
import styles from './NgoDashboard.module.css';
import NgoOverview from './NgoOverview';
import NgoMissions from './NgoMissions';
import VolunteerVerification from './VolunteerVerification';

const readInitialNgo = () => {
  const data = localStorage.getItem('ngoData');
  const token = localStorage.getItem('ngoToken');
  if (!token || !data) return null;
  try {
    const parsed = JSON.parse(data);
    const ngoId = parsed._id || parsed.id;
    return ngoId ? { ...parsed, _id: ngoId, id: ngoId } : null;
  } catch {
    return null;
  }
};

const NgoDashboard = () => {
  const navigate = useNavigate();
  const [ngoData, setNgoData] = useState(readInitialNgo);
  const [ngoStats, setNgoStats] = useState(null);
  const [filterMode, setFilterMode] = useState('verified');

  const refreshNgoState = useCallback(async (ngoId) => {
    try {
      const res = await getNgoStats(ngoId);
      if (res?.ngo) {
        const normalized = { ...res.ngo, _id: res.ngo._id || res.ngo.id, id: res.ngo.id || res.ngo._id };
        setNgoData(normalized);
        localStorage.setItem('ngoData', JSON.stringify(normalized));
      }
      if (res?.stats) {
        setNgoStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to sync NGO stats:', err);
    }
  }, []);

  const initialNgoId = ngoData?._id || ngoData?.id;

  useEffect(() => {
    if (!initialNgoId) {
      navigate('/ngo/login');
      return;
    }
    let cancelled = false;
    getNgoStats(initialNgoId)
      .then((res) => {
        if (cancelled) return;
        if (res?.ngo) {
          const normalized = { ...res.ngo, _id: res.ngo._id || res.ngo.id, id: res.ngo.id || res.ngo._id };
          setNgoData(normalized);
          localStorage.setItem('ngoData', JSON.stringify(normalized));
        }
        if (res?.stats) {
          setNgoStats(res.stats);
        }
      })
      .catch((err) => console.error('Failed to sync NGO stats:', err));
    return () => {
      cancelled = true;
    };
  }, [initialNgoId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('ngoToken');
    localStorage.removeItem('ngoData');
    navigate('/ngo/login');
  };

  if (!ngoData) return null;

  const ngoId = ngoData._id || ngoData.id;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1 className={styles.title}>NGO Command Hub</h1>
          <p className={styles.subtitle}>
            Organization: {ngoData.name} • Trust Score: {ngoData.trustScore || 0} XP
          </p>
        </div>
        <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
          Sign Out
        </button>
      </header>

      {ngoData.status === 'pending' && (
        <div className={styles.warningBanner}>
          Your NGO account is currently <strong>pending Admin verification</strong>. You can browse active missions,
          but an Admin must activate your organization at <code>/admin</code> before you can pledge supplies or certify volunteer skills.
        </div>
      )}

      {ngoData.status === 'suspended' && (
        <div className={styles.dangerBanner}>
          This NGO account is currently <strong>suspended</strong> by a Platform Administrator.
        </div>
      )}

      <div className={styles.bentoGrid}>
        <NgoOverview ngoData={ngoData} stats={ngoStats} />

        <div className={styles.tabsSection}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${filterMode === 'verified' ? styles.activeTab : ''}`}
              onClick={() => setFilterMode('verified')}
            >
              Available Crises
            </button>
            <button
              type="button"
              className={`${styles.tab} ${filterMode === 'field' ? styles.activeTab : ''}`}
              onClick={() => setFilterMode('field')}
            >
              Helped Requests ({ngoStats?.missionsSupported ?? 0})
            </button>
            <button
              type="button"
              className={`${styles.tab} ${filterMode === 'verification' ? styles.activeTab : ''}`}
              onClick={() => setFilterMode('verification')}
            >
              Skill Verification
            </button>
          </div>

          {filterMode === 'verification' ? (
            <VolunteerVerification onVerified={() => refreshNgoState(ngoId)} />
          ) : (
            <NgoMissions filterMode={filterMode} onAllocationChange={() => refreshNgoState(ngoId)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default NgoDashboard;
