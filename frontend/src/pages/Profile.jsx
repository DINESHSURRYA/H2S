import React from 'react';
import { useFetch } from '../hooks/useFetch';
import { getProfile } from '../services/apiService';
import ProfileCard from '../components/ProfileCard/ProfileCard';
import Loader from '../components/Loader/Loader';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';

/**
 * Top-level page for Profile management using ES6 standards.
 * @returns {JSX.Element} - Orchestrates fetching and UI mapping.
 */
const Profile = () => {
  // fetching profile data + refetch function (no hard reloads)
  const { data, loading, err, refetch } = useFetch(getProfile);

  return (
    <section>
      {/* Visual feedback layer managed internally by useFetch states */}
      {loading && !data && <Loader />}
      
      {/* Error handling for sync failures */}
      {err && <ErrorMessage message={err} />}
      
      {/* Component injection with refetch capability */}
      {!err && data && (
        <ProfileCard 
          profile={data} 
          onRefresh={refetch} 
          isSyncing={loading}
        />
      )}
    </section>
  );
};

export default Profile;
