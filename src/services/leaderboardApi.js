import apiInstance from './apiInstance';

const leaderboardApi = {
    getLeaderboardByTopic: async (topicId) => {
        try {
            const response = await apiInstance.get(`/leaderboard/topic/${topicId}`);
            return {
                success: true,
                data: response.data.data || response.data || [],
                message: response.data.message || 'Success'
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Không thể lấy bảng xếp hạng',
                data: []
            };
        }
    }
};

export default leaderboardApi;
