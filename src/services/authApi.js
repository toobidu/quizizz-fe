import api from './apiInstance';
import authStore from '../stores/authStore';

const login = async (payload) => {
    const res = await api.post('/auth/login', payload);
    const { accessToken, refreshToken, user } = res.data?.data || {};

    if (!accessToken || !refreshToken) {
        throw new Error('Đăng nhập thất bại: Không nhận được token hoặc thông tin người dùng');
    }

    localStorage.setItem('accessToken', accessToken);
    authStore.getState().setUser(user); 

    return res.data;
};

const register = async (payload) => {
    const res = await api.post('/auth/register', payload);
    return res.data;
};

const logout = async () => {
    try {
        await api.post('/auth/logout'); 
        localStorage.removeItem('accessToken');
        authStore.getState().clearUser();
    } catch (error) {
        console.error('Logout failed:', error);
        throw new Error(error.response?.data?.message || 'Đăng xuất thất bại');
    }
};

const forgotPassword = async (email) => {
    try {
        const res = await api.post('/forgot-password/send-otp', { email }); 
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.');
    }
};

const verifyOtp = async (email, otpCode) => {
    try {
        const res = await api.post('/forgot-password/verify-otp', { email, otpCode });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Mã OTP không hợp lệ. Vui lòng thử lại.');
    }
};

const resetPassword = async (email, otpCode, newPassword) => {
    try {
        const res = await api.post('/forgot-password/reset', {
            email,
            otpCode,
            newPassword,
            confirmPassword: newPassword,
        });
        return res.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    }
};

export default {
    login,
    register,
    logout,
    forgotPassword,
    verifyOtp,
    resetPassword,
};