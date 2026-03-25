import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

/**
 * SPA Navigation Bar component with modular styling.
 * @returns {JSX.Element} - Interactive header with routing links.
 */
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('volunteerToken')) {
      setUserRole('volunteer');
    } else if (localStorage.getItem('ngoToken')) {
      setUserRole('ngo');
    } else {
      setUserRole(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('volunteerToken');
    localStorage.removeItem('volunteerData');
    localStorage.removeItem('ngoToken');
    localStorage.removeItem('ngoData');
    navigate('/');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <span className={styles.bracket}>[</span>
        H2S-CRISIS-MGT
        <span className={styles.bracket}>]</span>
      </div>
      <div className={styles.links}>
        <NavLink to="/" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          Home
        </NavLink>
        
        {!userRole && (
          <NavLink to="/request-help" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            Request Help
          </NavLink>
        )}
        
        {userRole === 'volunteer' && (
          <NavLink to="/volunteer/request-help" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            Raise Help Request
          </NavLink>
        )}
        
        {!userRole && (
          <>
            <NavLink to="/register-choice" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
              Register
            </NavLink>
            <NavLink to="/login-choice" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
              Login
            </NavLink>
          </>
        )}

        {userRole === 'ngo' && (
          <NavLink to="/ngo/dashboard" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            NGO Dashboard
          </NavLink>
        )}

        {userRole === 'volunteer' && (
          <NavLink to="/volunteer/dashboard" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            My Dashboard
          </NavLink>
        )}

        {userRole && (
          <button onClick={handleLogout} className={styles.link} style={{background: 'none', border: 'none', cursor: 'pointer'}}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
