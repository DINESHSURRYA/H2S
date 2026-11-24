import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';

import Home from './pages/Home';
import NgoRegister from './pages/NgoRegister/NgoRegister';
import NgoLogin from './pages/NgoLogin/NgoLogin';
import VolunteerRegister from './pages/VolunteerRegister/VolunteerRegister';
import VolunteerLogin from './pages/VolunteerLogin/VolunteerLogin';
import AuthChoice from './pages/AuthChoice/AuthChoice';
import RequestHelp from './pages/RequestHelp/RequestHelp';
import TrackRequest from './pages/TrackRequest/TrackRequest';
import NgoDashboard from './pages/NgoDashboard/NgoDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard/VolunteerDashboard';
import VolunteerRequestHelp from './pages/VolunteerRequestHelp/VolunteerRequestHelp';
import styles from './App.module.css';

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />

      <div className={styles.appContainer}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/request-help" element={<RequestHelp />} />
          <Route path="/track-request" element={<TrackRequest />} />
          <Route path="/track-request/:id" element={<TrackRequest />} />
          <Route path="/register-choice" element={<AuthChoice />} />
          <Route path="/login-choice" element={<AuthChoice />} />
          <Route path="/ngo/register" element={<NgoRegister />} />
          <Route path="/ngo/login" element={<NgoLogin />} />
          <Route path="/ngo/dashboard" element={<NgoDashboard />} />
          <Route path="/volunteer/register" element={<VolunteerRegister />} />
          <Route path="/volunteer/login" element={<VolunteerLogin />} />
          <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
          <Route path="/volunteer/request-help" element={<VolunteerRequestHelp />} />
        </Routes>
      </div>

      <footer className={styles.footer}>
        <p className={styles.footerText}>
          H2S • SMART CRISIS MANAGEMENT SYSTEM • TRUST-VERIFIED DISASTER COORDINATION
        </p>
      </footer>
    </BrowserRouter>
  );
};

export default App;
