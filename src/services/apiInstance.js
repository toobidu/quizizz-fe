import axios from 'axios';
import axiosRetry from 'axios-retry'; 

const apiInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosRetry(apiInstance, {
  retries: 3,
  retryDelay: (retryCount) => retryCount * 1000,
  retryCondition: (error) => error.response?.status >= 500 || !error.response,
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && /^eyJ/.test(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = authStore.getState().refreshToken;
        const response = await apiInstance.post('/auth/refresh-token', { refreshToken });
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiInstance(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token error:', refreshError);
        localStorage.removeItem('accessToken');
        authStore.getState().clearUser();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    console.error('Response interceptor error:', error);
    return Promise.reject(error);
  }
);

export default apiInstance;