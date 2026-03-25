import React, { useState } from 'react';
import { createHelpRequest } from '../../services/apiService';
import InputField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';
import styles from './VolunteerRequestHelp.module.css';

const VolunteerRequestHelp = () => {
  const [formData, setFormData] = useState({
    description: '',
  });

  const [products, setProducts] = useState([
    { product: '', quantity: '', reason: '' }
  ]);

  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');
  const [successId, setSuccessId] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProductChange = (index, e) => {
    const updatedProducts = [...products];
    updatedProducts[index][e.target.name] = e.target.value;
    setProducts(updatedProducts);
  };

  const addProduct = () => {
    setProducts([...products, { product: '', quantity: '', reason: '' }]);
  };

  const removeProduct = (index) => {
    if (products.length > 1) {
      const updatedProducts = products.filter((_, i) => i !== index);
      setProducts(updatedProducts);
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
    
    setError('');
    setSuccessId('');
    setLoadingSubmit(true);

    try {
      // Auto-populate identity from volunteer session
      const payload = {
        name: volData.name,
        email: volData.email,
        contactInfo: volData.phone || volData.email, 
        description: formData.description,
        location,
        products,
        raisedBy: volData.id,
      };
      
      const response = await createHelpRequest(payload);
      setSuccessId(response.requestId);
      setFormData({
        description: '',
      });
      setProducts([{ product: '', quantity: '', reason: '' }]);
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
            {location ? (
              <div className={styles.locationSuccess}>
                📍 GPS Location Captured: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </div>
            ) : (
              <div className={styles.locationAction}>
                <Button type="button" onClick={handleGetLocation} disabled={loadingLocation}>
                  {loadingLocation ? 'Acquiring GPS...' : 'Capture Coordinate Feed'}
                </Button>
                {locationError && <p className={styles.locationErrorText}>{locationError}</p>}
              </div>
            )}
          </div>

          <div className={styles.textareaGroup}>
            <label className={styles.textareaLabel}>Crisis Description & Situation</label>
            <textarea
              name="description"
              className={styles.textarea}
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide a detailed operational summary of what requires immediate attention..."
              required
            />
          </div>

          <div className={styles.productsSection}>
            <h3 className={styles.sectionTitle}>Requisition Array</h3>
            {products.map((item, index) => (
              <div key={index} className={styles.productCard}>
                <div className={styles.productHeader}>
                  <span className={styles.productCount}>Item Payload #{index + 1}</span>
                  {products.length > 1 && (
                    <button type="button" onClick={() => removeProduct(index)} className={styles.removeBtn}>
                      Remove Record
                    </button>
                  )}
                </div>
                
                <InputField
                  label="Classification Type / Product"
                  name="product"
                  value={item.product}
                  onChange={(e) => handleProductChange(index, e)}
                  placeholder="E.g., Aerial Drone, HAZMAT Teams"
                  required
                />
                
                <InputField
                  label="Units / Quantity"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) => handleProductChange(index, e)}
                  placeholder="E.g., 2 units, 1 squad"
                  required
                />
                
                <div className={styles.textareaGroup}>
                  <label className={styles.textareaLabel}>Operational Requirement (Reason)</label>
                  <textarea
                    name="reason"
                    className={styles.textarea}
                    rows="2"
                    value={item.reason}
                    onChange={(e) => handleProductChange(index, e)}
                    placeholder="Provide justification data for prioritization..."
                    required
                  />
                </div>
              </div>
            ))}
            
            <button type="button" onClick={addProduct} className={styles.addBtn}>
              + Append Resource Requirement
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
