import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useWebSocketCleanup from '../../hooks/useWebSocketCleanup';
import websocketService from '../../services/websocketService';
import authStore from '../../stores/authStore';
import { toast } from 'react-toastify';
import '../../styles/components/room/GameRoom.css';

const GameRoom = () => {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const { currentUser } = authStore();
    const [gameState, setGameState] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [gameResults, setGameResults] = useState(null);
    const timerRef = useRef(null);

    // Cleanup WebSocket on unmount
    useWebSocketCleanup();

    useEffect(() => {
        if (!currentUser || !roomCode) {
            navigate('/');
            return;
        }

        initializeWebSocket();

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [roomCode, currentUser]);

    const initializeWebSocket = async () => {
        try {
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            await websocketService.connect(token);
            setIsConnected(true);

            // Subscribe to game events
            setupGameSubscriptions();

            // Request current game state
            websocketService.send(`/app/game/${roomCode}/state`, {});

        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            toast.error('Không thể kết nối đến game. Vui lòng thử lại!');
            navigate('/dashboard');
        }
    };

    const setupGameSubscriptions = () => {
        // Game state updates
        websocketService.subscribe(`/topic/game/${roomCode}`, (message) => {
            handleGameMessage(message);
        });

        // Personal messages
        websocketService.subscribe(`/user/queue/game/${roomCode}/result`, (message) => {
            handlePersonalMessage(message);
        });

        // Game state updates
        websocketService.subscribe(`/topic/game/${roomCode}/state`, (message) => {
            if (message.type === 'GAME_STATE_UPDATE') {
                setGameState(message.data);
            }
        });

        // Real-time updates
        websocketService.subscribe(`/topic/game/${roomCode}/update`, (message) => {
            if (message.type === 'GAME_UPDATE') {
                setGameState(message.data);
                if (message.data.timeRemaining !== undefined) {
                    setTimeRemaining(message.data.timeRemaining);
                }
            }
        });
    };

    const handleGameMessage = (message) => {
        console.log('Game message received:', message);

        switch (message.type) {
            case 'GAME_STARTED':
                setGameState(message.data);
                toast.success('Game đã bắt đầu!');
                break;

            case 'NEXT_QUESTION':
                setCurrentQuestion(message.data);
                setSelectedAnswer(null);
                setHasAnswered(false);
                setTimeRemaining(message.data.timeLimit);
                startQuestionTimer(message.data.timeLimit);
                break;

            case 'GAME_ENDED':
                setGameResults(message.data);
                setCurrentQuestion(null);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
                break;

            case 'GAME_STATE':
                setGameState(message.data);
                break;

            default:
                console.log('Unknown game message type:', message.type);
        }
    };

    const handlePersonalMessage = (message) => {
        if (message.type === 'ANSWER_RESULT') {
            const result = message.data;
            if (result.isCorrect) {
                toast.success(`Đúng rồi! +${result.pointsEarned} điểm`);
            } else {
                toast.error(`Sai rồi! Đáp án đúng: ${result.correctAnswer}`);
            }
        }
    };

    const startQuestionTimer = (seconds) => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    if (!hasAnswered) {
                        // Auto-submit empty answer when time runs out
                        submitAnswer();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const submitAnswer = () => {
        if (hasAnswered || !currentQuestion) return;

        const answerData = {
            questionId: currentQuestion.questionId,
            selectedAnswer: selectedAnswer,
            selectedOptionIndex: selectedAnswer ? currentQuestion.options.indexOf(selectedAnswer) : -1,
            submissionTime: Date.now(),
            answerText: selectedAnswer
        };

        websocketService.send(`/app/game/${roomCode}/answer`, answerData);
        setHasAnswered(true);

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    const startGame = () => {
        websocketService.send(`/app/game/${roomCode}/start`, {});
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getPlayerRankColor = (rank) => {
        switch (rank) {
            case 1: return '#FFD700'; // Gold
            case 2: return '#C0C0C0'; // Silver
            case 3: return '#CD7F32'; // Bronze
            default: return '#666';
        }
    };

    if (!isConnected) {
        return (
            <div className="game-room loading">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Đang kết nối đến game...</p>
                </div>
            </div>
        );
    }

    // Show results screen
    if (gameResults) {
        return (
            <div className="game-room results">
                <div className="results-container">
                    <h2>🎉 Kết quả game</h2>
                    <div className="final-leaderboard">
                        {gameResults.rankings.map((player, index) => (
                            <div key={player.userId} className={`result-item rank-${index + 1}`}>
                                <div className="rank-badge" style={{ backgroundColor: getPlayerRankColor(index + 1) }}>
                                    #{index + 1}
                                </div>
                                <div className="player-info">
                                    <img
                                        src={player.avatarUrl || '/default-avatar.png'}
                                        alt={player.displayName}
                                        className="player-avatar"
                                    />
                                    <div className="player-details">
                                        <h3>{player.displayName}</h3>
                                        <p>{player.score} điểm</p>
                                        <p>{player.correctAnswers}/{player.totalAnswers} đúng</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="results-actions">
                        <button onClick={() => navigate('/dashboard')} className="btn-primary">
                            Về Dashboard
                        </button>
                        <button onClick={() => startGame()} className="btn-secondary">
                            Chơi lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show question screen
    if (currentQuestion) {
        return (
            <div className="game-room playing">
                <div className="game-header">
                    <div className="question-progress">
                        Câu {currentQuestion.currentQuestionNumber}/{currentQuestion.totalQuestions}
                    </div>
                    <div className={`timer ${timeRemaining <= 10 ? 'urgent' : ''}`}>
                        ⏱️ {formatTime(timeRemaining)}
                    </div>
                    <div className="score">
                        {gameState?.players?.find(p => p.userId === currentUser.id)?.score || 0} điểm
                    </div>
                </div>

                <div className="question-container">
                    {currentQuestion.imageUrl && (
                        <div className="question-image">
                            <img src={currentQuestion.imageUrl} alt="Question" />
                        </div>
                    )}

                    <h2 className="question-text">{currentQuestion.questionText}</h2>

                    <div className="options-container">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                className={`option-btn ${selectedAnswer === option ? 'selected' : ''} ${hasAnswered ? 'disabled' : ''}`}
                                onClick={() => !hasAnswered && setSelectedAnswer(option)}
                                disabled={hasAnswered}
                            >
                                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                <span className="option-text">{option}</span>
                            </button>
                        ))}
                    </div>

                    <div className="question-actions">
                        <button
                            className={`submit-btn ${!selectedAnswer || hasAnswered ? 'disabled' : ''}`}
                            onClick={submitAnswer}
                            disabled={!selectedAnswer || hasAnswered}
                        >
                            {hasAnswered ? 'Đã trả lời' : 'Gửi đáp án'}
                        </button>
                    </div>
                </div>

                {/* Real-time player status */}
                <div className="players-status">
                    <h3>Trạng thái người chơi:</h3>
                    <div className="players-grid">
                        {gameState?.players?.map(player => (
                            <div key={player.userId} className={`player-status ${player.hasAnswered ? 'answered' : 'waiting'}`}>
                                <img
                                    src={player.avatarUrl || '/default-avatar.png'}
                                    alt={player.displayName}
                                    className="mini-avatar"
                                />
                                <span className="player-name">{player.displayName}</span>
                                <span className="status-indicator">
                                    {player.hasAnswered ? '✅' : '⏳'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Show waiting/lobby screen
    return (
        <div className="game-room waiting">
            <div className="waiting-container">
                <h2>🎮 Phòng Game: {roomCode}</h2>

                {gameState && (
                    <div className="game-info">
                        <p>Trạng thái: <span className="status">{gameState.gameStatus}</span></p>
                        <p>Tổng câu hỏi: {gameState.totalQuestions}</p>

                        <div className="players-list">
                            <h3>Người chơi ({gameState.players?.length || 0}):</h3>
                            {gameState.players?.map(player => (
                                <div key={player.userId} className="player-item">
                                    <img
                                        src={player.avatarUrl || '/default-avatar.png'}
                                        alt={player.displayName}
                                        className="player-avatar"
                                    />
                                    <span className="player-name">
                                        {player.displayName}
                                        {player.userId === currentUser.id && ' (Bạn)'}
                                    </span>
                                    <span className={`player-status ${player.status.toLowerCase()}`}>
                                        {player.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="waiting-actions">
                    {gameState?.isHost && (
                        <button onClick={startGame} className="btn-primary start-btn">
                            🚀 Bắt đầu Game
                        </button>
                    )}

                    <button onClick={() => navigate('/dashboard')} className="btn-secondary">
                        Rời phòng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameRoom;