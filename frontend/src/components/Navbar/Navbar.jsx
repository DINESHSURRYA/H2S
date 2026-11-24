import React from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import styles from './Navbar.module.css';

const ADMIN_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/admin`;

const getCurrentRole = () => {
  if (localStorage.getItem('volunteerToken')) return 'volunteer';
  if (localStorage.getItem('ngoToken')) return 'ngo';
  return null;
};

const Navbar = () => {
  const navigate = useNavigate();
  // Subscribe to route transitions so role updates cleanly after login/register redirects
  useLocation();
  const userRole = getCurrentRole();

  const handleLogout = () => {
    localStorage.removeItem('volunteerToken');
    localStorage.removeItem('volunteerData');
    localStorage.removeItem('ngoToken');
    localStorage.removeItem('ngoData');
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        <span className={styles.bracket}>[</span>
        H2S-CRISIS-MGT
        <span className={styles.bracket}>]</span>
      </Link>

      <div className={styles.links}>
        <NavLink to="/" end className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          Home
        </NavLink>

        {!userRole && (
          <NavLink to="/request-help" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            Request Help
          </NavLink>
        )}

        <NavLink to="/track-request" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          Track Request
        </NavLink>

        {userRole === 'volunteer' && (
          <NavLink
            to="/volunteer/request-help"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Raise Request
          </NavLink>
        )}

        {!userRole && (
          <>
            <NavLink
              to="/register-choice"
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              Register
            </NavLink>
            <NavLink to="/login-choice" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
              Login
            </NavLink>
            <a href={ADMIN_URL} target="_blank" rel="noreferrer" className={styles.adminLink}>
              Admin Panel
            </a>
          </>
        )}

        {userRole === 'ngo' && (
          <NavLink to="/ngo/dashboard" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            NGO Hub
          </NavLink>
        )}

        {userRole === 'volunteer' && (
          <NavLink
            to="/volunteer/dashboard"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            Volunteer Hub
          </NavLink>
        )}

        {userRole && (
          <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
