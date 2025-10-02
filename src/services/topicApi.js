import apiInstance from './apiInstance';

const topicApi = {
    /**
     * Get all topics
     */
    getAll: async () => {
        try {
            const response = await apiInstance.get('/topics');
            return {
                success: true,
                data: response.data.data || response.data || [],
                message: response.data.message || 'Thành công'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể lấy danh sách chủ đề',
                data: []
            };
        }
    },

    /**
     * Get topic by ID
     * @param {number} topicId - Topic ID
     */
    getById: async (topicId) => {
        try {
            const response = await apiInstance.get(`/topics/${topicId}`);
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || 'Thành công'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể lấy thông tin chủ đề',
                data: null
            };
        }
    },

    /**
     * Search topics
     * @param {string} query - Search query
     */
    search: async (query) => {
        try {
            const response = await apiInstance.get(`/topics/search?q=${encodeURIComponent(query)}`);
            return {
                success: true,
                data: response.data.data || response.data || [],
                message: response.data.message || 'Thành công'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể tìm kiếm chủ đề',
                data: []
            };
        }
    }
};

export default topicApi;