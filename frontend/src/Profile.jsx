import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_PROFILE_API_URL || 'http://localhost:3000/profile';

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const response = await axios.get(API_URL);
                if (response.data.success) {
                    setProfile(response.data.data);
                } else {
                    setError('Failed to load profile data');
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Service Unavailable - Is the backend running on port 3000?');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <div className="card loading"><span>⌛</span> Loading Profile Data...</div>;
    if (error) return <div className="card error-box"><span>❌</span> {error}</div>;

    return (
        <div className="card">
            <h2 className="card-title">📖 Profile Info <span className="tag">Port 3000</span></h2>
            <div className="data-field">
                <span className="data-label">Profile Name</span>
                <div className="data-value">{profile?.name}</div>
            </div>
            <div className="data-field">
                <span className="data-label">Bio</span>
                <div className="data-value">{profile?.details}</div>
            </div>
            <div className="data-field">
                <span className="data-label">Designation</span>
                <div className="data-value">{profile?.role}</div>
            </div>
        </div>
    );
};

export default Profile;
