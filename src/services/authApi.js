import api from './apiInstance';
import authStore from '../stores/authStore';
import debounce from 'lodash/debounce';

const login = debounce(async (payload) => {
  try {
    if (!payload.username || !payload.password) {
      throw new Error('Vui lòng cung cấp đầy đủ thông tin đăng nhập');
    }
    const res = await api.post('/auth/login', payload);
    const { accessToken, refreshToken, user } = res.data?.data || {};
    if (!accessToken || !refreshToken || !user) {
      throw new Error('Đăng nhập thất bại: Không nhận được token hoặc thông tin người dùng');
    }
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    authStore.getState().setUser(user);
    return {
      status: res.status,
      message: res.data.message || 'Đăng nhập thành công',
      data: res.data.data,
      isSuccess: res.data.isSuccess,
      timestamp: res.data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Đăng nhập thất bại';
    console.error('Login API error:', error);
    throw new Error(errorMessage);
  }
}, 500);

const register = async (payload) => {
  try {
    const { username, password, email } = payload;
    if (!username || !password || !email) {
      throw new Error('Vui lòng cung cấp đầy đủ thông tin đăng ký');
    }
    if (username.length < 3) {
      throw new Error('Tên đăng nhập phải có ít nhất 3 ký tự');
    }
    if (password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Email không hợp lệ');
    }
    const res = await api.post('/auth/register', payload);
    return {
      status: res.status,
      message: res.data.message || 'Đăng ký thành công',
      data: res.data.data,
      isSuccess: res.data.isSuccess,
      timestamp: res.data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Đăng ký thất bại';
    const field = error.response?.data?.field;
    console.error('Register API error:', error);
    throw new Error(errorMessage, { cause: { field } });
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

const forgotPassword = debounce(async (email) => {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Email không hợp lệ');
    }
    const res = await api.post('/forgot-password/send-otp', { email });
    return {
      status: res.status,
      message: res.data.message || 'Gửi OTP thành công',
      data: res.data.data,
      isSuccess: res.data.isSuccess,
      timestamp: res.data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Email không tồn tại hoặc không thể gửi OTP';
    console.error('Forgot password API error:', error);
    throw new Error(errorMessage);
  }
}, 1000);

const verifyOtp = debounce(async (email, otpCode) => {
  try {
    if (!email || !otpCode) {
      throw new Error('Vui lòng cung cấp email và mã OTP');
    }
    const res = await api.post('/forgot-password/verify-otp', { email, otpCode });
    return {
      status: res.status,
      message: res.data.message || 'Xác thực OTP thành công',
      data: res.data.data,
      isSuccess: res.data.isSuccess,
      timestamp: res.data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Mã OTP không hợp lệ';
    console.error('Verify OTP API error:', error);
    throw new Error(errorMessage);
  }
}, 1000);

const resetPassword = debounce(async (email, otpCode, newPassword) => {
  try {
    if (!email || !otpCode || !newPassword) {
      throw new Error('Vui lòng cung cấp đầy đủ thông tin');
    }
    if (newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
    }
    const res = await api.post('/forgot-password/reset', {
      email,
      otpCode,
      newPassword,
      confirmPassword: newPassword,
    });
    return {
      status: res.status,
      message: res.data.message || 'Đặt lại mật khẩu thành công',
      data: res.data.data,
      isSuccess: res.data.isSuccess,
      timestamp: res.data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Không thể đặt lại mật khẩu';
    console.error('Reset password API error:', error);
    throw new Error(errorMessage);
  }
}, 1000);

export default {
  login,
  register,
  logout,
  forgotPassword,
  verifyOtp,
  resetPassword,
};