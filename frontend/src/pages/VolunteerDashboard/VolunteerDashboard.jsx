import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPendingRequests, getVolunteerRequests, getVolunteerRaisedRequests, approveHelpRequest } from '../../services/apiService';
import styles from './VolunteerDashboard.module.css';
import Button from '../../components/Button/Button';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
  const [volunteerData, setVolunteerData] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [raisedRequests, setRaisedRequests] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);

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
      const [pendingRes, myRes, raisedRes] = await Promise.all([
        getPendingRequests(),
        getVolunteerRequests(volId),
        getVolunteerRaisedRequests(volId)
      ]);
      setPendingRequests(pendingRes);
      setMyRequests(myRes);
      setRaisedRequests(raisedRes);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  };

  const handleApprove = async (requestId) => {
    if (!volunteerData) return;
    setLoadingAction(true);
    try {
      await approveHelpRequest(requestId, volunteerData.id);
      await fetchRequests(volunteerData.id); // Refresh lists
    } catch (err) {
      alert('Failed to approve request.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('volunteerToken');
    localStorage.removeItem('volunteerData');
    navigate('/volunteer/login');
  };

  if (!volunteerData) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1 className={styles.title}>Volunteer Dashboard</h1>
          <p className={styles.subtitle}>Welcome back, {volunteerData.name}</p>
        </div>
        <Button onClick={handleLogout}>Log Out</Button>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>My Profile</h2>
          <div className={styles.dataRow}>
            <span className={styles.label}>Email:</span>
            <span className={styles.value}>{volunteerData.email}</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.label}>Status:</span>
            <span className={`${styles.statusBadge} ${styles[volunteerData.status] || ''}`}>
              {volunteerData.status}
            </span>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Activity Summary</h2>
          <div className={styles.statsContainer}>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{myRequests.length}</span>
              <span className={styles.statLabel}>Tasks Accepted</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{raisedRequests.length}</span>
              <span className={styles.statLabel}>Requests Raised</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.mainContent}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Requests Raised by Me</h2>
          {raisedRequests.length === 0 ? (
            <p className={styles.placeholderText}>You have not raised any help requests yet.</p>
          ) : (
            <div className={styles.requestList}>
              {raisedRequests.map((req) => (
                <div key={req._id} className={styles.requestItem}>
                  <div className={styles.requestHeader}>
                    <span className={styles.requestName}>Operational ID: {req._id}</span>
                    <span className={styles.requestLocation}>📍 {req.location?.latitude.toFixed(4)}, {req.location?.longitude.toFixed(4)}</span>
                  </div>
                  <p className={styles.requestDesc}>{req.description}</p>
                  <div className={styles.statusRow}>
                    <span className={`${styles.statusBadge} ${styles[req.status] || ''}`}>
                      {req.status}
                    </span>
                    <span className={styles.submissionDate}>Created: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.card} style={{ marginTop: '1.5rem' }}>
          <h2 className={styles.cardTitle}>My Approved Tasks</h2>
          {myRequests.length === 0 ? (
            <p className={styles.placeholderText}>You have not accepted any tasks yet.</p>
          ) : (
            <div className={styles.requestList}>
              {myRequests.map((req) => (
                <div key={req._id} className={styles.requestItem}>
                  <div className={styles.requestHeader}>
                    <span className={styles.requestName}>{req.name}</span>
                    <span className={styles.requestLocation}>📍 {req.location?.latitude.toFixed(4)}, {req.location?.longitude.toFixed(4)}</span>
                  </div>
                  <p className={styles.requestDesc}>{req.description}</p>
                  <div className={styles.productTags}>
                    {req.products?.map((p, idx) => (
                      <span key={idx} className={styles.tag}>{p.quantity} {p.product}</span>
                    ))}
                  </div>
                  <div className={styles.requestFooter}>
                    <span className={styles.contactInfo}>📞 {req.contactInfo}</span>
                    <span className={`${styles.statusBadge} ${styles.inProgress}`}>In Progress</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.card} style={{ marginTop: '1.5rem' }}>
          <h2 className={styles.cardTitle}>Available Help Requests</h2>
          {pendingRequests.length === 0 ? (
            <p className={styles.placeholderText}>There are no pending requests right now.</p>
          ) : (
            <div className={styles.requestList}>
              {pendingRequests.map((req) => (
                <div key={req._id} className={styles.requestItem}>
                  <div className={styles.requestHeader}>
                    <span className={styles.requestName}>{req.name}</span>
                    <span className={styles.requestLocation}>📍 {req.location?.latitude.toFixed(4)}, {req.location?.longitude.toFixed(4)}</span>
                  </div>
                  <p className={styles.requestDesc}>{req.description}</p>
                  <div className={styles.productTags}>
                    {req.products?.map((p, idx) => (
                      <span key={idx} className={styles.tag}>{p.quantity} {p.product}</span>
                    ))}
                  </div>
                  <div className={styles.requestFooter}>
                    <span className={styles.contactInfo}>📞 {req.contactInfo}</span>
                    <Button 
                      onClick={() => handleApprove(req._id)} 
                      disabled={loadingAction}
                    >
                      {loadingAction ? '...' : 'Approve & Accept'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
