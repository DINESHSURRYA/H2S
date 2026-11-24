import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUnapprovedRequests,
  getRequestsByVolunteer,
  getVolunteerProfile,
  approveHelpRequest,
  voteHype,
} from '../../services/apiService';
import styles from './VolunteerDashboard.module.css';
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
  const [feedback, setFeedback] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [editingRequest, setEditingRequest] = useState(null);

  const showToast = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3500);
  };

  const refreshAll = useCallback(async (volId) => {
    try {
      const [pendingRes, myRes, freshProfile] = await Promise.all([
        getUnapprovedRequests(),
        getRequestsByVolunteer(volId),
        getVolunteerProfile(volId).catch(() => null),
      ]);
      setPendingRequests(pendingRes);
      setMyRequests(myRes);
      if (freshProfile) {
        const normalized = { ...freshProfile, _id: freshProfile._id || freshProfile.id, id: freshProfile.id || freshProfile._id };
        setVolunteerData(normalized);
        localStorage.setItem('volunteerData', JSON.stringify(normalized));
      }
    } catch (err) {
      console.error('Failed to sync volunteer dashboard:', err);
    }
  }, []);

  useEffect(() => {
    const data = localStorage.getItem('volunteerData');
    const token = localStorage.getItem('volunteerToken');
    if (!data || !token) {
      navigate('/volunteer/login');
      return;
    }
    try {
      const parsed = JSON.parse(data);
      const volId = parsed._id || parsed.id;
      if (!volId) {
        navigate('/volunteer/login');
        return;
      }
      const normalized = { ...parsed, _id: volId, id: volId };
      setVolunteerData(normalized);
      refreshAll(volId);
    } catch {
      navigate('/volunteer/login');
    }
  }, [navigate, refreshAll]);

  const volId = volunteerData?._id || volunteerData?.id;

  const handleApprove = async (requestId) => {
    if (!volId) return;
    setLoadingAction(true);
    try {
      await approveHelpRequest(requestId, volId);
      showToast('Crisis validated & moved to NGO mission feed (+10 Trust XP).');
      await refreshAll(volId);
    } catch (err) {
      showToast(err.message || 'Failed to approve request.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleHype = async (requestId, points = 1) => {
    if (!volId) return;
    try {
      await voteHype(requestId, volId, points);
      showToast('Urgency priority boosted!');
      await refreshAll(volId);
    } catch (err) {
      showToast(err.message || 'Failed to boost priority.');
    }
  };

  if (!volunteerData) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1 className={styles.title}>Volunteer Field Interface</h1>
          <p className={styles.subtitle}>
            Responder: {volunteerData.name} • Trust Score: {volunteerData.trustScore || 0} XP
          </p>
        </div>
        <button
          type="button"
          className={styles.primaryActionBtn}
          onClick={() => navigate('/volunteer/request-help')}
        >
          + Raise Crisis Report
        </button>
      </header>

      {feedback && <div className={styles.toastBanner}>{feedback}</div>}

      <div className={styles.bentoGrid}>
        <VolunteerOverview
          volunteerData={volunteerData}
          myRequestsCount={myRequests.length}
          pendingRequestsCount={pendingRequests.length}
        />

        <div className={styles.tabsSection}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'available' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('available')}
            >
              Unvalidated SOS ({pendingRequests.length})
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'tasks' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('tasks')}
            >
              My Missions ({myRequests.length})
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'in-person' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('in-person')}
            >
              Join Field Teams
            </button>
            <button
              type="button"
              className={`${styles.tab} ${activeTab === 'profile' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Skills &amp; Profile
            </button>
          </div>

          {activeTab === 'available' && (
            <AvailableRequests
              requests={pendingRequests}
              onApprove={handleApprove}
              onHype={handleHype}
              onEdit={setEditingRequest}
              loadingAction={loadingAction}
            />
          )}
          {activeTab === 'tasks' && (
            <MyAcceptedTasks
              requests={myRequests}
              volunteerData={volunteerData}
              onUpdate={() => refreshAll(volId)}
              onEdit={setEditingRequest}
              onToast={showToast}
            />
          )}
          {activeTab === 'in-person' && (
            <ContributeInPerson
              volunteerData={volunteerData}
              onJoined={() => refreshAll(volId)}
              onToast={showToast}
            />
          )}
          {activeTab === 'profile' && (
            <VolunteerProfile onProfileSaved={() => refreshAll(volId)} />
          )}
        </div>
      </div>

      {editingRequest && (
        <div className={styles.modalOverlay} onClick={() => setEditingRequest(null)}>
          <div className={styles.modalInner} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setEditingRequest(null)}
              className={styles.modalCloseBtn}
              aria-label="Close edit modal"
            >
              ✕
            </button>
            <VolunteerRequestHelp
              editData={editingRequest}
              onCancel={() => {
                setEditingRequest(null);
                refreshAll(volId);
                showToast('Mission updated successfully!');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;
