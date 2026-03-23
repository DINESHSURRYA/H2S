import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Cursor from './components/Cursor/Cursor';
import Home from './pages/Home';
import User from './pages/User';
import Profile from './pages/Profile';
import styles from './App.module.css';

/**
 * SPA Application Orchestrator.
 * Configures React Router and manages high-level UI composition with custom active cursor.
 */
const App = () => {
  // Use React Router context to enable Single Page Application mechanics
  return (
    <BrowserRouter>
      {/* GH Custom Recursive Cursor Layer */}
      <Cursor />

      {/* Global Interactive Navigation Layer */}
      <Navbar />

      <div className={styles.appContainer}>
        {/* Router configuration for modular context switching */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/user" element={<User />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          MODULAR-SYSTEM ARCHITECTURE • SINGLE PAGE APPLICATION • GH CURSOR
        </p>
      </footer>
    </BrowserRouter>
  );
};

export default App;
