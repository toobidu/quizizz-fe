import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import profileApi from '../services/profileApi';
import authStore from '../stores/authStore';

export const useProfileData = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user, setUser } = authStore();
    const isOwnProfile = !username || username === user?.username;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profileData, setProfileData] = useState(null);

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError('');
                let response;

                if (isOwnProfile) {
                    response = await profileApi.getMyProfile();
                } else {
                    // TODO: Implement search user functionality
                    throw new Error('Chức năng xem hồ sơ người khác chưa được implement');
                }

                if (response.isSuccess) {
                    setProfileData(response.data);
                    if (isOwnProfile) {
                        setUser(response.data);
                    }
                } else {
                    setError(response.message);
                }
            } catch (err) {
                setError(err.message || 'Lỗi kết nối đến server');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchProfile();
        }
    }, [username, isOwnProfile, setUser, isAuthenticated]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    return {
        profileData,
        loading,
        error,
        isOwnProfile,
        setProfileData,
        setError
    };
};