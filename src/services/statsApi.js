import apiInstance from './apiInstance';

const statsApi = {
    /**
     * Get player statistics for dashboard
     */
    getDashboardStats: async () => {
        try {
            const response = await apiInstance.get('/profile/stats');
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Success'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể lấy thống kê',
                data: null
            };
        }
    },

    /**
     * Get detailed player statistics for profile
     */
    getProfileStats: async () => {
        try {
            const response = await apiInstance.get('/profile/stats');
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Success'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể lấy thống kê chi tiết',
                data: null
            };
        }
    },

    /**
     * Get player achievements
     */
    getAchievements: async () => {
        try {
            const response = await apiInstance.get('/profile/stats');
            return {
                success: true,
                data: response.data.data?.achievements || [],
                message: response.data.message || 'Success'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể lấy thành tích',
                data: []
            };
        }
    }
};

export default statsApi;
