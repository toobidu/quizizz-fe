import apiInstance from '../../../services/apiInstance';

const aiApi = {
    generateQuestions: async (prompt) => {
        const res = await apiInstance.post('/ai/generate-questions', { prompt });
        return res.data;
    },
    
    checkGenerationStatus: async (taskId) => {
        const res = await apiInstance.get(`/ai/status/${taskId}`);
        return res.data;
    }
};

export default aiApi;
