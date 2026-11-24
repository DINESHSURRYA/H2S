import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlatformStats } from '../services/apiService';
import styles from './Home.module.css';

const Home = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getPlatformStats()
      .then((data) => setStats(data))
      .catch(() => setStats(null));
  }, []);

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <span className={styles.badge}>TRUST-VERIFIED CRISIS COORDINATION</span>
        <h1 className={styles.title}>
          Faster, Verified Relief with <span className={styles.highlight}>H2S</span>
        </h1>
        <p className={styles.description}>
          H2S transforms scattered emergency alerts into a structured, multi-layer validated response
          connecting citizens, field volunteers, verified NGOs, and platform administrators in real time.
        </p>

        <div className={styles.ctaRow}>
          <Link to="/request-help" className={styles.primaryCta}>
            Request Emergency Help
          </Link>
          <Link to="/track-request" className={styles.secondaryCta}>
            Track Request Status
          </Link>
          <Link to="/login-choice" className={styles.outlineCta}>
            Responder / NGO Sign In
          </Link>
        </div>
      </section>

      {/* Live Platform Telemetry */}
      <section className={styles.statsSection}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats ? stats.requests.total : '—'}</span>
          <span className={styles.statLabel}>Total Crisis Reports</span>
          <span className={styles.statSub}>
            {stats ? `${stats.requests.pending} pending • ${stats.requests.resolved} resolved` : 'Connecting...'}
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats ? stats.ngos.active : '—'}</span>
          <span className={styles.statLabel}>Verified NGOs</span>
          <span className={styles.statSub}>
            {stats ? `${stats.ngos.total} total registered` : 'Connecting...'}
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats ? stats.volunteers.active : '—'}</span>
          <span className={styles.statLabel}>Active Volunteers</span>
          <span className={styles.statSub}>Aadhaar-linked field network</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats ? stats.grants.totalUnitsAllocated : '—'}</span>
          <span className={styles.statLabel}>Relief Units Allocated</span>
          <span className={styles.statSub}>
            {stats ? `${stats.grants.deliveredCount} verified deliveries` : 'Connecting...'}
          </span>
        </div>
      </section>

      {/* 4-Tier Trust Architecture */}
      <section className={styles.rolesSection}>
        <h2 className={styles.sectionHeading}>4-Tier Trust Hierarchy</h2>
        <div className={styles.rolesGrid}>
          <div className={styles.roleCard}>
            <div className={styles.roleIcon}>🚨</div>
            <h3>Public Citizens</h3>
            <p>Submit GPS-pinned emergency requests with itemized needs and track delivery progress live.</p>
          </div>
          <div className={styles.roleCard}>
            <div className={styles.roleIcon}>🤝</div>
            <h3>Field Volunteers</h3>
            <p>Verify public SOS alerts on the ground, raise priority scores, join skill-gated rescue teams, and confirm deliveries.</p>
          </div>
          <div className={styles.roleCard}>
            <div className={styles.roleIcon}>🏢</div>
            <h3>Verified NGOs</h3>
            <p>Allocate exact quantities of relief supplies to validated crises and certify volunteer field skills.</p>
          </div>
          <div className={styles.roleCard}>
            <div className={styles.roleIcon}>🛡️</div>
            <h3>Platform Admins</h3>
            <p>Approve NGO organizations, audit live crises, manage trust governance, and safeguard system integrity.</p>
          </div>
        </div>
      </section>

      {/* Pipeline Overview */}
      <section className={styles.pipelineSection}>
        <h2 className={styles.sectionHeading}>Crisis-to-Delivery Pipeline</h2>
        <div className={styles.pipelineSteps}>
          <div className={styles.step}>
            <span className={styles.stepNum}>01</span>
            <h4>SOS Reported</h4>
            <p>Citizen pins GPS location &amp; lists supplies needed.</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNum}>02</span>
            <h4>Field Validation</h4>
            <p>Volunteer confirms legitimacy &amp; boosts priority.</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNum}>03</span>
            <h4>NGO Allocation</h4>
            <p>Verified NGOs pledge partial or full supply units.</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNum}>04</span>
            <h4>Verified Delivery</h4>
            <p>Field team confirms receipt &amp; earns Trust XP.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
