import React from 'react';
import { useFetch } from '../hooks/useFetch';
import { getUser } from '../services/apiService';
import UserCard from '../components/UserCard/UserCard';
import Loader from '../components/Loader/Loader';
import ErrorMessage from '../components/ErrorMessage/ErrorMessage';

/**
 * Top-level page for User context using ES6 standards.
 * @returns {JSX.Element} - Orchestrates fetching and UI mapping.
 */
const User = () => {
  // Use arrow function destructuring to pull fetch states
  const { data, loading, err } = useFetch(getUser);

  return (
    <section>
      {/* Modular Loader injection (Separation of concerns) */}
      {loading && <Loader />}
      
      {/* Modular Error notification (Global standards) */}
      {err && <ErrorMessage message={err} />}
      
      {/* Independent Component Injection (Functional decoupling) */}
      {!loading && !err && data && (
        <UserCard user={data} />
      )}
    </section>
  );
};

export default User;
