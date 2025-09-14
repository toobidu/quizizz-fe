import { useState, useCallback, useEffect } from 'react';
import profileApi from '../services/profileApi';

export const useProfileEdit = (profileData, setProfileData) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        address: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [updateLoading, setUpdateLoading] = useState(false);

    // Update formData when profileData changes
    useEffect(() => {
        if (profileData) {
            setFormData({
                fullName: profileData.fullName || '',
                phoneNumber: profileData.phoneNumber || '',
                address: profileData.address || '',
            });
        }
    }, [profileData]);

    const validateProfile = useCallback(() => {
        const errors = {};
        if (!formData.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên';
        if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Vui lòng nhập số điện thoại';
        else if (!/^\d{10}$/.test(formData.phoneNumber)) errors.phoneNumber = 'Số điện thoại phải có 10 chữ số';
        if (!formData.address.trim()) errors.address = 'Vui lòng nhập địa chỉ';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    const handleProfileChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }, []);

    const handleUpdateProfile = useCallback(async (setError, setSuccessMessage) => {
        if (!validateProfile()) return;

        try {
            setUpdateLoading(true);
            setError('');
            setSuccessMessage('');

            const updateData = {
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber,
                address: formData.address,
                email: profileData.email,
            };

            const result = await profileApi.updateProfile(updateData);

            if (result.isSuccess) {
                setProfileData(result.data);
                setSuccessMessage('Cập nhật thông tin thành công!');
                setTimeout(() => setSuccessMessage(''), 3000);
                setIsEditing(false);
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError(error.message || 'Không thể cập nhật thông tin');
        } finally {
            setUpdateLoading(false);
        }
    }, [formData, profileData, validateProfile, setProfileData]);

    return {
        isEditing,
        setIsEditing,
        formData,
        formErrors,
        updateLoading,
        handleProfileChange,
        handleUpdateProfile
    };
};