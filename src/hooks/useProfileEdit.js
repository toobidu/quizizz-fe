import { useState, useCallback, useEffect } from 'react';
import profileApi from '../services/profileApi';

export const useProfileEdit = (profileData, setProfileData) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        address: '',
        email: '',
        dob: ''
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
                email: profileData.email || '',
                dob: profileData.dob ? profileData.dob.split('T')[0] : '' // Format date for input
            });
        }
    }, [profileData]);

    const validateProfile = useCallback(() => {
        const errors = {};
        if (!formData.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên';
        if (!formData.email.trim()) errors.email = 'Vui lòng nhập email';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email không hợp lệ';
        if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Vui lòng nhập số điện thoại';
        else if (!/^\d{10}$/.test(formData.phoneNumber)) errors.phoneNumber = 'Số điện thoại phải có 10 chữ số';
        if (!formData.address.trim()) errors.address = 'Vui lòng nhập địa chỉ';
        if (!formData.dob) errors.dob = 'Vui lòng chọn ngày sinh';
        else {
            const birthDate = new Date(formData.dob);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 13) errors.dob = 'Bạn phải từ 13 tuổi trở lên';
            if (birthDate > today) errors.dob = 'Ngày sinh không được lớn hơn ngày hiện tại';
        }
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
                email: formData.email,
                dob: formData.dob // Thêm dob vào request
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