import React, { useState, useEffect } from 'react';
import axios from 'axios';

const User = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_USER_API_URL || 'http://localhost:2000/user';

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await axios.get(API_URL);
                if (response.data.success) {
                    setUser(response.data.data);
                } else {
                    setError('Failed to load user data');
                }
            } catch (err) {
                console.error('Error fetching user:', err);
                setError('Service Unavailable - Is the backend running on port 2000?');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) return <div className="card loading"><span>⌛</span> Loading User Data...</div>;
    if (error) return <div className="card error-box"><span>❌</span> {error}</div>;

    return (
        <div className="card">
            <h2 className="card-title">👤 User Data <span className="tag">Port 2000</span></h2>
            <div className="data-field">
                <span className="data-label">Name</span>
                <div className="data-value">{user?.name}</div>
            </div>
            <div className="data-field">
                <span className="data-label">Age</span>
                <div className="data-value">{user?.age}</div>
            </div>
            <div className="data-field">
                <span className="data-label">Role</span>
                <div className="data-value">{user?.role}</div>
            </div>
            <div className="data-field">
                <span className="data-label">Details</span>
                <div className="data-value">{user?.details}</div>
            </div>
        </div>
    );
};

export default User;
