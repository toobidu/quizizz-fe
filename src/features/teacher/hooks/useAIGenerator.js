import { useState } from 'react';
import aiApi from '../services/aiApi';

export const useAIGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [error, setError] = useState(null);

    const generateQuestions = async (prompt) => {
        setLoading(true);
        setError(null);
        try {
            const response = await aiApi.generateQuestions(prompt);
            setGeneratedQuestions(response.data || response.questions || []);
            return { success: true, data: response.data || response.questions };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
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
