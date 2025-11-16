import { useState, useEffect } from 'react';
import { FiTarget } from 'react-icons/fi';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import leaderboardApi from '../../../services/leaderboardApi';
import topicApi from '../../../services/topicApi';
import Decoration from '../../../components/Decoration';
import '../../../styles/pages/Leaderboard.css';

function Leaderboard() {
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTopics();
    }, []);

    useEffect(() => {
        if (selectedTopic) {
            fetchLeaderboard(selectedTopic);
        }
    }, [selectedTopic]);

    const fetchTopics = async () => {
        try {
            const result = await topicApi.getAll();
            if (result.success && result.data.length > 0) {
                setTopics(result.data);
                setSelectedTopic(result.data[0].id);
            }
        } catch (err) {
            setError('Không thể tải danh sách chủ đề');
        }
    };

    const fetchLeaderboard = async (topicId) => {
        setLoading(true);
        setError('');
        try {
            const result = await leaderboardApi.getLeaderboardByTopic(topicId);
            if (result.success) {
                setLeaderboard(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Không thể tải bảng xếp hạng');
        } finally {
            setLoading(false);
        }
    };

    const getMedalIcon = (rank) => {
        if (rank === 1) return <FaTrophy style={{ color: '#FFD700' }} />;
        if (rank === 2) return <FaTrophy style={{ color: '#C0C0C0' }} />;
        if (rank === 3) return <FaTrophy style={{ color: '#CD7F32' }} />;
        return null;
    };

    const getTopicName = () => {
        const topic = topics.find(t => t.id === selectedTopic);
        return topic?.name || 'Tất cả';
    };

    return (
        <div className="lb-layout">
            <Decoration />
            <main className="lb-content">
                <div className="lb-container">
                    <div className="lb-header">
                        <div className="lb-title-section">
                            <FaTrophy className="lb-title-icon" />
                            <h1 className="lb-title">Bảng Xếp Hạng</h1>
                        </div>
                        <p className="lb-subtitle">Top 20 người chơi xuất sắc nhất</p>
                    </div>

                    <div className="lb-filter-section">
                        <label className="lb-filter-label">
                            <FiTarget />
                            Chủ đề:
                        </label>
                        <select
                            className="lb-filter-select"
                            value={selectedTopic || ''}
                            onChange={(e) => setSelectedTopic(Number(e.target.value))}
                        >
                            {topics.map(topic => (
                                <option key={topic.id} value={topic.id}>
                                    {topic.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {loading ? (
                        <div className="lb-loading">
                            <div className="lb-spinner"></div>
                            <p>Đang tải bảng xếp hạng...</p>
                        </div>
                    ) : error ? (
                        <div className="lb-error">
                            <p>{error}</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="lb-empty">
                            <FaMedal className="lb-empty-icon" />
                            <p>Chưa có dữ liệu xếp hạng cho chủ đề này</p>
                        </div>
                    ) : (
                        <>
                            <div className="lb-topic-name">
                                Bảng xếp hạng: <strong>{getTopicName()}</strong>
                            </div>
                            <div className="lb-table-container">
                                <table className="lb-table">
                                    <thead>
                                        <tr>
                                            <th>Hạng</th>
                                            <th>Người chơi</th>
                                            <th>Điểm TB</th>
                                            <th>Số trận</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((entry) => (
                                            <tr key={entry.userId} className={`lb-row rank-${entry.rank}`}>
                                                <td className="lb-rank">
                                                    {getMedalIcon(entry.rank) || `#${entry.rank}`}
                                                </td>
                                                <td className="lb-player">
                                                    <div className="lb-player-info">
                                                        <div className="lb-avatar">
                                                            {entry.username.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="lb-username">{entry.username}</span>
                                                    </div>
                                                </td>
                                                <td className="lb-score">{entry.averageScore.toFixed(2)}</td>
                                                <td className="lb-games">{entry.gamesPlayed}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Leaderboard;
