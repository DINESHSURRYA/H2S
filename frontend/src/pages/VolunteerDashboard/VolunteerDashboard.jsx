import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingRequests, getVolunteerRequests, approveHelpRequest, voteHype } from '../../services/apiService';
import styles from './VolunteerDashboard.module.css';
import Button from '../../components/Button/Button';
import VolunteerOverview from './VolunteerOverview';
import AvailableRequests from './AvailableRequests';
import MyAcceptedTasks from './MyAcceptedTasks';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [volunteerData, setVolunteerData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [activeTab, setActiveTab] = useState('available'); // 'available' or 'tasks'

  useEffect(() => {
    const data = localStorage.getItem('volunteerData');
    const token = localStorage.getItem('volunteerToken');
    
    if (!token || !data) {
      navigate('/volunteer/login');
      return;
    }
    
    try {
      const parsedData = JSON.parse(data);
      setVolunteerData(parsedData);
      fetchRequests(parsedData.id);
    } catch (error) {
      console.error('Failed to parse Volunteer data');
      navigate('/volunteer/login');
    }
  }, [navigate]);

  const fetchRequests = async (volId) => {
    try {
      const [pendingRes, myRes] = await Promise.all([
        getPendingRequests(),
        getVolunteerRequests(volId),
      ]);
      setPendingRequests(pendingRes);
      setMyRequests(myRes);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  };

  const handleApprove = async (requestId) => {
    if (!volunteerData) return;
    setLoadingAction(true);
    try {
      await approveHelpRequest(requestId, volunteerData.id);
      await fetchRequests(volunteerData.id); 
    } catch (err) {
      alert('Failed to approve request.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleHype = async (requestId) => {
    if (!volunteerData) return;
    try {
        await voteHype(requestId, volunteerData.id, 1);
        await fetchRequests(volunteerData.id);
    } catch (err) {
        alert('Failed to add hype.');
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('volunteerToken');
    localStorage.removeItem('volunteerData');
    navigate('/volunteer/login');
  };

  if (!volunteerData) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1 className={styles.title} style={{ letterSpacing: '-2px', fontWeight: '900' }}>AGENT INTERFACE // v2.0</h1>
          <p className={styles.subtitle}>UNIT: {volunteerData.name.toUpperCase()} // AUTHENTICATED SESSION</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <Button onClick={() => navigate('/volunteer/request-help')} style={{ background: 'var(--accent-color)' }}>+ RAISE FIELD REPORT</Button>
            <Button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>TERMINATE SESSION</Button>
        </div>
      </header>

      <div className={styles.bentoGrid}>
        <VolunteerOverview 
            volunteerData={volunteerData} 
            myRequestsCount={myRequests.length}
            raisedRequestsCount={0} // No longer tracked via raisedBy
        />

        <div className={styles.bentoItem} style={{ gridColumn: 'span 12', padding: 0, background: 'none', border: 'none', boxShadow: 'none' }}>
           <div className={styles.tabs} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button 
                    className={`${styles.tab} ${activeTab === 'available' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('available')}
                    style={{ background: activeTab === 'available' ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    AVAILABLE MISSIONS
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'tasks' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('tasks')}
                    style={{ background: activeTab === 'tasks' ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    MY ACTIVE SORTIES ({myRequests.length})
                </button>
           </div>

            {activeTab === 'available' ? (
                <AvailableRequests 
                    requests={pendingRequests} 
                    onApprove={handleApprove} 
                    onHype={handleHype}
                    loadingAction={loadingAction} 
                />
            ) : (
                <MyAcceptedTasks 
                    requests={myRequests} 
                    volunteerData={volunteerData} 
                />
            )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;

