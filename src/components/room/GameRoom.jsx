import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCrown } from 'react-icons/fa6';
import { FaMedal } from 'react-icons/fa';
import socketService from '../../services/socketService';
import authStore from '../../stores/authStore';
import useRoomStore from '../../stores/useRoomStoreRealtime';
import AnswerResultPopup from './AnswerResultPopup';
import NotificationPopup from './NotificationPopup';
import GameStartPopup from './GameStartPopup';
import CompletionPopup from './CompletionPopup';
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
    const [isConnected, setIsConnected] = useState(true); 
    const [gameResults, setGameResults] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [answerResult, setAnswerResult] = useState(null);

    // ✅ NEW: States cho các popup thay thế toast
    const [notification, setNotification] = useState(null);
    const [showGameStart, setShowGameStart] = useState(false);
    const [showCompletion, setShowCompletion] = useState(false);

    const timerRef = useRef(null);
    const questionStartTimeRef = useRef(null);

    // Khởi tạo với dữ liệu sự kiện game-started từ WaitingRoom
    useEffect(() => {
        if (!currentUser || !roomCode) {
            navigate('/');
            return;
        }

        // Socket nên đã kết nối từ WaitingRoom
        if (socketService.isConnected()) {
            setIsConnected(true);
            setupGameSubscriptions();

            // Sửa: Yêu cầu trạng thái game hiện tại để lấy câu hỏi đang diễn ra nếu game đã bắt đầu
            if (currentRoom?.id) {
                socketService.emit('get-game-state', { roomId: currentRoom.id }, (response) => {
                    if (response && response.currentQuestion) {
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
            initializeWebSocket();
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            // KHÔNG ngắt kết nối khỏi phòng - để người dùng ở lại phòng
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
            setNotification({ type: 'error', message: 'Không thể kết nối đến game. Vui lòng thử lại!' });
            // Không chuyển hướng ngay lập tức, cho người dùng có cơ hội thử lại
            setIsLoading(false);
        }
    };

    const setupGameSubscriptions = () => {

        // Sửa: Xóa các listener tồn tại trước khi thêm mới để tránh trùng lặp
        socketService.off('game-started');
        socketService.off('next-question');
        socketService.off('answer-submitted');
        socketService.off('player-answered');
        socketService.off('game-ended');
        socketService.off('game-finished');

        // Lắng nghe sự kiện game-started (chứa câu hỏi đầu tiên)
        socketService.on('game-started', (data) => {
            handleGameMessage({ type: 'GAME_STARTED', data });
        });

        // Lắng nghe sự kiện next-question
        socketService.on('next-question', (data) => {
            handleGameMessage({ type: 'NEXT_QUESTION', data });
        });

        // Lắng nghe sự kiện answer-submitted (kết quả cá nhân) - MỘT LẦN mỗi câu trả lời
        const answerSubmittedHandler = (data) => {
            handlePersonalMessage({ type: 'ANSWER_RESULT', data });
        };
        socketService.on('answer-submitted', answerSubmittedHandler);

        // Lắng nghe sự kiện player-answered (người chơi khác)
        socketService.on('player-answered', (data) => {
            // Chỉ cập nhật trạng thái của người chơi khác, không cập nhật điểm
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

        // Lắng nghe sự kiện game-ended/game-finished
        socketService.on('game-ended', (data) => {
            handleGameMessage({ type: 'GAME_ENDED', data });
        });

        socketService.on('game-finished', (data) => {
            handleGameMessage({ type: 'GAME_ENDED', data });
        });

        setIsLoading(false);
    };

    const handleGameMessage = (message) => {

        switch (message.type) {
            case 'GAME_STARTED':
                // Trích xuất câu hỏi đầu tiên từ sự kiện game-started
                if (message.data.question) {
                    // Sửa: Khởi tạo gameState với players từ currentRoom
                    if (currentRoom?.players) {
                        setGameState({
                            players: currentRoom.players.map(p => ({
                                ...p,
                                score: 0, 
                                hasAnswered: false
                            }))
                        });
                    }

                    setCurrentQuestion(message.data.question);
                    setSelectedAnswer(null);
                    setHasAnswered(false);
                    setTimeRemaining(message.data.question.timeLimit || 30);
                    questionStartTimeRef.current = Date.now();
                    startQuestionTimer(message.data.question.timeLimit || 30);
                    setShowGameStart(true); // Hiển thị popup bắt đầu game
                }
                break;

            case 'NEXT_QUESTION':

                // Cần lấy từ message.data.question, KHÔNG phải message.data trực tiếp
                const nextQuestionData = message.data.question || message.data;

                setCurrentQuestion(nextQuestionData);
                setSelectedAnswer(null);
                setHasAnswered(false);
                setTimeRemaining(nextQuestionData.timeLimit || 30);
                questionStartTimeRef.current = Date.now();
                startQuestionTimer(nextQuestionData.timeLimit || 30);
                setNotification({ type: 'info', message: `Câu hỏi ${nextQuestionData.questionNumber}/${nextQuestionData.totalQuestions}` });
                break;

            case 'GAME_ENDED':
                setGameResults(message.data);
                setCurrentQuestion(null);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
                setShowCompletion(true); // Hiển thị popup hoàn thành
                break;

            default:
                break;
        }
    };

    const handlePersonalMessage = (message) => {
        if (message.type === 'ANSWER_RESULT') {
            const result = message.data.result || message.data;

            // Cập nhật điểm cục bộ ngay lập tức
            const earnedScore = result.score || result.pointsEarned || 0;

            // Cập nhật gameState với điểm mới
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

            setAnswerResult({
                isCorrect: result.isCorrect,
                score: earnedScore,
                streak: result.streak || 0,
                streakMultiplier: result.streakMultiplier || 1.0
            });

            // Kiểm tra xem có câu hỏi tiếp theo không
            if (message.data.hasNextQuestion && message.data.nextQuestion) {
                // Có câu tiếp theo - tự động chuyển sau khi popup hiển thị

                const nextQ = message.data.nextQuestion;

                // Delay 2.5 giây để người chơi xem kết quả trước khi chuyển câu
                setTimeout(() => {
                    setAnswerResult(null); // Đóng popup
                    setCurrentQuestion(nextQ);
                    setSelectedAnswer(null);
                    setHasAnswered(false);
                    setTimeRemaining(nextQ.timeLimit || 30);
                    questionStartTimeRef.current = Date.now();
                    startQuestionTimer(nextQ.timeLimit || 30);
                }, 2500);

            } else if (message.data.completed) {
                // Player này đã hoàn thành tất cả câu hỏi
                setTimeout(() => {
                    setAnswerResult(null);
                    setCurrentQuestion(null);
                    setHasAnswered(false);

                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                    }

                    setShowCompletion(true); // Hiển thị popup hoàn thành
                }, 2500);
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
                        // Tự động gửi câu trả lời trống khi hết thời gian
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

        const roomId = currentRoom?.id;
        const questionId = currentQuestion.questionId || currentQuestion.id;
        const questionOptions = currentQuestion.answers || currentQuestion.options || [];
        const selectedAnswerObj = questionOptions.find(opt =>
            (opt.text || opt.answerText || opt) === selectedAnswer
        );
        const selectedOptionIndex = questionOptions.findIndex(opt =>
            (opt.text || opt.answerText || opt) === selectedAnswer
        );
        const answerId = selectedAnswerObj?.id;

        const timeTaken = questionStartTimeRef.current ? Date.now() - questionStartTimeRef.current : 0;

        // Gửi đến backend với tất cả các trường bắt buộc
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
        const rankings = gameResults.result?.ranking || gameResults.ranking || [];

        return (
            <div className="game-room results">
                <div className="results-container">
                    <h2 className="results-title">Kết Quả Game</h2>

                    <div className="final-leaderboard">
                        {rankings.length > 0 ? (
                            rankings.map((player, index) => (
                                <div key={player.userId} className={`result-item rank-${index + 1}`}>
                                    <div className="rank-badge" style={{ backgroundColor: getPlayerRankColor(index + 1) }}>
                                        <span className="rank-number">#{index + 1}</span>
                                        {index === 0 && <FaCrown className="rank-icon" />}
                                    </div>
                                    <div className="player-info">
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
                                            {index === 0 && <FaMedal style={{ color: 'gold', fontSize: '24px' }} />}
                                            {index === 1 && <FaMedal style={{ color: 'silver', fontSize: '24px' }} />}
                                            {index === 2 && <FaMedal style={{ color: '#cd7f32', fontSize: '24px' }} />}
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
                            Về Dashboard
                        </button>
                        <button onClick={() => navigate('/rooms')} className="btn-secondary">
                            Tìm phòng khác
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show question screen
    if (currentQuestion) {
        // FIX: Backend returns 'answers' with field 'text', not 'answerText'
        const questionOptions = currentQuestion.answers || currentQuestion.options || [];

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
                                // FIX: Backend returns {id, text} not {id, answerText}
                                const optionText = option.text || option.answerText || option;
                                const optionId = option.id || index;

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

                {/* Popup kết quả câu trả lời */}
                {answerResult && (
                    <AnswerResultPopup
                        result={answerResult}
                        onClose={() => setAnswerResult(null)}
                    />
                )}

                {/* Popup thông báo bắt đầu game */}
                {showGameStart && (
                    <GameStartPopup
                        onClose={() => setShowGameStart(false)}
                    />
                )}

                {/* Popup hoàn thành game */}
                {showCompletion && (
                    <CompletionPopup
                        onClose={() => setShowCompletion(false)}
                    />
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
                            Bắt đầu Game
                        </button>
                    )}

                    <button onClick={() => navigate('/rooms')} className="btn-secondary">
                        Rời phòng
                    </button>
                </div>

                {/* Popup thông báo chung */}
                {notification && (
                    <NotificationPopup
                        type={notification.type}
                        message={notification.message}
                        onClose={() => setNotification(null)}
                        autoClose={notification.autoClose !== false}
                    />
                )}
            </div>
        </div>
    );
};

export default GameRoom;

