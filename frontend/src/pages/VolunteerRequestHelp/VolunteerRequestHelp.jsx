import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createHelpRequest, editHelpRequest } from '../../services/apiService';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import styles from './VolunteerRequestHelp.module.css';
import MapPicker from '../../components/MapPicker/MapPicker';

const CATEGORIES = ['Food & Water', 'Medical', 'Rescue', 'Shelter', 'Logistics', 'Other'];
const VOLUNTEER_ROLES = [
  'Medical Assistant',
  'Search & Rescue',
  'Heavy Vehicle Driver',
  'Logistics Coordinator',
  'Food & Water Distribution',
  'Emergency Shelter Support',
  'First Aid Responder',
  'Communication Specialist',
  'General Manual Labor',
];

const VolunteerRequestHelp = ({ editData: propEditData, onCancel }) => {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const editData = propEditData || routerLocation.state?.requestToEdit;
  const isEditMode = Boolean(editData?._id);

  const [formData, setFormData] = useState({
    crisisDescription: editData?.crisisDescription || '',
    category: editData?.category || 'Medical',
    urgency: editData?.urgency || 'high',
    affectedCount: editData?.affectedCount || 5,
  });

  const [requirements, setRequirements] = useState(
    editData?.requirements?.length
      ? editData.requirements.map((r) => ({
          ...(r._id ? { _id: r._id } : {}),
          itemName: r.itemName || '',
          quantity: r.quantity || 1,
          description: r.description || '',
        }))
      : [{ itemName: '', quantity: 1, description: '' }]
  );

  const [requiredVolunteers, setRequiredVolunteers] = useState(
    editData?.requiredVolunteers?.length
      ? editData.requiredVolunteers.map((rv) => ({
          ...(rv._id ? { _id: rv._id } : {}),
          role: rv.role || 'General Manual Labor',
          count: rv.count || 1,
          assignedVolunteers: (rv.assignedVolunteers || []).map((v) => v?._id || v),
        }))
      : []
  );

  const [location, setLocation] = useState(editData?.location || null);
  const [locationMode, setLocationMode] = useState(editData?.location ? 'map' : null);
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
    const updated = [...requirements];
    if (name === 'quantity') {
      updated[index][name] = value === '' ? '' : Math.max(1, Number(value));
    } else {
      updated[index][name] = value;
    }
    setRequirements(updated);
  };

  const addRequirement = () => {
    setRequirements([...requirements, { itemName: '', quantity: 1, description: '' }]);
  };

  const removeRequirement = (index) => {
    if (requirements.length > 1) {
      setRequirements(requirements.filter((_, i) => i !== index));
    }
  };

  const addVolunteerRole = () => {
    setRequiredVolunteers([
      ...requiredVolunteers,
      { role: 'Medical Assistant', count: 1, assignedVolunteers: [] },
    ]);
  };

  const removeVolunteerRole = (index) => {
    setRequiredVolunteers(requiredVolunteers.filter((_, i) => i !== index));
  };

  const handleVolunteerRoleChange = (index, field, value) => {
    const updated = [...requiredVolunteers];
    updated[index][field] = field === 'count' ? Math.max(1, Number(value) || 1) : value;
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
          setLocationError('Unable to retrieve your location. Please allow location access or deploy a map pin.');
          setLoadingLocation(false);
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      setError('Please provide the crisis GPS coordinates first.');
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
    } catch {
      setError('Invalid volunteer session.');
      return;
    }

    const volunteerId = volData._id || volData.id;
    if (!volunteerId) {
      setError('Volunteer ID missing from session. Please log in again.');
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
        category: formData.category,
        urgency: formData.urgency,
        affectedCount: Math.max(1, Number(formData.affectedCount) || 1),
        location,
        requirements: requirements.map((req) => ({
          ...req,
          quantity: Math.max(1, Number(req.quantity) || 1),
        })),
        requiredVolunteers: requiredVolunteers.map((rv) => ({
          ...rv,
          count: Math.max(1, Number(rv.count) || 1),
        })),
        volunteerId,
      };

      if (isEditMode) {
        await editHelpRequest(editData._id, payload);
        onCancel?.();
      } else {
        const response = await createHelpRequest(payload);
        setSuccessId(response.requestId);
        setFormData({ crisisDescription: '', category: 'Medical', urgency: 'high', affectedCount: 5 });
        setRequirements([{ itemName: '', quantity: 1, description: '' }]);
        setRequiredVolunteers([]);
        setLocation(null);
        setLocationMode(null);
      }
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to process request.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (successId) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successIcon}>✅</div>
          <h1 className={styles.title}>Field Report Dispatched</h1>
          <p className={styles.subtitle}>
            Your verified volunteer crisis request is live immediately for NGO resource allocation (+10 Trust XP).
          </p>
          <div className={styles.requestIdBox}>
            <span className={styles.requestIdLabel}>Mission Request ID:</span>
            <span className={styles.requestId}>{successId}</span>
          </div>
          <div className={styles.submitWrapper}>
            <Button onClick={() => navigate(`/track-request/${successId}`)}>Open Live Tracker</Button>
            <Button className={styles.cancelBtn} onClick={() => setSuccessId('')}>
              Submit Another Report
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{isEditMode ? 'Edit Crisis Request' : 'Raise Field Help Request'}</h1>
        <p className={styles.subtitle}>
          {isEditMode
            ? 'Update crisis priority, supply requisitions, or specialized manpower roles.'
            : 'Volunteer reports are auto-validated and immediately visible to verified NGOs.'}
        </p>

        {error && <div className={styles.errorBanner}>{error}</div>}

        {!isEditMode && (
          <div className={styles.identityNotice}>
            <p>
              Reporting under your authenticated Volunteer Profile — automatic field validation &amp; Trust XP enabled.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.selectGroup}>
            <label className={styles.selectLabel}>Crisis Category</label>
            <select name="category" className={styles.select} value={formData.category} onChange={handleChange}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.selectGroup}>
            <label className={styles.selectLabel}>Urgency Severity</label>
            <select name="urgency" className={styles.select} value={formData.urgency} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical (Immediate Dispatch)</option>
            </select>
          </div>

          <InputField
            label="Estimated Affected Individuals"
            name="affectedCount"
            type="number"
            min={1}
            value={formData.affectedCount}
            onChange={handleChange}
            required
          />

          <div className={styles.locationGroup}>
            <p className={styles.locationLabel}>Crisis Location (Required)</p>

            {!locationMode && !location && (
              <div className={styles.locationSelector}>
                <Button type="button" onClick={() => setLocationMode('live')}>
                  Capture Live GPS
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
                  {loadingLocation ? 'Acquiring GPS...' : 'Capture Coordinates'}
                </Button>
                <Button type="button" className={styles.cancelBtn} onClick={() => setLocationMode(null)}>
                  Change Method
                </Button>
                {locationError && <p className={styles.locationErrorText}>{locationError}</p>}
              </div>
            )}

            {locationMode === 'map' && !location && (
              <div className={styles.locationAction}>
                <p className={styles.modeIndicator}>🗺️ Manual Coordinate Deployment</p>
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
                    Recalibrate Location
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.textareaGroup}>
            <label className={styles.textareaLabel}>Crisis Description &amp; Situation</label>
            <textarea
              name="crisisDescription"
              className={styles.textarea}
              rows="4"
              value={formData.crisisDescription}
              onChange={handleChange}
              placeholder="Provide a clear field assessment of what requires immediate attention..."
              required
            />
          </div>

          <div className={styles.productsSection}>
            <h3 className={styles.sectionTitle}>Supply Requisitions</h3>
            {requirements.map((item, index) => (
              <div key={index} className={styles.productCard}>
                <div className={styles.productHeader}>
                  <span className={styles.productCount}>Resource #{index + 1}</span>
                  {requirements.length > 1 && (
                    <button type="button" onClick={() => removeRequirement(index)} className={styles.removeBtn}>
                      Remove
                    </button>
                  )}
                </div>

                <InputField
                  label="Supply / Equipment Name"
                  name="itemName"
                  value={item.itemName}
                  onChange={(e) => handleRequirementChange(index, e)}
                  placeholder="E.g., Trauma Kit, Water Cans, Solar Lanterns"
                  required
                />

                <InputField
                  label="Units / Quantity"
                  name="quantity"
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => handleRequirementChange(index, e)}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="E.g., 5"
                  required
                />

                <div className={styles.textareaGroup}>
                  <label className={styles.textareaLabel}>Operational Justification</label>
                  <textarea
                    name="description"
                    className={styles.textarea}
                    rows="2"
                    value={item.description}
                    onChange={(e) => handleRequirementChange(index, e)}
                    placeholder="Why is this supply needed on site?"
                    required
                  />
                </div>
              </div>
            ))}

            <button type="button" onClick={addRequirement} className={styles.addBtn}>
              + Append Resource Requirement
            </button>
          </div>

          <div className={styles.productsSection}>
            <h3 className={styles.sectionTitle}>Specialized Manpower Needed</h3>
            {requiredVolunteers.map((rv, index) => (
              <div key={index} className={styles.productCard}>
                <div className={styles.productHeader}>
                  <span className={styles.productCount}>Volunteer Role #{index + 1}</span>
                  <button type="button" onClick={() => removeVolunteerRole(index)} className={styles.removeBtn}>
                    Remove Role
                  </button>
                </div>

                <div className={styles.selectGroup}>
                  <label className={styles.selectLabel}>Required Verified Skill</label>
                  <select
                    className={styles.select}
                    value={rv.role}
                    onChange={(e) => handleVolunteerRoleChange(index, 'role', e.target.value)}
                  >
                    {VOLUNTEER_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <InputField
                  label="Personnel Count"
                  name={`role-count-${index}`}
                  type="number"
                  min={1}
                  value={rv.count}
                  onChange={(e) => handleVolunteerRoleChange(index, 'count', e.target.value)}
                  placeholder="E.g., 3"
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
              {loadingSubmit ? 'Saving...' : isEditMode ? 'Save Mission Changes' : 'Dispatch Verified Request'}
            </Button>
            {isEditMode && onCancel && (
              <Button type="button" className={styles.cancelBtn} onClick={onCancel}>
                Cancel
              </Button>
            )}
            {!location && <p className={styles.helperText}>* GPS or Map Pin location is required</p>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default VolunteerRequestHelp;
