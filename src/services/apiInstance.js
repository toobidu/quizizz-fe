import axios from 'axios';
import authStore from '../stores/authStore';
import Cookies from 'js-cookie';

const apiInstance = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

apiInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get('accessToken');
        if (token && /^eyJ/.test(token)) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = Cookies.get('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                // Gửi refreshToken dưới dạng string theo API spec
                const response = await apiInstance.post('/auth/refresh', refreshToken, {
                    headers: { 'Content-Type': 'text/plain' }
                });
                const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                Cookies.set('accessToken', accessToken, { expires: 7, secure: true, sameSite: 'strict' });
                Cookies.set('refreshToken', newRefreshToken, { expires: 7, secure: true, sameSite: 'strict' });
                sessionStorage.setItem('accessToken', accessToken);
                sessionStorage.setItem('refreshToken', newRefreshToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiInstance(originalRequest);
            } catch (refreshError) {
                Cookies.remove('accessToken');
                Cookies.remove('refreshToken');
                authStore.getState().clearUser();
                window.dispatchEvent(new Event('auth:unauthorized'));
                return Promise.reject(new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'));
            }
        }
        return Promise.reject(error);
    }
);

export default apiInstance;