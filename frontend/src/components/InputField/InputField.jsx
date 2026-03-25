import React from 'react';
import styles from './InputField.module.css';

const InputField = ({ label, type = 'text', name, value, onChange, placeholder, error, required = false }) => {
  return (
    <div className={styles.container}>
      {label && <label className={styles.label} htmlFor={name}>{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
      />
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

export default InputField;
