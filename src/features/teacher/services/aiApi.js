import apiInstance from '../../../services/apiInstance';

const aiApi = {
    generateQuestions: async (examId, userPrompt) => {
        try {
            const res = await apiInstance.post('/ai/generate-questions', { 
                examId: parseInt(examId), 
                userPrompt 
            });
            
            return res.data.data; 
            
        } catch (error) {
            throw error;
        }
    },
    
    checkGenerationStatus: async (taskId) => {
        const res = await apiInstance.get(`/ai/status/${taskId}`);
        return res.data;
    }
};

export default aiApi;
