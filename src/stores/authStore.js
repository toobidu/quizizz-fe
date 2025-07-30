import { create } from 'zustand';
import authApi from '../services/authApi';

const authStore = create((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
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
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    try {
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

  login: async (username, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.login({ username, password });
      set({ isLoading: false });
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
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
}));

export default authStore;