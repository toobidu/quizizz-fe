import { useState, useEffect } from 'react';
import topicApi from '../services/topicApi';

export const useTopics = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Mock data for development when API is not available
    const mockTopics = [
        { id: 1, name: 'Toán học', description: 'Câu hỏi về toán học cơ bản và nâng cao' },
        { id: 2, name: 'Văn học', description: 'Câu hỏi về văn học Việt Nam và thế giới' },
        { id: 3, name: 'Lịch sử', description: 'Câu hỏi về lịch sử Việt Nam và thế giới' },
        { id: 4, name: 'Địa lý', description: 'Câu hỏi về địa lý tự nhiên và kinh tế' },
        { id: 5, name: 'Khoa học', description: 'Câu hỏi về vật lý, hóa học, sinh học' },
        { id: 6, name: 'Tiếng Anh', description: 'Câu hỏi về ngữ pháp và từ vựng tiếng Anh' },
        { id: 7, name: 'Thể thao', description: 'Câu hỏi về thể thao trong nước và quốc tế' },
        { id: 8, name: 'Giải trí', description: 'Câu hỏi về phim ảnh, âm nhạc, game' },
    ];

    const loadTopics = async () => {
        try {
            setLoading(true);
            setError('');
            const result = await topicApi.getAll();

            if (result.success) {
                setTopics(result.data);
            } else {
                console.warn('Cannot load topics from API, using mock data');
                setTopics(mockTopics);
                // Don't set error for mock data, just log warning
            }
        } catch (err) {
            console.warn('Cannot load topics from API, using mock data');
            setTopics(mockTopics);
            // Don't set error for mock data, just log warning
        } finally {
            setLoading(false);
        }
    };

    const getTopicById = (topicId) => {
        return topics.find(topic => topic.id.toString() === topicId.toString());
    };

    const searchTopics = async (query) => {
        try {
            const result = await topicApi.search(query);
            return result.success ? result.data : [];
        } catch (err) {
            return [];
        }
    };

    const refreshTopics = () => {
        loadTopics();
    };

    useEffect(() => {
        loadTopics();
    }, []);

    return {
        topics,
        loading,
        error,
        getTopicById,
        searchTopics,
        refreshTopics,
        setError
    };
};

export default useTopics;