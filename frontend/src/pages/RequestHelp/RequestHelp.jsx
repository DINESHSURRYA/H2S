import React, { useState } from 'react';
import { createHelpRequest } from '../../services/apiService';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import styles from './RequestHelp.module.css';

const RequestHelp = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    crisisDescription: '',
  });

  const [requirements, setRequirements] = useState([
    { itemName: '', quantity: '', description: '' }
  ]);

  const [isKnownUser, setIsKnownUser] = useState(false);

  React.useEffect(() => {
    const volDataStr = localStorage.getItem('volunteerData');
    const ngoDataStr = localStorage.getItem('ngoData');
    
    if (volDataStr) {
      try {
        const user = JSON.parse(volDataStr);
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        }));
        setIsKnownUser(true);
      } catch (err) {}
    } else if (ngoDataStr) {
      try {
        const user = JSON.parse(ngoDataStr);
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        }));
        setIsKnownUser(true);
      } catch (err) {}
    }
  }, []);

  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequirementChange = (index, e) => {
    const updatedRequirements = [...requirements];
    updatedRequirements[index][e.target.name] = e.target.value;
    setRequirements(updatedRequirements);
  };

  const addRequirement = () => {
    setRequirements([...requirements, { itemName: '', quantity: '', description: '' }]);
  };

  const removeRequirement = (index) => {
    if (requirements.length > 1) {
      const updatedRequirements = requirements.filter((_, i) => i !== index);
      setRequirements(updatedRequirements);
    }
  };

  const handleGetLocation = () => {
    setLoadingLocation(true);
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLoadingLocation(false);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoadingLocation(false);
        },
        () => {
          setLocationError('Unable to retrieve your location. Please allow location access.');
          setLoadingLocation(false);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      setError('Please provide your GPS location first.');
      return;
    }
    
    setError('');
    setSuccessId('');
    setLoadingSubmit(true);

    try {
      const payload = {
        ...formData,
        location,
        requirements: requirements.map(req => ({
            ...req,
            quantity: Number(req.quantity) || 0
        })),
      };
      
      const response = await createHelpRequest(payload);
      setSuccessId(response.requestId);
      setFormData({
        name: '',
        phone: '',
        email: '',
        crisisDescription: '',
      });
      setRequirements([{ itemName: '', quantity: '', description: '' }]);
      setLocation(null);
    } catch (err) {
      setError(err.message || 'Failed to submit the request. Please try again later.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (successId) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successIcon}>✅</div>
          <h1 className={styles.title}>Request Submitted</h1>
          <p className={styles.subtitle}>Your help request has been successfully registered.</p>
          <div className={styles.requestIdBox}>
            <span className={styles.requestIdLabel}>Request ID:</span>
            <span className={styles.requestId}>{successId}</span>
          </div>
          <p className={styles.instructions}>Please save this ID to track your request later.</p>
          <Button onClick={() => setSuccessId('')}>Submit Another Request</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Request Help</h1>
        <p className={styles.subtitle}>Fill in your details and requirements so we can assist you.</p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <InputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="E.g., Jane Doe"
            required
            disabled={isKnownUser}
          />

          <InputField
            label="Contact Information (Phone)"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 234 567 890"
            required
            disabled={isKnownUser}
          />

          <InputField
            label="Email Address (Optional)"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="jane@example.com"
            disabled={isKnownUser}
          />

          {/* Location Section */}
          <div className={styles.locationGroup}>
            <p className={styles.locationLabel}>Your Location (Required)</p>
            {location ? (
              <div className={styles.locationSuccess}>
                📍 GPS Location Captured: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </div>
            ) : (
              <div className={styles.locationAction}>
                <Button type="button" onClick={handleGetLocation} disabled={loadingLocation}>
                  {loadingLocation ? 'Getting location...' : 'Get My GPS Location'}
                </Button>
                {locationError && <p className={styles.locationErrorText}>{locationError}</p>}
              </div>
            )}
          </div>

          <div className={styles.textareaGroup}>
            <label className={styles.textareaLabel}>Description of Crisis</label>
            <textarea
              name="crisisDescription"
              className={styles.textarea}
              rows="4"
              value={formData.crisisDescription}
              onChange={handleChange}
              placeholder="Describe your current situation and what kind of help you need..."
              required
            />
          </div>

          <div className={styles.productsSection}>
            <h3 className={styles.sectionTitle}>Requested Resources</h3>
            {requirements.map((item, index) => (
              <div key={index} className={styles.productCard}>
                <div className={styles.productHeader}>
                  <span className={styles.productCount}>Item #{index + 1}</span>
                  {requirements.length > 1 && (
                    <button type="button" onClick={() => removeRequirement(index)} className={styles.removeBtn}>
                      Remove
                    </button>
                  )}
                </div>
                
                <InputField
                  label="Product Needed"
                  name="itemName"
                  value={item.itemName}
                  onChange={(e) => handleRequirementChange(index, e)}
                  placeholder="E.g., Medical Kit, Clean Water"
                  required
                />
                
                <InputField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleRequirementChange(index, e)}
                  placeholder="E.g., 5"
                  required
                />
                
                <div className={styles.textareaGroup}>
                  <label className={styles.textareaLabel}>Reason for Need</label>
                  <textarea
                    name="description"
                    className={styles.textarea}
                    rows="2"
                    value={item.description}
                    onChange={(e) => handleRequirementChange(index, e)}
                    placeholder="Briefly explain why this is needed..."
                    required
                  />
                </div>
              </div>
            ))}
            
            <button type="button" onClick={addRequirement} className={styles.addBtn}>
              + Add Another Item
            </button>
          </div>

          <div className={styles.submitWrapper}>
            <Button type="submit" disabled={loadingSubmit || !location}>
              {loadingSubmit ? 'Submitting Request...' : 'Submit Request'}
            </Button>
            {!location && <p className={styles.helperText}>* GPS Location is required to submit</p>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestHelp;

