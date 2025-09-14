import { useState, useEffect, useCallback } from 'react';
import authApi from '../services/authApi';
import apiInstance from '../services/apiInstance';
import authStore from '../stores/authStore';

export const useAvatarUpload = (profileData) => {
    const { isAuthenticated } = authStore();

    // State cho upload avatar
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // State cho avatar
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [avatarLoading, setAvatarLoading] = useState(false);

    // Hàm xử lý avatar URL
    const getAvatarUrl = useCallback((avatarURL) => {
        if (!avatarURL) return '';

        // Nếu là full URL (http/https), trả về nguyên
        if (avatarURL.startsWith('http://') || avatarURL.startsWith('https://')) {
            return avatarURL;
        }

        // Backend URL - thay đổi theo cấu hình thực tế
        const BACKEND_URL = 'http://localhost:8080';

        // Nếu avatarURL chỉ là filename, tạo full URL
        if (!avatarURL.includes('/')) {
            return `${BACKEND_URL}/api/v1/profile/avatar/${avatarURL}`;
        }

        // Nếu đã có path, chỉ cần thêm base URL
        return `${BACKEND_URL}${avatarURL.startsWith('/') ? '' : '/'}${avatarURL}`;
    }, []);

    // Hàm fetch avatar
    const fetchAvatar = useCallback(async () => {
        if (avatarUrl || avatarLoading || !profileData?.avatarURL) return;

        try {
            setAvatarLoading(true);

            const response = await authApi.getAvatar();

            if (response.isSuccess && response.data) {
                console.log('Avatar presigned URL received:', response.data);
                setAvatarUrl(response.data);
                return;
            }

            if (response.status === 200 && response.data) {
                try {
                    new URL(response.data);
                    console.log('Avatar presigned URL validated and set');
                    setAvatarUrl(response.data);
                } catch (urlError) {
                    console.warn("Invalid presigned URL received:", response.data, urlError);
                    setAvatarUrl(null);
                }
            } else {
                console.log('Failed to fetch avatar:', response.message);
                setAvatarUrl(null);
            }
        } catch (error) {
            console.error('Error fetching avatar:', error);
            setAvatarUrl(null);
        } finally {
            setAvatarLoading(false);
        }
    }, [avatarUrl, avatarLoading, profileData?.avatarURL]);

    // Fetch avatar khi có profileData
    useEffect(() => {
        if (profileData?.avatarURL && !avatarUrl && !avatarLoading) {
            fetchAvatar();
        }
    }, [profileData?.avatarURL, avatarUrl, avatarLoading, fetchAvatar]);

    // Hàm validate file ảnh
    const validateImageFile = useCallback((file) => {
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!file || !file.type || !file.type.startsWith('image/')) {
            throw new Error('Chỉ chấp nhận file ảnh (image/*)');
        }

        if (file.size > maxSize) {
            throw new Error('File ảnh không được vượt quá 5MB');
        }

        return true;
    }, []);

    // Hàm xử lý chọn file ảnh và upload trực tiếp
    const handleFileSelect = useCallback(async (event, setUser) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            // Validate file
            validateImageFile(file);

            // Set loading state
            setUploadingAvatar(true);
            setUploadError('');

            // Tạo FormData
            const formData = new FormData();
            formData.append('file', file, 'avatar.jpg');

            // Upload trực tiếp
            const response = await apiInstance.post('/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Kiểm tra response
            if (response.data?.success && response.data?.data?.avatarUrl) {
                console.log('Avatar uploaded successfully, avatarUrl:', response.data.data.avatarUrl);
                setAvatarUrl(response.data.data.avatarUrl);

                // Cập nhật user state
                if (typeof setUser === 'function') {
                    setUser(prev => ({ ...prev, avatarURL: response.data.data.avatarUrl }));
                }

                setSuccessMessage('Avatar đã được cập nhật thành công!');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                throw new Error(response.data?.message || 'Upload failed');
            }

        } catch (error) {
            console.error('Upload error:', error);
            setUploadError(error?.response?.data?.message || error?.message || 'Lỗi khi tải avatar');
        } finally {
            setUploadingAvatar(false);
            event.target.value = ''; // Reset input
        }
    }, [validateImageFile]);

    // Auto-refresh avatar every 45 minutes
    useEffect(() => {
        if (!isAuthenticated || !profileData?.avatarURL) return;

        const refreshAvatar = async () => {
            try {
                console.log('Auto-refreshing avatar...');
                const response = await authApi.getAvatar();

                if (response.isSuccess && response.data) {
                    console.log('Avatar refreshed with new presigned URL:', response.data);
                    setAvatarUrl(response.data);
                    return;
                }

                if (response.status === 200 && response.data) {
                    try {
                        new URL(response.data);
                        console.log('Avatar presigned URL refreshed and validated');
                        setAvatarUrl(response.data);
                    } catch (urlError) {
                        console.warn("Invalid presigned URL received during refresh:", response.data, urlError);
                    }
                }
            } catch (error) {
                console.error("Error refreshing avatar:", error);
            }
        };

        const refreshInterval = setInterval(refreshAvatar, 45 * 60 * 1000);

        return () => clearInterval(refreshInterval);
    }, [isAuthenticated, profileData?.avatarURL]);

    return {
        // Avatar display
        avatarUrl,
        avatarLoading,
        getAvatarUrl,

        // Upload states
        uploadingAvatar,
        uploadError,
        setUploadError,
        successMessage,
        setSuccessMessage,

        // Handlers
        handleFileSelect
    };
};