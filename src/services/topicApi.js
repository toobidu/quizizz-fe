import apiInstance from './apiInstance';

const topicApi = {
    /**
     * Get all topics (no pagination)
     */
    getAll: async () => {
        try {
            const response = await apiInstance.get('/topics');
            // API trả về: { success: true, data: [...], message: '...' }
            const topics = response.data?.data || [];
            return {
                success: true,
                data: Array.isArray(topics) ? topics : [],
                message: response.data?.message || 'Thành công'
            };
        } catch (error) {
            console.error('Error fetching all topics:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể lấy danh sách chủ đề',
                data: []
            };
        }
    },

    /**
     * Search and filter topics with pagination
     * @param {string} keyword - Search keyword
     * @param {number} page - Page number (default: 0)
     * @param {number} size - Page size (default: 10)
     * @param {string} sort - Sort criteria (default: 'id,desc')
     */
    searchPaginated: async (keyword = '', page = 0, size = 10, sort = 'id,desc') => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                sort: sort
            });
            
            if (keyword && keyword.trim()) {
                params.append('keyword', keyword.trim());
            }

            const response = await apiInstance.get(`/topics/search?${params.toString()}`);
            // API trả về: { success: true, data: { content: [...], page: 0, size: 10, ... }, message: '...' }
            return {
                success: true,
                data: response.data?.data || { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 },
                message: response.data?.message || 'Thành công'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể tìm kiếm chủ đề',
                data: { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 }
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
                data: response.data?.data || response.data,
                message: response.data?.message || 'Thành công'
            };
        } catch (error) {
            console.error('Error fetching topic by ID:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể lấy thông tin chủ đề',
                data: null
            };
        }
    },

    /**
     * Search topics (simple search, returns array)
     * @param {string} query - Search query
     * @deprecated Use searchPaginated for better performance
     */
    search: async (query) => {
        try {
            const response = await apiInstance.get(`/topics/search?keyword=${encodeURIComponent(query)}`);
            const result = response.data?.data;
            
            // Nếu trả về dạng phân trang, lấy content
            if (result && result.content && Array.isArray(result.content)) {
                return {
                    success: true,
                    data: result.content,
                    message: response.data?.message || 'Thành công'
                };
            }
            
            // Nếu trả về mảng trực tiếp
            return {
                success: true,
                data: Array.isArray(result) ? result : [],
                message: response.data?.message || 'Thành công'
            };
        } catch (error) {
            console.error('Error searching topics:', error);
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể tìm kiếm chủ đề',
                data: []
            };
        }
    }
};

export default topicApi;