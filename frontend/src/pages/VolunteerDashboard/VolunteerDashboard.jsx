import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUnapprovedRequests, getRequestsByVolunteer, approveHelpRequest, voteHype } from '../../services/apiService';
import styles from './VolunteerDashboard.module.css';
import Button from '../../components/Button/Button';
import VolunteerOverview from './VolunteerOverview';
import AvailableRequests from './AvailableRequests';
import MyAcceptedTasks from './MyAcceptedTasks';
import ContributeInPerson from './ContributeInPerson';
import VolunteerProfile from './VolunteerProfile';

import VolunteerRequestHelp from '../VolunteerRequestHelp/VolunteerRequestHelp';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [volunteerData, setVolunteerData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [activeTab, setActiveTab] = useState('available'); // 'available', 'tasks', 'in-person', 'profile'
  const [editingRequest, setEditingRequest] = useState(null); // Added state

  useEffect(() => {
    const data = localStorage.getItem('volunteerData');
    if (!data) {
      navigate('/volunteer/login');
      return;
    }
    const parsed = JSON.parse(data);
    setVolunteerData(parsed);
    fetchRequests(parsed.id || parsed._id);
  }, [navigate]);

  const fetchRequests = async (volId) => {
    try {
      const [pendingRes, myRes] = await Promise.all([
        getUnapprovedRequests(), // Changed API call
        getRequestsByVolunteer(volId), // Changed API call
      ]);
      setPendingRequests(pendingRes);
      setMyRequests(myRes);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  };

  const handleApprove = async (requestId) => {
    setLoadingAction(true);
    try {
      await approveHelpRequest(requestId, volunteerData.id);
      fetchRequests(volunteerData.id); // Changed to not await
    } catch (err) {
      console.error('Failed to approve request', err); // Changed alert to console.error
    } finally {
      setLoadingAction(false);
    }
  };

  const handleHype = async (requestId, points) => { // Added points parameter
    try {
      await voteHype(requestId, volunteerData.id, points); // Changed points value
      fetchRequests(volunteerData.id); // Changed to not await
    } catch (err) {
      console.error('Failed to vote hype', err); // Changed alert to console.error
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
          <h1 className={styles.title} style={{ letterSpacing: '-2px', fontWeight: '900' }}>VOLUNTEER INTERFACE</h1>
          <p className={styles.subtitle}>NAME: {volunteerData.name.toUpperCase()}</p>
        </div>
      </header>

      <br></br>
      <div className={styles.bentoGrid}>
        <VolunteerOverview
          volunteerData={volunteerData}
          myRequestsCount={myRequests.length}
          raisedRequestsCount={0} // No longer tracked via raisedBy
        />
        <br></br>
        <div className={styles.bentoItem} style={{ gridColumn: 'span 12', padding: 0, background: 'none', border: 'none', boxShadow: 'none' }}>
          <div className={styles.tabs} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              className={`${styles.tab} ${activeTab === 'available' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('available')}
              style={{ background: activeTab === 'available' ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Requests
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'tasks' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('tasks')}
              style={{ background: activeTab === 'tasks' ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Approved Requests ({myRequests.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'in-person' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('in-person')}
              style={{ background: activeTab === 'in-person' ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Contribute In Person
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('profile')}
              style={{ background: activeTab === 'profile' ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              My Profile
            </button>
          </div>
          {activeTab === 'available' && (
            <AvailableRequests
              requests={pendingRequests}
              onApprove={handleApprove}
              onHype={handleHype}
              onUpdate={() => fetchRequests(volunteerData.id)}
              onEdit={setEditingRequest}
              loadingAction={loadingAction}
            />
          )}
          {activeTab === 'tasks' && (
            <MyAcceptedTasks
              requests={myRequests}
              volunteerData={volunteerData}
              onUpdate={() => fetchRequests(volunteerData.id)}
              onEdit={setEditingRequest}
            />
          )}
          {activeTab === 'in-person' && (
            <ContributeInPerson />
          )}
          {activeTab === 'profile' && (
            <VolunteerProfile />
          )}
        </div>
      </div>

      {editingRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          zIndex: 1000,
          padding: '2rem',
          overflowY: 'auto',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '800px' }}>
            <button 
              onClick={() => setEditingRequest(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontWeight: 'bold',
                zIndex: 1001
              }}
            >
              ✕
            </button>
            <VolunteerRequestHelp 
                editData={editingRequest} 
                onCancel={() => {
                    setEditingRequest(null);
                    fetchRequests(volunteerData.id);
                }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;

