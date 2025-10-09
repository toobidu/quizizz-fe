import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useGameStore from '../../stores/useGameStore';
import authStore from '../../stores/authStore';
import socketService from '../../services/socketService';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/pages/game/GamePlay.css';

import {
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiUsers,
    FiAward,
    FiChevronRight,
    FiBarChart2,
    FiMessageCircle
} from 'react-icons/fi';

const GamePlay = () => {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const currentUser = authStore((state) => state.user);

    const {
        isGameActive,
        isGameStarting,
        isGameFinished,
        currentQuestion,
        answerResult,
        leaderboard,
        timeRemaining,
        hasAnswered,
        selectedAnswer,
        error,
        initGame,
        submitAnswer,
        nextQuestion,
        setupSocketListeners,
        cleanupSocketListeners,
        reset
    } = useGameStore();

    const [localSelectedAnswer, setLocalSelectedAnswer] = useState(null);

    useEffect(() => {
        if (roomCode && currentUser?.id) {
            console.log(`🚀 Initializing game for room: ${roomCode}`);
            
            // Initialize game state
            initGame(roomCode, false); // Assume not host for now
            
            // Setup socket listeners
            setupSocketListeners();
            
            // Join room if not already joined
            if (!socketService.getJoinedRooms().has(roomCode)) {
                socketService.joinRoom(roomCode, (response) => {
                    if (response.success) {
                        console.log('✅ Joined room for game:', response);
                    } else {
                        console.error('❌ Failed to join room for game:', response);
                    }
                });
            }
        }

        return () => {
            console.log(`🔌 Cleaning up game for room: ${roomCode}`);
            cleanupSocketListeners();
            reset();
        };
    }, [roomCode, currentUser?.id]);

    useEffect(() => {
        // Reset local state when a new question arrives
        setLocalSelectedAnswer(null);
    }, [currentQuestion]);

    const handleAnswerClick = (answerId) => {
        if (!hasAnswered) {
            setLocalSelectedAnswer(answerId);
        }
    };

    const handleSubmitAnswer = () => {
        if (localSelectedAnswer !== null && !hasAnswered) {
            console.log(`📤 Submitting answer: ${localSelectedAnswer}`);
            submitAnswer(localSelectedAnswer);
        }
    };

    const handleNextQuestion = () => {
        console.log('➡️ Requesting next question...');
        nextQuestion();
    };

    const handleViewResults = () => {
        console.log('🏆 Navigating to results page...');
        navigate(`/results/${roomCode}`);
    };

    // Render loading state
    if (isGameStarting || (!isGameActive && !isGameFinished)) {
        return (
            <div className={`game-play-container ${theme}`}>
                <div className="loading-screen">
                    <div className="loading-spinner"></div>
                    <p>{isGameStarting ? 'Starting game...' : 'Waiting for game to start...'}</p>
                </div>
            </div>
        );
    }

    // Render waiting for question state
    if (isGameActive && !currentQuestion) {
        return (
            <div className={`game-play-container ${theme}`}>
                <div className="loading-screen">
                    <div className="loading-spinner"></div>
                    <p>Loading next question...</p>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className={`game-play-container ${theme}`}>
                <div className="error-screen">
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
                </div>
            </div>
        );
    }

    // Render game over screen
    if (isGameFinished) {
        return (
            <div className={`game-play-container ${theme}`}>
                <div className="game-over-screen">
                    <h2>Game Over!</h2>
                    <p>The game has finished. Let's see the final results.</p>
                    <div className="final-rankings">
                        <h3><FiAward /> Final Rankings</h3>
                        <ul>
                            {leaderboard.map((player, index) => (
                                <li key={player.userId}>
                                    <span className={`rank-${index + 1}`}>#{index + 1}</span>
                                    <span className="player-name">{player.username}</span>
                                    <span className="player-score">{player.totalScore || 0} pts</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button className="view-results-button" onClick={handleViewResults}>
                        <FiBarChart2 /> View Detailed Results
                    </button>
                </div>
            </div>
        );
    }

    // Render question result screen
    if (answerResult && hasAnswered) {
        const isCorrect = answerResult.isCorrect;
        return (
            <div className={`game-play-container ${theme}`}>
                <div className={`question-result-screen ${isCorrect ? 'correct' : 'incorrect'}`}>
                    <div className="result-icon">
                        {isCorrect ? <FiCheckCircle /> : <FiXCircle />}
                    </div>
                    <h2>{isCorrect ? 'Correct!' : 'Incorrect!'}</h2>
                    <p>You earned {answerResult.score || 0} points.</p>
                    <div className="leaderboard-preview">
                        <h4><FiUsers /> Leaderboard</h4>
                        <ul>
                            {leaderboard.slice(0, 5).map((player, index) => (
                                <li key={player.userId}>
                                    <span>#{index + 1} {player.username}</span>
                                    <span>{player.totalScore || 0}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button className="next-question-button" onClick={handleNextQuestion}>
                        Next <FiChevronRight />
                    </button>
                </div>
            </div>
        );
    }

    // Render the main game play screen (question and answers)
    return (
        <div className={`game-play-container ${theme}`}>
            <div className="game-header">
                <div className="question-counter">
                    Question {currentQuestion.sequence} of {currentQuestion.totalQuestions}
                </div>
                <div className="timer">
                    <FiClock />
                    <span>{timeRemaining}s</span>
                </div>
                <div className="player-score">
                    <FiAward />
                    <span>{leaderboard.find(p => p.userId === currentUser?.id)?.totalScore || 0} pts</span>
                </div>
            </div>

            <div className="question-section">
                <h2>{currentQuestion.content}</h2>
                {currentQuestion.imageUrl && (
                    <div className="question-image">
                        <img src={currentQuestion.imageUrl} alt="Question visual aid" />
                    </div>
                )}
            </div>

            <div className="answers-section">
                {currentQuestion.answers.map((answer, index) => (
                    <button
                        key={index}
                        className={`answer-option color-${index} ${localSelectedAnswer === index ? 'selected' : ''}`}
                        onClick={() => handleAnswerClick(index)}
                        disabled={hasAnswered}
                    >
                        <span className="answer-text">{answer.content}</span>
                    </button>
                ))}
            </div>

            <div className="game-footer">
                {!hasAnswered ? (
                    <button
                        className="submit-answer-button"
                        onClick={handleSubmitAnswer}
                        disabled={localSelectedAnswer === null}
                    >
                        Submit Answer
                    </button>
                ) : (
                    <div className="waiting-for-results">
                        <div className="loading-spinner-small"></div>
                        <p>Waiting for other players...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GamePlay;
