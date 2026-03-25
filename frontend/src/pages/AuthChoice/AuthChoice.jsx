import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './AuthChoice.module.css';

const AuthChoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname.includes('register');

  const handleChoice = (type) => {
    if (isRegister) {
      navigate(type === 'ngo' ? '/ngo/register' : '/volunteer/register');
    } else {
      navigate(type === 'ngo' ? '/ngo/login' : '/volunteer/login');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{isRegister ? 'Create Account' : 'Sign In'}</h1>
        <p className={styles.subtitle}>Select your account type to proceed</p>
        
        <div className={styles.choices}>
          <button className={styles.choiceBtn} onClick={() => handleChoice('ngo')}>
            <div className={styles.icon}>🏢</div>
            <div className={styles.label}>NGO / Organization</div>
            <div className={styles.desc}>Register your organization to coordinate and lead crisis response.</div>
          </button>
          
          <button className={styles.choiceBtn} onClick={() => handleChoice('volunteer')}>
            <div className={styles.icon}>🤝</div>
            <div className={styles.label}>Volunteer</div>
            <div className={styles.desc}>Join as an individual to offer skills and support where needed.</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthChoice;
