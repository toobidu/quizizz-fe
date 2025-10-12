import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    FiUsers,
    FiCopy,
    FiPlay,
    FiArrowLeft,
    FiSettings,
    FiStar,
    FiLogOut,
    FiUser
} from 'react-icons/fi';
import useRoomStore from '../../stores/useRoomStoreRealtime';
import roomApi from '../../services/roomApi';
import authStore from '../../stores/authStore';
import socketService from '../../services/socketService';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/components/room/WaitingRoom.css';

const WaitingRoom = () => {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();
    const {
        currentRoom,
        roomPlayers,
        isLoading,
        error,
        connectToRoom,
        disconnectFromRoom,
        leaveRoom,
        startGame,
        fetchRoomPlayers,
        setCurrentRoom,
        setLoading,
        setError,
        setRoomPlayers
    } = useRoomStore();

    const [copied, setCopied] = useState(false);
    const [fetchingRoom, setFetchingRoom] = useState(false);
    const isNavigatingToGameRef = useRef(false);
    const currentUser = authStore((state) => state.user);

    useEffect(() => {
        const fetchRoomData = async () => {
            if (!roomCode) {
                setError('Mã phòng không hợp lệ');
                return;
            }

            if (location.state?.room && location.state?.fromCreate) {
                const roomData = location.state.room;
                setCurrentRoom(roomData);

                if (roomData.id) {
                    await connectToRoom(roomData.id);
                }

                setLoading(false);
                return;
            }

            if (currentRoom && currentRoom.roomCode === roomCode) {
                if (currentRoom.id) {
                    await connectToRoom(currentRoom.id);
                }
                return;
            }

            setFetchingRoom(true);
            setLoading(true);
            setError(null);

            try {
                let room = null;
                try {
                    const roomInfoResponse = await roomApi.getRoomByCode(roomCode);
                    if (roomInfoResponse.success) {
                        room = roomInfoResponse.data;
                    }
                } catch (infoError) {
                }

                if (!room) {
                    const joinResponse = await roomApi.joinRoomByCode(roomCode);
                    if (joinResponse.success && joinResponse.data) {
                        room = joinResponse.data;
                    } else {
                        setError(joinResponse.error || 'Không tìm thấy phòng');
                        return;
                    }
                }

                setCurrentRoom(room);

                if (room.id) {
                    await connectToRoom(room.id);
                }
            } catch (err) {
                setError('Có lỗi xảy ra khi tải phòng');
            } finally {
                setFetchingRoom(false);
                setLoading(false);
            }
        };

        fetchRoomData();
    }, [roomCode]);

    useEffect(() => {
        const handleGameStarted = (event) => {
            const { roomId } = event.detail;

            if (currentRoom && roomId === currentRoom.id) {
                isNavigatingToGameRef.current = true;
                navigate(`/game/${currentRoom.roomCode || currentRoom.code}`);
            }
        };

        window.addEventListener('gameStarted', handleGameStarted);

        return () => {
            window.removeEventListener('gameStarted', handleGameStarted);
        };
    }, [currentRoom, navigate]);

    useEffect(() => {
        return () => {
            if (currentRoom?.id) {
                if (isNavigatingToGameRef.current) {
                    socketService.unsubscribeFromRoom(currentRoom.id);
                } else {
                    disconnectFromRoom(currentRoom.id);
                }
            }
        };
    }, [currentRoom?.id, disconnectFromRoom]);

    const handleCopyCode = async () => {
        if (currentRoom?.roomCode || currentRoom?.code) {
            try {
                await navigator.clipboard.writeText(currentRoom.roomCode || currentRoom.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
            }
        }
    };

    const handleLeaveRoom = async () => {
        try {
            leaveRoom().catch(() => { });

            navigate('/rooms', { replace: true });
        } catch (error) {
            navigate('/rooms', { replace: true });
        }
    };

    const handleStartGame = async () => {
        const result = await startGame();
        if (result.success) {
            // Navigate to game room
            navigate(`/game/${roomCode}`);
        }
    };

    // Loading state
    if (isLoading || fetchingRoom) {
        return (
            <div className={`waiting-room ${theme}`}>
                <div className="waiting-room-container">
                    <div className="loading-section">
                        <div className="loading-spinner"></div>
                        <p>Đang tải thông tin phòng...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={`waiting-room ${theme}`}>
                <div className="waiting-room-container">
                    <div className="error-section">
                        <h3>Có lỗi xảy ra</h3>
                        <p>{error}</p>
                        <div className="error-actions">
                            <button
                                className="retry-button"
                                onClick={() => {
                                    setError(null);
                                    setCurrentRoom(null);
                                    window.location.reload();
                                }}
                            >
                                Thử lại
                            </button>
                            <button
                                className="back-button"
                                onClick={() => navigate('/dashboard')}
                            >
                                Quay lại Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // No room state
    if (!currentRoom) {
        return (
            <div className={`waiting-room ${theme}`}>
                <div className="waiting-room-container">
                    <div className="not-found-section">
                        <h3>Không tìm thấy phòng</h3>
                        <p>Phòng có mã "{roomCode}" không tồn tại hoặc đã bị xóa.</p>
                        <button
                            className="back-button"
                            onClick={() => navigate('/dashboard')}
                        >
                            Quay lại Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isHost = currentRoom && currentUser &&
        (currentRoom.ownerId === currentUser.id || currentRoom.hostId === currentUser.id);

    return (
        <div className={`waiting-room ${theme}`}>
            <div className="waiting-room-container">
                {/* Header */}
                <div className="waiting-room-header">
                    <h1>{currentRoom.roomName || currentRoom.name}</h1>
                    <button
                        className="leave-button"
                        onClick={handleLeaveRoom}
                    >
                        <FiLogOut />
                        Rời phòng
                    </button>
                </div>

                {/* Room Info */}
                <div className="room-info-section">
                    <div className="room-code-display">
                        <h3>Mã phòng</h3>
                        <div className="code-container">
                            <span className="room-code">
                                {currentRoom.roomCode || currentRoom.code}
                            </span>
                            <button
                                className="copy-button"
                                onClick={handleCopyCode}
                            >
                                <FiCopy />
                                {copied ? 'Đã sao chép' : 'Sao chép'}
                            </button>
                        </div>
                    </div>

                    <div className="room-settings">
                        <h3>
                            <FiSettings />
                            Cài đặt phòng
                        </h3>
                        <div className="settings-grid">
                            <div className="setting-item">
                                <span>Chế độ chơi:</span>
                                <span>{currentRoom.roomMode || currentRoom.Settings?.gameMode}</span>
                            </div>
                            <div className="setting-item">
                                <span>Chủ đề:</span>
                                <span>{currentRoom.topicName || currentRoom.TopicName}</span>
                            </div>
                            <div className="setting-item">
                                <span>Số người tối đa:</span>
                                <span>{currentRoom.maxPlayers || currentRoom.MaxPlayers}</span>
                            </div>
                            <div className="setting-item">
                                <span>Số câu hỏi:</span>
                                <span>{currentRoom.questionCount || currentRoom.Settings?.questionCount}</span>
                            </div>
                            <div className="setting-item">
                                <span>Thời gian:</span>
                                <span>{currentRoom.countdownTime || currentRoom.Settings?.timeLimit}s</span>
                            </div>
                            <div className="setting-item">
                                <span>Trạng thái:</span>
                                <span className={`status ${(currentRoom.status || currentRoom.Status)?.toLowerCase()}`}>
                                    {currentRoom.status || currentRoom.Status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ✅ FIXED: Players Section with real-time updates */}
                <div className="players-section">
                    <h3>
                        <FiUsers />
                        Người chơi ({roomPlayers.length}/{currentRoom.maxPlayers || currentRoom.MaxPlayers})
                    </h3>
                    <div className="players-grid">
                        {roomPlayers.map((player, index) => (
                            <div key={player.id || player.userId || index} className="player-card">
                                <div className="player-avatar">
                                    <FiUser />
                                </div>
                                <div className="player-info">
                                    <span className="player-name">
                                        {player.username || player.name || `Player ${index + 1}`}
                                    </span>
                                    {player.isHost && (
                                        <span className="host-badge">
                                            <FiStar />
                                            Host
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Host Controls */}
                {isHost && (
                    <div className="host-controls">
                        <button
                            className="start-game-button"
                            onClick={handleStartGame}
                            disabled={roomPlayers.length < 2}
                        >
                            <FiPlay />
                            Bắt đầu game
                        </button>
                    </div>
                )}

                {/* Waiting Message for Non-Host */}
                {!isHost && (
                    <div className="waiting-message">
                        <p>Đang chờ host bắt đầu game...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WaitingRoom;

