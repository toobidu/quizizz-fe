import apiInstance from '../../../services/apiInstance';

const aiApi = {
    generateQuestions: async (topicId, userPrompt) => {
        const res = await apiInstance.post('/ai/generate-questions', { 
            topicId: parseInt(topicId), 
            userPrompt 
        });
        return res.data;
    },
    
    checkGenerationStatus: async (taskId) => {
        const res = await apiInstance.get(`/ai/status/${taskId}`);
        return res.data;
    }
};

export default aiApi;
