import { useState, useCallback } from 'react';
import profileApi from '../services/profileApi';

export const usePasswordChange = () => {
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [updateLoading, setUpdateLoading] = useState(false);

    const validatePassword = useCallback(() => {
        const errors = {};
        if (!passwordData.currentPassword) errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        if (!passwordData.newPassword) errors.newPassword = 'Vui lòng nhập mật khẩu mới';
        else if (passwordData.newPassword.length < 6) errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
        if (!passwordData.confirmPassword) errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        else if (passwordData.newPassword !== passwordData.confirmPassword)
            errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [passwordData]);

    const handlePasswordChange = useCallback((e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }, []);

    const handleChangePassword = useCallback(async (setError, setSuccessMessage) => {
        if (!validatePassword()) return;

        try {
            setUpdateLoading(true);
            setError('');
            setSuccessMessage('');

            const result = await profileApi.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            if (result.isSuccess) {
                setSuccessMessage('Đổi mật khẩu thành công!');
                setTimeout(() => setSuccessMessage(''), 3000);
                setIsChangingPassword(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError(error.message || 'Không thể đổi mật khẩu');
        } finally {
            setUpdateLoading(false);
        }
    }, [passwordData, validatePassword]);

    return {
        isChangingPassword,
        setIsChangingPassword,
        passwordData,
        formErrors,
        updateLoading,
        handlePasswordChange,
        handleChangePassword
    };
};