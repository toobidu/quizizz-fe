import { create } from 'zustand';
import authApi from '../services/authApi';
import jwtDecode from 'jwt-decode';
import debounce from 'lodash/debounce';

const authStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      error: null,
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
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken'); 
    if (!token || !refreshToken) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return;
      }
      set({ isLoading: true });
      const response = await authApi.getUser();
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Initialize auth error:', error);
      set({ user: null, isAuthenticated: false, error: error.message, isLoading: false });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  login: debounce(async (username, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.login({ username, password });
      const { accessToken, refreshToken, user } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user, isAuthenticated: true, isLoading: false });
      return response;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  }, 500),

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await authApi.logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
}));

window.addEventListener('storage', (event) => {
  if (event.key === 'accessToken' && !event.newValue) {
    authStore.getState().clearUser();
  }
});

export default authStore;