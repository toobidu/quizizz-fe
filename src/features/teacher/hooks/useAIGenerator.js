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
            const response = await aiApi.generateQuestions(topicId, prompt);
            const questions = response.data?.questions || response.questions || [];
            setGeneratedQuestions(questions);
            return { success: true, data: questions };
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
