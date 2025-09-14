import { create } from 'zustand';
import authApi from '../services/authApi';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

const authStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) =>
    set((state) => {
      return {
        user,
        isAuthenticated: !!user,
        error: null,
      };
    }),

  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  initialize: async () => {
    // Kiểm tra token từ Cookies trước, nếu không có thì từ sessionStorage
    let token = Cookies.get('accessToken');
    let refreshToken = Cookies.get('refreshToken');

    if (!token) {
      token = sessionStorage.getItem('accessToken');
      refreshToken = sessionStorage.getItem('refreshToken');
      // Nếu có token từ sessionStorage, đồng bộ lại vào Cookies
      if (token && refreshToken) {
        Cookies.set('accessToken', token, { expires: 7, secure: true, sameSite: 'strict' });
        Cookies.set('refreshToken', refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
      }
    }

    if (!token || !refreshToken) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        // Token hết hạn, thử refresh
        const refreshResponse = await authApi.refreshToken();
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;

        // Cập nhật token mới
        Cookies.set('accessToken', newAccessToken, { expires: 7, secure: true, sameSite: 'strict' });
        Cookies.set('refreshToken', newRefreshToken, { expires: 7, secure: true, sameSite: 'strict' });
        sessionStorage.setItem('accessToken', newAccessToken);
        sessionStorage.setItem('refreshToken', newRefreshToken);

        token = newAccessToken;
      }

      set({ isLoading: true });
      const response = await authApi.getUser();
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // Nếu refresh thất bại, clear token và chuyển về login
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, error: error.message, isLoading: false });
    }
  },

  login: async (username, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.login({ username, password });
      const { accessToken, refreshToken, ...user } = response.data.data;

      // Lưu token vào Cookies và sessionStorage để persist khi reload
      Cookies.set('accessToken', accessToken, { expires: 7, secure: true, sameSite: 'strict' });
      Cookies.set('refreshToken', refreshToken, { expires: 7, secure: true, sameSite: 'strict' });
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);

      set({ user, isAuthenticated: true, isLoading: false });
      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await authApi.logout();
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
}));

export default authStore;