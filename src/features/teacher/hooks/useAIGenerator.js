import { useState } from 'react';
import aiApi from '../services/aiApi';

export const useAIGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [error, setError] = useState(null);

    const generateQuestions = async (topicId, prompt) => {
        setLoading(true);
        setError(null);
        try {
            
            // aiApi.generateQuestions now returns AIGenerateResponse directly
            const aiResponse = await aiApi.generateQuestions(topicId, prompt);
            const questions = aiResponse.questions || [];
            
            if (questions.length === 0) {
                throw new Error('AI không tạo được câu hỏi. Vui lòng thử lại.');
            }
            
            setGeneratedQuestions(questions);
            return { 
                success: true, 
                data: questions,
                totalGenerated: aiResponse.totalGenerated,
                message: aiResponse.message 
            };
            
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Lỗi không xác định';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const clearQuestions = () => {
        setGeneratedQuestions([]);
        setError(null);
    };

    return {
        loading,
        generatedQuestions,
        error,
        generateQuestions,
        clearQuestions,
        setGeneratedQuestions
    };
};
