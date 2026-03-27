import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createHelpRequest, editHelpRequest } from '../../services/apiService';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import styles from './VolunteerRequestHelp.module.css';
import MapPicker from '../../components/MapPicker/MapPicker';

const VolunteerRequestHelp = ({ editData: propEditData, onCancel }) => {
  const routerLocation = useLocation();
  const editData = propEditData || routerLocation.state?.requestToEdit;

  const [formData, setFormData] = useState({
    crisisDescription: editData?.crisisDescription || '',
  });

  const [requirements, setRequirements] = useState(
    editData?.requirements || [{ itemName: '', quantity: '', description: '' }]
  );

  const [requiredVolunteers, setRequiredVolunteers] = useState(
    editData?.requiredVolunteers || []
  );

  const [location, setLocation] = useState(editData?.location || null);
  const [locationMode, setLocationMode] = useState(editData?.location ? 'map' : null); // Simple heuristic for edit mode
  const [locationError, setLocationError] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequirementChange = (index, e) => {
    const { name, value } = e.target;
    const updatedRequirements = [...requirements];

    if (name === "quantity") {
      updatedRequirements[index][name] =
        value === "" ? "" : Math.max(1, Number(value));
    } else {
      updatedRequirements[index][name] = value;
    }

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

  const addVolunteerRole = () => {
    setRequiredVolunteers([...requiredVolunteers, { role: 'General Manual Labor', count: 1, assignedVolunteers: [] }]);
  };

  const removeVolunteerRole = (index) => {
    setRequiredVolunteers(requiredVolunteers.filter((_, i) => i !== index));
  };

  const handleVolunteerRoleChange = (index, field, value) => {
    const updated = [...requiredVolunteers];
    updated[index][field] = field === 'count' ? Math.max(1, Number(value)) : value;
    setRequiredVolunteers(updated);
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

    const volDataStr = localStorage.getItem('volunteerData');
    if (!volDataStr) {
      setError('Volunteer session expired. Please log in again.');
      return;
    }
    
    let volData;
    try {
      volData = JSON.parse(volDataStr);
      // console.log("volunteer data : " , volData)
    } catch {
      setError('Invalid volunteer session.');
      return;
    }
    
    setError('');
    setSuccessId('');
    setLoadingSubmit(true);

    try {
      const payload = {
        name: volData.name,
        email: volData.email,
        phone: volData.phone || volData.email, 
        crisisDescription: formData.crisisDescription,
        location,
        requirements: requirements.map(req => ({
            ...req,
            quantity: Number(req.quantity) || 0
        })),
        requiredVolunteers: requiredVolunteers.map(rv => ({
            ...rv,
            count: Number(rv.count) || 1
        })),
        volunteerId: volData.id
      };

      if (editData?._id) {
          await editHelpRequest(editData._id, payload);
          alert('Request updated successfully!');
          onCancel?.();
      } else {
          const response = await createHelpRequest(payload);
          setSuccessId(response.requestId);
          setFormData({ crisisDescription: '' });
          setRequirements([{ itemName: '', quantity: '', description: '' }]);
          setRequiredVolunteers([]);
          setLocation(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to process request.');
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
          <p className={styles.subtitle}>Your specialized help request has been created.</p>
          <div className={styles.requestIdBox}>
            <span className={styles.requestIdLabel}>Request ID:</span>
            <span className={styles.requestId}>{successId}</span>
          </div>
          <p className={styles.instructions}>Please save this ID. We automatically securely attached your Volunteer Profile to it.</p>
          <Button onClick={() => setSuccessId('')}>Submit Another Request</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Raise Help Request</h1>
        <p className={styles.subtitle}>Submit an incident that requires public or specialized intervention.</p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.identityNotice}>
          <p>We are using your secure Volunteer Profile to report this condition. Name and contact requirements are automatically retrieved.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.locationGroup}>
            <p className={styles.locationLabel}>Crisis Location (Required)</p>
            
            {!locationMode && !location && (
              <div className={styles.locationSelector}>
                <Button type="button" onClick={() => setLocationMode('live')}>
                  Capture Live Feed
                </Button>
                <div className={styles.orDivider}>OR</div>
                <Button type="button" onClick={() => setLocationMode('map')}>
                  Deploy Map Pin
                </Button>
              </div>
            )}

            {locationMode === 'live' && !location && (
              <div className={styles.locationAction}>
                <p className={styles.modeIndicator}>📡 Active GPS Acquisition</p>
                <Button type="button" onClick={handleGetLocation} disabled={loadingLocation}>
                  {loadingLocation ? 'Acquiring GPS...' : 'Execute Capture Protocol'}
                </Button>
                <Button type="button" className={styles.cancelBtn} onClick={() => setLocationMode(null)}>
                  Abort Method
                </Button>
                {locationError && <p className={styles.locationErrorText}>{locationError}</p>}
              </div>
            )}

            {locationMode === 'map' && !location && (
              <div className={styles.locationAction}>
                <p className={styles.modeIndicator}>🗺️ Manual Coordinate Deployment</p>
                <MapPicker onLocationSelect={(coords) => setLocation(coords)} />
                <Button type="button" className={styles.cancelBtn} onClick={() => setLocationMode(null)}>
                  Abort Method
                </Button>
              </div>
            )}

            {location && (
              <div className={styles.locationSuccess}>
                <div className={styles.successGrid}>
                    <span>📍 {locationMode === 'live' ? 'GPS' : 'Map Pin'} captured: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
                    <button type="button" className={styles.resetLocation} onClick={() => { setLocation(null); setLocationMode(null); }}>
                        Recalibrate Location
                    </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.textareaGroup}>
            <label className={styles.textareaLabel}>Crisis Description & Situation</label>
            <textarea
              name="crisisDescription"
              className={styles.textarea}
              rows="4"
              value={formData.crisisDescription}
              onChange={handleChange}
              placeholder="Provide a detailed operational summary of what requires immediate attention..."
              required
            />
          </div>

          <div className={styles.productsSection}>
            <h3 className={styles.sectionTitle}>Requisition Array</h3>
            {requirements.map((item, index) => (
              <div key={index} className={styles.productCard}>
                <div className={styles.productHeader}>
                  <span className={styles.productCount}>Item Payload #{index + 1}</span>
                  {requirements.length > 1 && (
                    <button type="button" onClick={() => removeRequirement(index)} className={styles.removeBtn}>
                      Remove Record
                    </button>
                  )}
                </div>
                
                <InputField
                  label="Classification Type / Product"
                  name="itemName"
                  value={item.itemName}
                  onChange={(e) => handleRequirementChange(index, e)}
                  placeholder="E.g., Aerial Drone, HAZMAT Teams"
                  required
                />
                
               <InputField
                  label="Units / Quantity"
                  name="quantity"
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleRequirementChange(index, e)}
                  onWheel={(e) => e.target.blur()}                 // ❌ disable scroll
                  onMouseDown={(e) => e.preventDefault()}           // ❌ disable spinner clicks
                  placeholder="E.g., 2"
                  required
                />
                
                <div className={styles.textareaGroup}>
                  <label className={styles.textareaLabel}>Operational Requirement (Reason)</label>
                  <textarea
                    name="description"
                    className={styles.textarea}
                    rows="2"
                    value={item.description}
                    onChange={(e) => handleRequirementChange(index, e)}
                    placeholder="Provide justification data for prioritization..."
                    required
                  />
                </div>
              </div>
            ))}
            
            <button type="button" onClick={addRequirement} className={styles.addBtn}>
              + Append Resource Requirement
            </button>
          </div>

          <div className={styles.productsSection} style={{ marginTop: '2rem' }}>
            <h3 className={styles.sectionTitle}>Manpower Requisition (Specialized Personnel)</h3>
            {requiredVolunteers.map((rv, index) => (
              <div key={index} className={styles.productCard} style={{ borderLeft: '4px solid #6366f1' }}>
                <div className={styles.productHeader}>
                  <span className={styles.productCount}>Volunteer Role #{index + 1}</span>
                  <button type="button" onClick={() => removeVolunteerRole(index)} className={styles.removeBtn}>
                    Remove Role
                  </button>
                </div>
                
                <div className={styles.selectGroup}>
                    <label className={styles.selectLabel}>Specialized Role</label>
                    <select 
                        className={styles.select}
                        value={rv.role}
                        onChange={(e) => handleVolunteerRoleChange(index, 'role', e.target.value)}
                    >
                        <option value="Medical Assistant">Medical Assistant</option>
                        <option value="Search & Rescue">Search & Rescue</option>
                        <option value="Heavy Vehicle Driver">Heavy Vehicle Driver</option>
                        <option value="Logistics Coordinator">Logistics Coordinator</option>
                        <option value="Food & Water Distribution">Food & Water Distribution</option>
                        <option value="Emergency Shelter Support">Emergency Shelter Support</option>
                        <option value="First Aid Responder">First Aid Responder</option>
                        <option value="Communication Specialist">Communication Specialist</option>
                        <option value="General Manual Labor">General Manual Labor</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <InputField
                  label="Required Personnel Count"
                  type="number"
                  min={1}
                  value={rv.count}
                  onChange={(e) => handleVolunteerRoleChange(index, 'count', e.target.value)}
                  placeholder="E.g., 5"
                  required
                />
              </div>
            ))}
            
            <button type="button" onClick={addVolunteerRole} className={styles.addBtn}>
              + Append Manpower Role
            </button>
          </div>

          <div className={styles.submitWrapper}>
            <Button type="submit" disabled={loadingSubmit || !location}>
              {loadingSubmit ? 'Transmitting...' : 'Dispatch Protocol Request'}
            </Button>
            {!location && <p className={styles.helperText}>* GPS validation is actively required to execute</p>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerRequestHelp;

