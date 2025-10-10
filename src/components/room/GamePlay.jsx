import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useGameStore from '../../stores/useGameStore';
import useRoomStore from '../../stores/useRoomStore';
import socketService from '../../services/socketService';
import '../../styles/components/room/GamePlay.css';

/**
 * GamePlay Component - Real-time quiz gameplay
 * Similar to Kahoot/Quizizz game interface
 */
const GamePlay = ({ isHost, onLeave }) => {
    const { roomId } = useParams();

    const {
        currentQuestion,
        currentQuestionIndex,
        totalQuestions,
        timeRemaining,
        selectedAnswer,
        hasAnswered,
        answerResult,
        players,
        submitAnswer,
        nextQuestion
    } = useGameStore();

    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        // Show results for 3 seconds after answering
        if (hasAnswered && answerResult) {
            setShowResults(true);
            const timer = setTimeout(() => {
                setShowResults(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [hasAnswered, answerResult]);

    /**
     * Handle answer selection
     */
    const handleAnswerClick = (answerId) => {
        if (hasAnswered) return;
        submitAnswer(answerId);
    };

    /**
     * Handle next question (host only)
     */
    const handleNextQuestion = () => {
        if (isHost) {
            nextQuestion();
        }
    };

    if (!currentQuestion) {
        return (
            <div className="game-play-container">
                <div className="loading-question">
                    <div className="spinner"></div>
                    <p>Đang tải câu hỏi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="game-play-container">
            {/* Header */}
            <div className="game-header">
                <div className="question-progress">
                    <span>Câu {currentQuestionIndex}/{totalQuestions}</span>
                </div>
                <div className="timer-display">
                    <span className={timeRemaining <= 5 ? 'timer-critical' : ''}>
                        ⏱️ {timeRemaining}s
                    </span>
                </div>
                <button className="btn-leave" onClick={onLeave}>
                    Rời phòng
                </button>
            </div>

            {/* Question Display */}
            <div className="question-section">
                <h2 className="question-text">{currentQuestion.questionText}</h2>

                {currentQuestion.imageUrl && (
                    <img
                        src={currentQuestion.imageUrl}
                        alt="Question"
                        className="question-image"
                    />
                )}
            </div>

            {/* Answer Options */}
            {!showResults ? (
                <div className="answers-grid">
                    {currentQuestion.answers?.map((answer, index) => (
                        <button
                            key={answer.id}
                            className={`answer-option ${selectedAnswer === answer.id ? 'selected' : ''
                            } ${hasAnswered ? 'disabled' : ''}`}
                            onClick={() => handleAnswerClick(answer.id)}
                            disabled={hasAnswered}
                            style={{
                                animationDelay: `${index * 0.1}s`,
                                backgroundColor: getAnswerColor(index)
                            }}
                        >
                            <span className="answer-icon">{getAnswerIcon(index)}</span>
                            <span className="answer-text">{answer.answerText}</span>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="answer-result-section">
                    <div className={`result-card ${answerResult?.isCorrect ? 'correct' : 'incorrect'}`}>
                        <div className="result-icon">
                            {answerResult?.isCorrect ? '✅' : '❌'}
                        </div>
                        <h3>
                            {answerResult?.isCorrect ? 'Chính xác!' : 'Sai rồi!'}
                        </h3>
                        <p className="points-earned">
                            +{answerResult?.score || 0} điểm
                        </p>

                        {/* Show correct answer if wrong */}
                        {!answerResult?.isCorrect && (
                            <div className="correct-answer-display">
                                <p>Đáp án đúng:</p>
                                <p className="correct-answer-text">
                                    {currentQuestion.answers?.find(a => a.isCorrect)?.answerText}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Players who answered */}
                    <div className="players-answered">
                        <h4>Đã trả lời: {players.filter(p => p.hasAnswered).length}/{players.length}</h4>
                    </div>

                    {/* Next button for host */}
                    {isHost && (
                        <button
                            className="btn-next-question"
                            onClick={handleNextQuestion}
                        >
                            Câu tiếp theo →
                        </button>
                    )}
                </div>
            )}

            {/* Mini Leaderboard */}
            <div className="mini-leaderboard">
                <h4>🏆 Top 3</h4>
                <div className="top-players">
                    {players.slice(0, 3).map((player, index) => (
                        <div key={player.userId} className="top-player">
                            <span className="rank">#{index + 1}</span>
                            <span className="name">{player.username}</span>
                            <span className="score">{player.totalScore || 0}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * Get color for answer option
 */
const getAnswerColor = (index) => {
    const colors = ['#e74c3c', '#3498db', '#f39c12', '#2ecc71'];
    return colors[index % colors.length];
};

/**
 * Get icon for answer option
 */
const getAnswerIcon = (index) => {
    const icons = ['△', '◇', '○', '□'];
    return icons[index % icons.length];
};

export default GamePlay;
