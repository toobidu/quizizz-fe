import apiInstance from './apiInstance';

const examApi = {
  /**
   * Get all exams
   * GET /api/v1/exams
   */
  getAllExams: async () => {
    try {
      const response = await apiInstance.get('/exams');
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy danh sách bộ đề'
      };
    }
  },

  /**
   * Get exams by topic ID
   * GET /api/v1/exams/topic/{topicId}
   * @param {number} topicId - Topic ID
   */
  getExamsByTopicId: async (topicId) => {
    try {
      const response = await apiInstance.get(`/exams/topic/${topicId}`);
      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy danh sách bộ đề'
      };
    }
  },

  /**
   * Get exam by ID
   * GET /api/v1/exams/{id}
   * @param {number} examId - Exam ID
   */
  getExamById: async (examId) => {
    try {
      const response = await apiInstance.get(`/exams/${examId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy thông tin bộ đề'
      };
    }
  },

  /**
   * Search exams with pagination
   * GET /api/v1/exams/search?keyword={keyword}&topicId={topicId}&page={page}&size={size}&sort={sort}
   * @param {string} keyword - Search keyword (optional)
   * @param {number} topicId - Topic ID filter (optional)
   * @param {number} page - Page number (default: 0)
   * @param {number} size - Page size (default: 10)
   * @param {string} sort - Sort criteria (default: 'id,desc')
   */
  searchExams: async (keyword = '', topicId = null, page = 0, size = 10, sort = 'id,desc') => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort: sort
      });
      
      if (keyword) params.append('keyword', keyword);
      if (topicId) params.append('topicId', topicId.toString());

      const response = await apiInstance.get(`/exams/search?${params}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tìm kiếm bộ đề'
      };
    }
  },

  /**
   * Create exam (Teacher only - requires 'topic:manage' authority)
   * POST /api/v1/exams
   * @param {object} examData - { topicId: number, title: string, description: string }
   */
  createExam: async (examData) => {
    try {
      const response = await apiInstance.post('/exams', examData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Tạo bộ đề thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tạo bộ đề'
      };
    }
  },

  /**
   * Update exam (Teacher only - requires 'topic:manage' authority)
   * PUT /api/v1/exams/{id}
   * @param {number} examId - Exam ID
   * @param {object} examData - { title: string, description: string }
   */
  updateExam: async (examId, examData) => {
    try {
      const response = await apiInstance.put(`/exams/${examId}`, examData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Cập nhật bộ đề thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể cập nhật bộ đề'
      };
    }
  },

  /**
   * Delete exam (Teacher only - requires 'topic:manage' authority)
   * DELETE /api/v1/exams/{id}
   * @param {number} examId - Exam ID
   */
  deleteExam: async (examId) => {
    try {
      const response = await apiInstance.delete(`/exams/${examId}`);
      return {
        success: true,
        message: response.data.message || 'Xóa bộ đề thành công'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể xóa bộ đề'
      };
    }
  }
};

export default examApi;
