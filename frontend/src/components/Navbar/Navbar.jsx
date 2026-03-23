import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

/**
 * SPA Navigation Bar component with modular styling.
 * @returns {JSX.Element} - Interactive header with routing links.
 */
const Navbar = () => {
  // Arrow functions for standard modular render logic
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <span className={styles.bracket}>[</span>
        GH-CORE-SPA
        <span className={styles.bracket}>]</span>
      </div>
      <div className={styles.links}>
        <NavLink to="/" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          Home
        </NavLink>
        <NavLink to="/user" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          User Data
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
          Profile Context
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
