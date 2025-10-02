import React from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../../stores/useGameStore';
import '../../styles/components/room/GameResults.css';

/**
 * GameResults Component - Final leaderboard and statistics
 * Similar to Kahoot/Quizizz results screen
 */
const GameResults = ({ onExit }) => {
    const navigate = useNavigate();

    const {
        leaderboard,
        totalQuestions,
        players
    } = useGameStore();

    /**
     * Handle play again
     */
    const handlePlayAgain = () => {
        // Navigate back to dashboard to create/join new game
        navigate('/dashboard');
    };

    /**
     * Get medal emoji for ranking
     */
    const getMedal = (rank) => {
        switch (rank) {
            case 0: return '🥇';
            case 1: return '🥈';
            case 2: return '🥉';
            default: return '🏅';
        }
    };

    /**
     * Get podium position class
     */
    const getPodiumClass = (rank) => {
        switch (rank) {
            case 0: return 'podium-first';
            case 1: return 'podium-second';
            case 2: return 'podium-third';
            default: return '';
        }
    };

    return (
        <div className="game-results-container">
            {/* Confetti animation */}
            <div className="confetti-container">
                {[...Array(50)].map((_, i) => (
                    <div key={i} className="confetti" style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 3}s`,
                        backgroundColor: ['#e74c3c', '#3498db', '#f39c12', '#2ecc71'][Math.floor(Math.random() * 4)]
                    }} />
                ))}
            </div>

            {/* Header */}
            <div className="results-header">
                <h1>🎉 Trò chơi kết thúc!</h1>
                <p className="game-stats">
                    Tổng số câu: {totalQuestions} | Người chơi: {players.length}
                </p>
            </div>

            {/* Podium - Top 3 */}
            <div className="podium-section">
                <h2>🏆 Podium</h2>
                <div className="podium">
                    {leaderboard.slice(0, 3).map((player, index) => {
                        const podiumOrder = index === 0 ? 0 : index === 1 ? 2 : 1; // Center winner
                        return (
                            <div
                                key={player.userId}
                                className={`podium-place ${getPodiumClass(index)}`}
                                style={{ order: podiumOrder }}
                            >
                                <div className="player-avatar">
                                    <img
                                        src={player.avatar || '/default-avatar.png'}
                                        alt={player.username}
                                    />
                                </div>
                                <div className="medal">{getMedal(index)}</div>
                                <h3>{player.username}</h3>
                                <p className="score">{player.totalScore} điểm</p>
                                <div className={`podium-base rank-${index + 1}`}>
                                    <span className="rank-number">#{index + 1}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Full Leaderboard */}
            <div className="leaderboard-section">
                <h2>📊 Bảng xếp hạng</h2>
                <div className="leaderboard-table">
                    <div className="leaderboard-header">
                        <span>Hạng</span>
                        <span>Tên</span>
                        <span>Điểm</span>
                        <span>Độ chính xác</span>
                    </div>
                    <div className="leaderboard-body">
                        {leaderboard.map((player, index) => (
                            <div
                                key={player.userId}
                                className={`leaderboard-row ${index < 3 ? 'top-three' : ''}`}
                            >
                                <span className="rank">
                                    {index < 3 ? getMedal(index) : `#${index + 1}`}
                                </span>
                                <span className="player-name">
                                    <img
                                        src={player.avatar || '/default-avatar.png'}
                                        alt={player.username}
                                        className="mini-avatar"
                                    />
                                    {player.username}
                                </span>
                                <span className="score">{player.totalScore || 0}</span>
                                <span className="accuracy">
                                    {calculateAccuracy(player)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action buttons */}
            <div className="results-actions">
                <button className="btn-primary" onClick={handlePlayAgain}>
                    🎮 Chơi lại
                </button>
                <button className="btn-secondary" onClick={onExit}>
                    🏠 Về trang chủ
                </button>
            </div>
        </div>
    );
};

/**
 * Calculate player accuracy percentage
 */
const calculateAccuracy = (player) => {
    if (!player.correctAnswers || !player.totalAnswers) return 0;
    return Math.round((player.correctAnswers / player.totalAnswers) * 100);
};

export default GameResults;
