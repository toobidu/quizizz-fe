import apiInstance from '../../../services/apiInstance';

const teacherApi = {
    // Topic CRUD
    getAllTopics: async () => {
        const res = await apiInstance.get('/topics');
        return res.data;
    },
    
    getTopicById: async (id) => {
        const res = await apiInstance.get(`/topics/${id}`);
        return res.data;
    },
    
    createTopic: async (data) => {
        const res = await apiInstance.post('/topics', data);
        return res.data;
    },
    
    updateTopic: async (id, data) => {
        const res = await apiInstance.put(`/topics/${id}`, data);
        return res.data;
    },
    
    deleteTopic: async (id) => {
        const res = await apiInstance.delete(`/topics/${id}`);
        return res.data;
    },
    
    // Question CRUD
    getQuestionById: async (id) => {
        const res = await apiInstance.get(`/questions/${id}`);
        return res.data;
    },
    
    getQuestionsByTopic: async (topicId) => {
        const res = await apiInstance.get(`/questions/topic/${topicId}`);
        return res.data;
    },
    
    getRandomQuestions: async (topicId, questionType, count = 10) => {
        const params = new URLSearchParams();
        if (topicId) params.append('topicId', topicId);
        if (questionType) params.append('questionType', questionType);
        params.append('count', count);
        const res = await apiInstance.get(`/questions/random?${params}`);
        return res.data;
    },
    
    countAvailableQuestions: async (topicId, questionType) => {
        const params = new URLSearchParams();
        if (topicId) params.append('topicId', topicId);
        if (questionType) params.append('questionType', questionType);
        const res = await apiInstance.get(`/questions/count?${params}`);
        return res.data;
    },
    
    createQuestion: async (data) => {
        const res = await apiInstance.post('/questions', data);
        return res.data;
    },
    
    createBulkQuestions: async (data) => {
        const res = await apiInstance.post('/questions/bulk', data);
        return res.data;
    },
    
    updateQuestion: async (id, data) => {
        const res = await apiInstance.put(`/questions/${id}`, data);
        return res.data;
    },
    
    deleteQuestion: async (id) => {
        const res = await apiInstance.delete(`/questions/${id}`);
        return res.data;
    },
    
    deleteBulkQuestions: async (data) => {
        const res = await apiInstance.delete('/questions/bulk', { data });
        return res.data;
    },
    
    // Answer CRUD
    getAnswerById: async (id) => {
        const res = await apiInstance.get(`/answers/${id}`);
        return res.data;
    },
    
    getAnswersByQuestion: async (questionId) => {
        const res = await apiInstance.get(`/answers/question/${questionId}`);
        return res.data;
    },
    
    createAnswer: async (data) => {
        const res = await apiInstance.post('/answers', data);
        return res.data;
    },
    
    createBulkAnswers: async (data) => {
        const res = await apiInstance.post('/answers/bulk', data);
        return res.data;
    },
    
    updateAnswer: async (id, data) => {
        const res = await apiInstance.put(`/answers/${id}`, data);
        return res.data;
    },
    
    deleteAnswer: async (id) => {
        const res = await apiInstance.delete(`/answers/${id}`);
        return res.data;
    }
};

export default teacherApi;
