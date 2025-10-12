import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socketService from '../../services/socketService';
import authStore from '../../stores/authStore';
import useRoomStore from '../../stores/useRoomStoreRealtime'; // ✅ FIX: Use realtime store
import { toast } from 'react-toastify';
import '../../styles/components/room/GameRoom.css';

const GameRoom = () => {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const currentUser = authStore((state) => state.user);
    const { currentRoom } = useRoomStore();

    const [gameState, setGameState] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isConnected, setIsConnected] = useState(true); // ✅ FIX: Start as true since already connected
    const [gameResults, setGameResults] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const timerRef = useRef(null);
    const questionStartTimeRef = useRef(null);

    // ✅ FIX: Initialize with game-started event data from WaitingRoom
    useEffect(() => {
        if (!currentUser || !roomCode) {
            console.error('❌ No user or roomCode, redirecting to home');
            navigate('/');
            return;
        }

        console.log('🎮 GameRoom mounted for room:', roomCode);
        console.log('🎮 Current room from store:', currentRoom);

        // ✅ Socket should already be connected from WaitingRoom
        if (socketService.isConnected()) {
            setIsConnected(true);
            setupGameSubscriptions();

            // ✅ FIX: Request current game state to get ongoing question if game already started
            if (currentRoom?.id) {
                console.log('🔄 Requesting current game state for room:', currentRoom.id);
                socketService.emit('get-game-state', { roomId: currentRoom.id }, (response) => {
                    console.log('📦 Received game state:', response);
                    if (response && response.currentQuestion) {
                        console.log('📝 Setting current question from game state');
                        setCurrentQuestion(response.currentQuestion);
                        setSelectedAnswer(null);
                        setHasAnswered(false);
                        setTimeRemaining(response.currentQuestion.timeLimit || 30);
                        questionStartTimeRef.current = Date.now();
                        startQuestionTimer(response.currentQuestion.timeLimit || 30);
                    }
                    if (response && response.players) {
                        setGameState(response);
                    }
                });
            }
        } else {
            console.warn('⚠️ Socket not connected, trying to connect...');
            initializeWebSocket();
        }

        return () => {
            console.log('🧹 GameRoom cleanup');
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            // ✅ DON'T disconnect from room - let user stay in room
        };
    }, [roomCode, currentUser]);

    const initializeWebSocket = async () => {
        try {
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            if (!token) {
                throw new Error('No authentication token found');
            }

            await socketService.connect(token);
            setIsConnected(true);
            setupGameSubscriptions();

        } catch (error) {
            console.error('❌ Failed to connect socket:', error);
            toast.error('Không thể kết nối đến game. Vui lòng thử lại!');
            // ✅ FIX: Don't navigate immediately, give user a chance to retry
            setIsLoading(false);
        }
    };

    const setupGameSubscriptions = () => {
        console.log('📡 Setting up game subscriptions...');

        // ✅ FIX: Remove any existing listeners before adding new ones to prevent duplicates
        socketService.off('game-started');
        socketService.off('next-question');
        socketService.off('answer-submitted');
        socketService.off('player-answered');
        socketService.off('game-ended');
        socketService.off('game-finished');

        // ✅ Listen for game-started event (contains first question)
        socketService.on('game-started', (data) => {
            console.log('🎮 game-started event in GameRoom:', data);
            handleGameMessage({ type: 'GAME_STARTED', data });
        });

        // ✅ Listen for next-question event
        socketService.on('next-question', (data) => {
            console.log('➡️ next-question event:', data);
            handleGameMessage({ type: 'NEXT_QUESTION', data });
        });

        // ✅ Listen for answer-submitted event (personal result) - ONCE per answer
        const answerSubmittedHandler = (data) => {
            console.log('✅ answer-submitted event:', data);
            handlePersonalMessage({ type: 'ANSWER_RESULT', data });
        };
        socketService.on('answer-submitted', answerSubmittedHandler);

        // ✅ Listen for player-answered event (other players)
        socketService.on('player-answered', (data) => {
            console.log('👥 player-answered event:', data);
            // Only update other players' status, not score
            setGameState(prev => {
                if (!prev || !prev.players) return prev;
                return {
                    ...prev,
                    players: prev.players.map(p =>
                        p.userId === data.userId
                            ? { ...p, hasAnswered: true }
                            : p
                    )
                };
            });
        });

        // ✅ Listen for game-ended/game-finished
        socketService.on('game-ended', (data) => {
            console.log('🏁 game-ended event:', data);
            handleGameMessage({ type: 'GAME_ENDED', data });
        });

        socketService.on('game-finished', (data) => {
            console.log('🏁 game-finished event:', data);
            handleGameMessage({ type: 'GAME_ENDED', data });
        });

        setIsLoading(false);
        console.log('✅ Game subscriptions setup complete');
    };

    const handleGameMessage = (message) => {
        console.log('📨 Handling game message:', message.type, message.data);

        switch (message.type) {
            case 'GAME_STARTED':
                // ✅ Extract first question from game-started event
                if (message.data.question) {
                    console.log('📝 Game started question:', JSON.stringify(message.data.question, null, 2));
                    console.log('📝 Question text:', message.data.question.questionText);
                    console.log('📝 Answers:', message.data.question.answers);

                    // ✅ FIX: Khởi tạo gameState với players từ currentRoom
                    if (currentRoom?.players) {
                        setGameState({
                            players: currentRoom.players.map(p => ({
                                ...p,
                                score: 0, // Khởi tạo điểm = 0
                                hasAnswered: false
                            }))
                        });
                        console.log('✅ Initialized gameState with players:', currentRoom.players);
                    }

                    setCurrentQuestion(message.data.question);
                    setSelectedAnswer(null);
                    setHasAnswered(false);
                    setTimeRemaining(message.data.question.timeLimit || 30);
                    questionStartTimeRef.current = Date.now();
                    startQuestionTimer(message.data.question.timeLimit || 30);
                    toast.success('Game đã bắt đầu!');
                }
                break;

            case 'NEXT_QUESTION':
                console.log('📝 Next question:', JSON.stringify(message.data, null, 2));

                // ✅ FIX: Backend gửi {question: {...}, timestamp: ...}
                // Cần lấy từ message.data.question, KHÔNG phải message.data trực tiếp
                const nextQuestionData = message.data.question || message.data;

                console.log('📝 Question text:', nextQuestionData.questionText);
                console.log('📝 Answers:', nextQuestionData.answers);

                setCurrentQuestion(nextQuestionData);
                setSelectedAnswer(null);
                setHasAnswered(false);
                setTimeRemaining(nextQuestionData.timeLimit || 30);
                questionStartTimeRef.current = Date.now();
                startQuestionTimer(nextQuestionData.timeLimit || 30);
                toast.info(`Câu hỏi ${nextQuestionData.questionNumber}/${nextQuestionData.totalQuestions}`);
                break;

            case 'GAME_ENDED':
                setGameResults(message.data);
                setCurrentQuestion(null);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
                toast.info('Game đã kết thúc!');
                break;

            default:
                console.log('⚠️ Unknown message type:', message.type);
        }
    };

    const handlePersonalMessage = (message) => {
        if (message.type === 'ANSWER_RESULT') {
            const result = message.data.result || message.data;

            // ✅ Update local score immediately
            const earnedScore = result.score || result.pointsEarned || 0;

            // ✅ Update gameState with new score
            setGameState(prev => {
                if (!prev || !prev.players) return prev;
                return {
                    ...prev,
                    players: prev.players.map(p =>
                        p.userId === currentUser.id
                            ? { ...p, score: (p.score || 0) + earnedScore, hasAnswered: true }
                            : p
                    )
                };
            });

            if (result.isCorrect) {
                toast.success(`Đúng rồi! +${earnedScore} điểm`, { toastId: 'answer-result' });
            } else {
                toast.error(`Sai rồi!`, { toastId: 'answer-result' });
            }

            // ✅ NEW: Kiểm tra xem có câu hỏi tiếp theo không
            if (message.data.hasNextQuestion && message.data.nextQuestion) {
                // Có câu tiếp theo - tự động chuyển
                console.log('➡️ Auto-advancing to next question:', message.data.nextQuestion);

                const nextQ = message.data.nextQuestion;
                setCurrentQuestion(nextQ);
                setSelectedAnswer(null);
                setHasAnswered(false);
                setTimeRemaining(nextQ.timeLimit || 30);
                questionStartTimeRef.current = Date.now();
                startQuestionTimer(nextQ.timeLimit || 30);

                toast.info(`Câu ${nextQ.questionNumber}/${nextQ.totalQuestions}`, {
                    autoClose: 1000,
                    toastId: 'next-question'
                });
            } else if (message.data.completed) {
                // Player này đã hoàn thành tất cả câu hỏi
                console.log('🏁 Player completed all questions, waiting for others...');
                setCurrentQuestion(null);
                setHasAnswered(false);

                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }

                toast.success('🎉 Bạn đã hoàn thành! Đang chờ người chơi khác...', {
                    autoClose: false,
                    toastId: 'completed'
                });
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

        console.log('📤 Submitting answer:', selectedAnswer);
        console.log('📤 Current question:', currentQuestion);

        // ✅ FIX: Backend returns 'answers', not 'options'
        const roomId = currentRoom?.id;
        const questionId = currentQuestion.questionId || currentQuestion.id;
        const questionOptions = currentQuestion.answers || currentQuestion.options || [];

        // ✅ FIX: Find the answer object that matches selectedAnswer text
        const selectedAnswerObj = questionOptions.find(opt =>
            (opt.text || opt.answerText || opt) === selectedAnswer
        );
        const selectedOptionIndex = questionOptions.findIndex(opt =>
            (opt.text || opt.answerText || opt) === selectedAnswer
        );
        const answerId = selectedAnswerObj?.id;

        const timeTaken = questionStartTimeRef.current ? Date.now() - questionStartTimeRef.current : 0;

        console.log('📤 Selected answer object:', selectedAnswerObj);
        console.log('📤 Selected option index:', selectedOptionIndex);
        console.log('📤 Answer ID:', answerId);
        console.log('📤 Time taken:', timeTaken);

        // ✅ Send to backend with all required fields
        socketService.emit('submit-answer', {
            roomId: roomId,
            questionId: questionId,
            answerId: answerId,
            selectedAnswer: selectedAnswer,
            selectedOptionIndex: selectedOptionIndex,
            answerText: selectedAnswer,
            timeTaken: timeTaken
        });

        setHasAnswered(true);

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    const startGame = () => {
        socketService.emit('startGame', { roomCode });
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
        // ✅ FIX: Backend trả về 'ranking', không phải 'rankings'
        const rankings = gameResults.result?.ranking || gameResults.ranking || [];

        console.log('🏆 Game results:', gameResults);
        console.log('🏆 Rankings:', rankings);

        return (
            <div className="game-room results">
                <div className="results-container">
                    <h2 className="results-title">🎉 Kết Quả Game</h2>

                    <div className="final-leaderboard">
                        {rankings.length > 0 ? (
                            rankings.map((player, index) => (
                                <div key={player.userId} className={`result-item rank-${index + 1}`}>
                                    <div className="rank-badge" style={{ backgroundColor: getPlayerRankColor(index + 1) }}>
                                        <span className="rank-number">#{index + 1}</span>
                                        {index === 0 && <span className="rank-icon">👑</span>}
                                    </div>
                                    <div className="player-info">
                                        <div className="player-avatar-wrapper">
                                            <img
                                                src={player.avatarUrl || '/default-avatar.png'}
                                                alt={player.userName}
                                                className="player-avatar"
                                            />
                                        </div>
                                        <div className="player-details">
                                            <h3 className="player-name">
                                                {player.userName || `User ${player.userId}`}
                                                {player.userId === currentUser?.id && <span className="you-badge"> (Bạn)</span>}
                                            </h3>
                                            <div className="player-stats">
                                                <span className="stat-item">
                                                    <strong>{player.totalScore || 0}</strong> điểm
                                                </span>
                                                <span className="stat-separator">•</span>
                                                <span className="stat-item">
                                                    <strong>{(player.totalTime / 1000).toFixed(1)}s</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {index < 3 && (
                                        <div className="medal-icon">
                                            {index === 0 && '🥇'}
                                            {index === 1 && '🥈'}
                                            {index === 2 && '🥉'}
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="no-results">
                                <p>Không có kết quả</p>
                            </div>
                        )}
                    </div>

                    <div className="results-actions">
                        <button onClick={() => navigate('/dashboard')} className="btn-primary">
                            🏠 Về Dashboard
                        </button>
                        <button onClick={() => navigate('/rooms')} className="btn-secondary">
                            🎮 Tìm phòng khác
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show question screen
    if (currentQuestion) {
        // ✅ FIX: Backend returns 'answers' with field 'text', not 'answerText'
        const questionOptions = currentQuestion.answers || currentQuestion.options || [];

        console.log('🎯 Rendering question:', currentQuestion.questionText);
        console.log('🎯 Question number:', currentQuestion.questionNumber || currentQuestion.questionId);
        console.log('🎯 Available options:', questionOptions);

        return (
            <div className="game-room playing">
                <div className="game-header">
                    <div className="question-progress">
                        Câu {currentQuestion.questionNumber || 1}/{currentQuestion.totalQuestions || '?'}
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
                        {questionOptions.length > 0 ? (
                            questionOptions.map((option, index) => {
                                // ✅ FIX: Backend returns {id, text} not {id, answerText}
                                const optionText = option.text || option.answerText || option;
                                const optionId = option.id || index;

                                console.log(`🎯 Option ${index}:`, optionText, '(from object:', option, ')');

                                return (
                                    <button
                                        key={optionId}
                                        className={`option-btn ${selectedAnswer === optionText ? 'selected' : ''} ${hasAnswered ? 'disabled' : ''}`}
                                        onClick={() => !hasAnswered && setSelectedAnswer(optionText)}
                                        disabled={hasAnswered}
                                    >
                                        <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                                        <span className="option-text">{optionText}</span>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="no-options">
                                <p>⚠️ Không có đáp án nào được tải</p>
                                <p>Debug info: {JSON.stringify(currentQuestion, null, 2)}</p>
                            </div>
                        )}
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
                {gameState?.players && (
                    <div className="players-status">
                        <h3>Trạng thái người chơi:</h3>
                        <div className="players-grid">
                            {gameState.players.map(player => (
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
                )}
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

                    <button onClick={() => navigate('/rooms')} className="btn-secondary">
                        Rời phòng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameRoom;

