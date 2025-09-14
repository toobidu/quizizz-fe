import api from './apiInstance';
import authStore from '../stores/authStore';
import Cookies from 'js-cookie';

const login = async (payload) => {
  try {
    if (!payload.username || !payload.password) {
      throw new Error('Vui lòng cung cấp đầy đủ thông tin đăng nhập');
    }
    const res = await api.post('/auth/login', payload);
    const { accessToken, refreshToken, ...user } = res.data?.data || {};
    if (!accessToken || !refreshToken || !user || Object.keys(user).length === 0 || !/^eyJ/.test(accessToken)) {
      throw new Error('Đăng nhập thất bại: Token hoặc thông tin người dùng không hợp lệ');
    }

    Cookies.set('accessToken', accessToken, { expires: 7, secure: true, sameSite: 'strict' });
    Cookies.set('refreshToken', refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);

    authStore.getState().setUser(user);
    return {
      status: res.status,
      message: res.data.message || 'Đăng nhập thành công',
      data: res.data.data,
      isSuccess: res.data.status === 200,
      timestamp: res.data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || error.message || 'Đăng nhập thất bại';
    throw new Error(errorMessage);
  }
};

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
    throw new Error(errorMessage, { cause: { field } });
  }
};

const logout = async () => {
  try {
    await api.post('/auth/logout');
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    authStore.getState().clearUser();
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Đăng xuất thất bại');
  }
};

const forgotPassword = async (email) => {
  try {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Email không hợp lệ');
    }
    const res = await api.post('/auth/reset-password', { email });
    return {
      status: res.status,
      message: res.data.message || 'Gửi email reset password thành công',
      data: res.data.data,
      isSuccess: res.data.isSuccess,
      timestamp: res.data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Email không tồn tại hoặc không thể gửi email reset password';
    throw new Error(errorMessage);
  }
};

const getUser = async () => {
  try {
    const res = await api.get('/profile');
    return {
      status: res.status,
      message: res.data.message || 'Lấy thông tin người dùng thành công',
      data: res.data.data,
      isSuccess: res.data.status === 0,
      timestamp: res.data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng');
  }
};

const refreshToken = async () => {
  try {
    const currentRefreshToken = Cookies.get('refreshToken');
    if (!currentRefreshToken) {
      throw new Error('Không có refresh token');
    }

    // Theo API spec, gửi refreshToken dưới dạng string trong body
    const res = await api.post('/auth/refresh', currentRefreshToken, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });

    const { accessToken, refreshToken: newRefreshToken } = res.data.data;

    // Lưu token mới vào Cookies và sessionStorage
    Cookies.set('accessToken', accessToken, { expires: 7, secure: true, sameSite: 'strict' });
    Cookies.set('refreshToken', newRefreshToken, { expires: 7, secure: true, sameSite: 'strict' });
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', newRefreshToken);

    return {
      status: res.status,
      message: res.data.message || 'Refresh token thành công',
      data: res.data.data,
      isSuccess: res.data.status === 0,
      timestamp: res.data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể refresh token');
  }
};

const getAvatar = async () => {
  try {
    const res = await api.get('/profile/avatar');
    return {
      status: res.status,
      message: res.data.message || 'Lấy avatar thành công',
      data: res.data.data, // URL của avatar
      isSuccess: res.status === 200 && res.data.data, // Check HTTP status and data existence
      timestamp: res.data.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Không thể lấy avatar');
  }
};

export default {
  login,
  register,
  logout,
  forgotPassword,
  getUser,
  refreshToken,
  getAvatar,
};