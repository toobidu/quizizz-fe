import apiInstance from '../../../services/apiInstance';

const teacherApi = {
    // Topic CRUD
    getAllTopics: async () => {
        const res = await apiInstance.get('/topics');
        return res.data;
    },
    
    searchTopics: async (keyword = '', page = 0, size = 10, sort = 'id,desc') => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: sort
        });
        
        if (keyword && keyword.trim()) {
            params.append('keyword', keyword.trim());
        }
        
        const res = await apiInstance.get(`/topics/search?${params.toString()}`);
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
    searchQuestions: async (keyword = '', examId = null, questionType = null, page = 0, size = 10, sort = 'id,desc') => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: sort
        });
        
        if (keyword && keyword.trim()) {
            params.append('keyword', keyword.trim());
        }
        
        if (examId) {
            params.append('examId', examId.toString());
        }
        
        if (questionType && questionType !== 'ALL') {
            params.append('questionType', questionType);
        }
        
        const res = await apiInstance.get(`/questions?${params.toString()}`);
        return res.data;
    },
    
    getQuestionById: async (id) => {
        const res = await apiInstance.get(`/questions/${id}`);
        return res.data;
    },
    
    getQuestionsByTopic: async (topicId) => {
        const res = await apiInstance.get(`/questions?topicId=${topicId}&size=1000`);
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
    
    // Exam CRUD
    getAllExams: async () => {
        const res = await apiInstance.get('/exams');
        return res.data;
    },
    
    searchExams: async (keyword = '', topicId = null, page = 0, size = 10, sort = 'id,desc') => {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            sort: sort
        });
        
        if (keyword && keyword.trim()) {
            params.append('keyword', keyword.trim());
        }
        
        if (topicId) {
            params.append('topicId', topicId.toString());
        }
        
        const res = await apiInstance.get(`/exams/search?${params.toString()}`);
        return res.data;
    },
    
    getExamById: async (id) => {
        const res = await apiInstance.get(`/exams/${id}`);
        return res.data;
    },
    
    getExamsByTopic: async (topicId) => {
        const res = await apiInstance.get(`/exams/topic/${topicId}`);
        return res.data;
    },
    
    createExam: async (data) => {
        const res = await apiInstance.post('/exams', data);
        return res.data;
    },
    
    updateExam: async (id, data) => {
        const res = await apiInstance.put(`/exams/${id}`, data);
        return res.data;
    },
    
    deleteExam: async (id) => {
        const res = await apiInstance.delete(`/exams/${id}`);
        return res.data;
    },
    
    countExams: async () => {
        const res = await apiInstance.get('/exams/count');
        return res.data;
    },
    
    countQuestions: async () => {
        const res = await apiInstance.get('/questions/count');
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
    },
    
    getStatistics: async () => {
        const [examsRes, questionsRes] = await Promise.all([
            apiInstance.get('/exams/count'),
            apiInstance.get('/questions/count')
        ]);
        return {
            exams: examsRes.data.data,
            questions: questionsRes.data.data
        };
    }
};

export default teacherApi;
