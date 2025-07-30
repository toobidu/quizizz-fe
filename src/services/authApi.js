import api from './apiInstance';
import authStore from '../stores/authStore';

const login = async (payload) => {
    try {
        const res = await api.post('/auth/login', payload);
        const { accessToken, refreshToken, user } = res.data?.data || {};

        if (!accessToken || !refreshToken || !user) {
            throw new Error('Đăng nhập thất bại: Không nhận được token hoặc thông tin người dùng');
        }

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        authStore.getState().setUser(user);

        return res.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.message || error.message || 'Đăng nhập thất bại';
        console.error('Login API error:', error);
        throw new Error(errorMessage);
    }
};

const register = async (payload) => {
    try {
        const res = await api.post('/auth/register', payload);
        return res.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.message || error.message || 'Đăng ký thất bại';
        console.error('Register API error:', error);
        throw new Error(errorMessage);
    }
};

const logout = async () => {
    try {
        await api.post('/auth/logout');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        authStore.getState().clearUser();
    } catch (error) {
        console.error('Logout API error:', error);
        throw new Error(error.response?.data?.message || 'Đăng xuất thất bại');
    }
};

const forgotPassword = async (email) => {
    try {
        const res = await api.post('/forgot-password/send-otp', { email });
        return res.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Không thể gửi OTP';
        console.error('Forgot password API error:', error);
        throw new Error(errorMessage);
    }
};

const verifyOtp = async (email, otpCode) => {
    try {
        const res = await api.post('/forgot-password/verify-otp', { email, otpCode });
        return res.data;
    } catch (error) {
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Mã OTP không hợp lệ';
        console.error('Verify OTP API error:', error);
        throw new Error(errorMessage);
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
        const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'Không thể đặt lại mật khẩu';
        console.error('Reset password API error:', error);
        throw new Error(errorMessage);
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