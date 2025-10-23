import apiInstance from './apiInstance';

const statsApi = {
    /**
     * Get player statistics for dashboard
     */
    getDashboardStats: async () => {
        try {
            console.log('[statsApi] Calling GET /profile/stats');
            const response = await apiInstance.get('/profile/stats');
            console.log('[statsApi] Dashboard stats response:', response);
            console.log('[statsApi] Response data:', response.data);
            console.log('[statsApi] Response data.data:', response.data.data);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Success'
            };
        } catch (error) {
            console.error('[statsApi] Dashboard stats error:', error);
            console.error('[statsApi] Error response:', error.response);
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
            console.log('[statsApi] Calling GET /profile/stats/detailed');
            const response = await apiInstance.get('/profile/stats/detailed');
            console.log('[statsApi] Profile stats response:', response);
            console.log('[statsApi] Response data:', response.data);
            console.log('[statsApi] Response data.data:', response.data.data);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Success'
            };
        } catch (error) {
            console.error('[statsApi] Profile stats error:', error);
            console.error('[statsApi] Error response:', error.response);
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
            console.log('[statsApi] Calling GET /profile/achievements');
            const response = await apiInstance.get('/profile/achievements');
            console.log('[statsApi] Achievements response:', response);
            console.log('[statsApi] Response data:', response.data);
            return {
                success: true,
                data: response.data.data || response.data || [],
                message: response.data.message || 'Success'
            };
        } catch (error) {
            console.error('[statsApi] Achievements error:', error);
            console.error('[statsApi] Error response:', error.response);
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể lấy thành tích',
                data: []
            };
        }
    }
};

export default statsApi;
