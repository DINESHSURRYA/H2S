import React from 'react';
import styles from './VolunteerDashboard.module.css';

const DashboardSidebar = ({ isVisible, menuItems, activeView, onViewChange }) => {
  return (
    <div className={`${styles.sidebar} ${!isVisible ? styles.collapsedSidebar : ''}`}>
      <nav className={styles.sideNav}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navButton} ${activeView === item.id ? styles.activeNav : ''}`}
            onClick={() => onViewChange(item.id)}
          >
            <span className={styles.navIcon}>
              {item.id === 'overview' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>}
              {item.id === 'available' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>}
              {item.id === 'accepted' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>}
              {item.id === 'raised' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>}
            </span>
            <span className={styles.navLabel}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default DashboardSidebar;
