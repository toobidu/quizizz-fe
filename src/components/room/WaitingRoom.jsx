import React, { useEffect, useState } from 'react';
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
import useRoomStore from '../../stores/useRoomStoreRealtime'; // ✅ FIXED: Use realtime store
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

    // Get current user from auth store
    const currentUser = authStore((state) => state.user);

    // ✅ FIXED: Fetch room data by code when component mounts
    useEffect(() => {
        const fetchRoomData = async () => {
            if (!roomCode) {
                setError('Mã phòng không hợp lệ');
                return;
            }

            // Check if room data was passed via navigate state (from CreateRoomModal)
            if (location.state?.room && location.state?.fromCreate) {
                const roomData = location.state.room;
                setCurrentRoom(roomData);

                // Connect to Socket.IO for real-time updates
                if (roomData.id) {
                    await connectToRoom(roomData.id);
                }

                setLoading(false);
                return;
            }

            // Check if room is already loaded in store
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
                // First try to get room info without joining
                let room = null;
                try {
                    const roomInfoResponse = await roomApi.getRoomByCode(roomCode);
                    if (roomInfoResponse.success) {
                        room = roomInfoResponse.data;
                    }
                } catch (infoError) {
                    console.log('Room info fetch failed, trying join:', infoError.message);
                }

                // If room info fetch failed, try to join
                if (!room) {
                    const joinResponse = await roomApi.joinRoomByCode(roomCode);
                    if (joinResponse.success && joinResponse.data) {
                        room = joinResponse.data;
                    } else {
                        setError(joinResponse.error || 'Không tìm thấy phòng');
                        return;
                    }
                }

                // Set room data
                setCurrentRoom(room);

                // ✅ FIXED: Connect to Socket.IO for real-time updates
                if (room.id) {
                    await connectToRoom(room.id);
                }
            } catch (err) {
                console.error('Error in fetchRoomData:', err);
                setError('Có lỗi xảy ra khi tải phòng');
            } finally {
                setFetchingRoom(false);
                setLoading(false);
            }
        };

        fetchRoomData();
    }, [roomCode]);

    // ✅ FIXED: Listen for game started events
    useEffect(() => {
        const handleGameStarted = (event) => {
            console.log('🎮 Game started event received:', event.detail);
            const { roomId } = event.detail;

            // Navigate to game if this is our current room
            if (currentRoom && roomId === currentRoom.id) {
                navigate(`/game/${currentRoom.roomCode || currentRoom.code}`);
            }
        };

        // Listen for custom game started event
        window.addEventListener('gameStarted', handleGameStarted);

        return () => {
            window.removeEventListener('gameStarted', handleGameStarted);
        };
    }, [currentRoom, navigate]);

    // ✅ NEW: Listen for navigation to room list events
    useEffect(() => {
        const handleNavigateToRoomList = (event) => {
            console.log('🔄 Navigate to room list event received:', event.detail);
            const { reason, message } = event.detail;

            // Navigate to rooms page
            navigate('/rooms');

            // Optional: Show a toast message if needed
            if (message) {
                console.log('📝 Navigation message:', message);
            }
        };

        // Listen for custom navigation event
        window.addEventListener('navigateToRoomList', handleNavigateToRoomList);

        return () => {
            window.removeEventListener('navigateToRoomList', handleNavigateToRoomList);
        };
    }, [navigate]);

    // ✅ FIXED: Cleanup on unmount
    useEffect(() => {
        return () => {
            if (currentRoom?.id) {
                console.log('🧹 Cleaning up room connection on unmount');
                disconnectFromRoom(currentRoom.id);
            }
        };
    }, [currentRoom?.id]);

    const handleCopyCode = async () => {
        if (currentRoom?.roomCode || currentRoom?.code) {
            try {
                await navigator.clipboard.writeText(currentRoom.roomCode || currentRoom.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                // Copy failed - browser might not support clipboard API
            }
        }
    };

    const handleLeaveRoom = async () => {
        const result = await leaveRoom();
        if (result.success) {
            setTimeout(() => {
                navigate('/rooms');
            }, 100);
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