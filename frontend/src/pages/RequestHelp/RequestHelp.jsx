import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createHelpRequest } from '../../services/apiService';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import styles from './RequestHelp.module.css';
import MapPicker from '../../components/MapPicker/MapPicker';

const CATEGORIES = ['Food & Water', 'Medical', 'Rescue', 'Shelter', 'Logistics', 'Other'];

const RequestHelp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'Food & Water',
    urgency: 'high',
    affectedCount: 1,
    crisisDescription: '',
  });

  const [requirements, setRequirements] = useState([
    { itemName: '', quantity: '', description: '' },
  ]);

  const [isKnownUser, setIsKnownUser] = useState(false);

  useEffect(() => {
    const volDataStr = localStorage.getItem('volunteerData');
    const ngoDataStr = localStorage.getItem('ngoData');

    const raw = volDataStr || ngoDataStr;
    if (raw) {
      try {
        const user = JSON.parse(raw);
        setFormData((prev) => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        }));
        setIsKnownUser(true);
      } catch {
        // Ignore malformed storage
      }
    }
  }, []);

  const [location, setLocation] = useState(null);
  const [locationMode, setLocationMode] = useState(null);
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
      setRequirements(requirements.filter((_, i) => i !== index));
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
          setLocationError('Unable to retrieve your location. Please allow location access or pin on the map.');
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
        affectedCount: Math.max(1, Number(formData.affectedCount) || 1),
        location,
        requirements: requirements.map((req) => ({
          ...req,
          quantity: Math.max(1, Number(req.quantity) || 1),
        })),
      };

      const response = await createHelpRequest(payload);
      setSuccessId(response.requestId);
      setFormData((prev) => ({
        ...prev,
        crisisDescription: '',
        affectedCount: 1,
      }));
      setRequirements([{ itemName: '', quantity: '', description: '' }]);
      setLocation(null);
      setLocationMode(null);
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
          <p className={styles.subtitle}>Your help request has been registered and queued for field validation.</p>
          <div className={styles.requestIdBox}>
            <span className={styles.requestIdLabel}>Tracking Request ID:</span>
            <span className={styles.requestId}>{successId}</span>
          </div>
          <p className={styles.instructions}>
            Save this ID to monitor validation, NGO supply pledges, and confirmed delivery in real time.
          </p>
          <div className={styles.successActions}>
            <Button onClick={() => navigate(`/track-request/${successId}`)}>Track This Request</Button>
            <Button className={styles.cancelBtn} onClick={() => setSuccessId('')}>
              Submit Another Request
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Request Emergency Help</h1>
        <p className={styles.subtitle}>Pin your location and list the supplies required so field teams can respond.</p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <InputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="E.g., Arjun Kumar"
            required
            disabled={isKnownUser}
          />

          <InputField
            label="Contact Information (Phone)"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98400 11223"
            required
            disabled={isKnownUser}
          />

          <InputField
            label="Email Address (Optional)"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            disabled={isKnownUser}
          />

          <div className={styles.metaGrid}>
            <div className={styles.selectGroup}>
              <label className={styles.textareaLabel} htmlFor="category">
                Crisis Category
              </label>
              <select
                id="category"
                name="category"
                className={styles.select}
                value={formData.category}
                onChange={handleChange}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.selectGroup}>
              <label className={styles.textareaLabel} htmlFor="urgency">
                Urgency Level
              </label>
              <select
                id="urgency"
                name="urgency"
                className={styles.select}
                value={formData.urgency}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical (Life-Threatening)</option>
              </select>
            </div>

            <InputField
              label="People Affected"
              name="affectedCount"
              type="number"
              min={1}
              value={formData.affectedCount}
              onChange={handleChange}
              required
            />
          </div>

          {/* Location Section */}
          <div className={styles.locationGroup}>
            <p className={styles.locationLabel}>Your Location (Required)</p>

            {!locationMode && !location && (
              <div className={styles.locationSelector}>
                <Button type="button" onClick={() => setLocationMode('live')}>
                  Take Live Location
                </Button>
                <div className={styles.orDivider}>OR</div>
                <Button type="button" onClick={() => setLocationMode('map')}>
                  Pin in Map
                </Button>
              </div>
            )}

            {locationMode === 'live' && !location && (
              <div className={styles.locationAction}>
                <p className={styles.modeIndicator}>📡 Live GPS Mode</p>
                <Button type="button" onClick={handleGetLocation} disabled={loadingLocation}>
                  {loadingLocation ? 'Getting location...' : 'Activate GPS Capture'}
                </Button>
                <Button type="button" className={styles.cancelBtn} onClick={() => setLocationMode(null)}>
                  Change Method
                </Button>
                {locationError && <p className={styles.locationErrorText}>{locationError}</p>}
              </div>
            )}

            {locationMode === 'map' && !location && (
              <div className={styles.locationAction}>
                <p className={styles.modeIndicator}>🗺️ Manual Pin Mode</p>
                <MapPicker onLocationSelect={(coords) => setLocation(coords)} />
                <Button type="button" className={styles.cancelBtn} onClick={() => setLocationMode(null)}>
                  Change Method
                </Button>
              </div>
            )}

            {location && (
              <div className={styles.locationSuccess}>
                <div className={styles.successGrid}>
                  <span>
                    📍 {locationMode === 'live' ? 'GPS' : 'Map Pin'} captured: {location.latitude.toFixed(4)},{' '}
                    {location.longitude.toFixed(4)}
                  </span>
                  <button
                    type="button"
                    className={styles.resetLocation}
                    onClick={() => {
                      setLocation(null);
                      setLocationMode(null);
                    }}
                  >
                    Edit Location
                  </button>
                </div>
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
              placeholder="Describe the situation, accessibility, and immediate hazards..."
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
                  label="Resource / Supply Needed"
                  name="itemName"
                  value={item.itemName}
                  onChange={(e) => handleRequirementChange(index, e)}
                  placeholder="E.g., Medical Kit, Clean Water Cans"
                  required
                />

                <InputField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  min={1}
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
                    placeholder="Briefly explain why this item is urgently needed..."
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
              {loadingSubmit ? 'Submitting Request...' : 'Submit Emergency Request'}
            </Button>
            {!location && <p className={styles.helperText}>* GPS or Map Pin location is required to submit</p>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestHelp;
