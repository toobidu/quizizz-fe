import { useState, useEffect } from 'react';
import teacherApi from '../services/teacherApi';
import '../../../styles/features/teacher/Statistics.css';

const Statistics = () => {
    const [mostCorrect, setMostCorrect] = useState([]);
    const [mostIncorrect, setMostIncorrect] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            const [correct, incorrect] = await Promise.all([
                teacherApi.getMostCorrectQuestions(),
                teacherApi.getMostIncorrectQuestions()
            ]);
            setMostCorrect(correct.data || []);
            setMostIncorrect(incorrect.data || []);
        } catch (error) {
            console.error('Error loading statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className="statistics-page">
            <h1>Thống kê</h1>
            
            <div className="stats-section">
                <h2>Câu hỏi người chơi trả lời đúng nhiều nhất</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Câu hỏi</th>
                            <th>Chủ đề</th>
                            <th>Tỷ lệ đúng</th>
                            <th>Lượt chơi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mostCorrect.map((q) => (
                            <tr key={q.id}>
                                <td>{q.questionText}</td>
                                <td>{q.topicName}</td>
                                <td>{q.correctRate}%</td>
                                <td>{q.playCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="stats-section">
                <h2>Câu hỏi người chơi trả lời sai nhiều nhất</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Câu hỏi</th>
                            <th>Chủ đề</th>
                            <th>Tỷ lệ sai</th>
                            <th>Lượt chơi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mostIncorrect.map((q) => (
                            <tr key={q.id}>
                                <td>{q.questionText}</td>
                                <td>{q.topicName}</td>
                                <td>{q.incorrectRate}%</td>
                                <td>{q.playCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Statistics;
