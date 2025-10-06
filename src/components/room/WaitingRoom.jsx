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
import useRoomStore from '../../stores/useRoomStore';
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
        setError
    } = useRoomStore();

    const [copied, setCopied] = useState(false);
    const [fetchingRoom, setFetchingRoom] = useState(false);

    // Get current user from auth store
    const currentUser = authStore((state) => state.user);

    // Fetch room data by code when component mounts
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

                // Load players for this room
                if (roomData.id) {
                    try {
                        await fetchRoomPlayers(roomData.id);
                    } catch (playersError) {
                        // Error loading players - will retry with websocket
                    }
                }

                setLoading(false);
                return; // Skip API call since we have the data
            }

            // Check if room is already loaded in store
            if (currentRoom && currentRoom.roomCode === roomCode) {
                if (currentRoom.id) {
                    await fetchRoomPlayers(currentRoom.id);
                }
                return;
            }

            setFetchingRoom(true);
            setLoading(true);
            setError(null);

            try {
                // Get room info by code from backend
                const response = await roomApi.getRoomByCode(roomCode);
                if (response.success && response.data) {
                    const room = response.data;
                    setCurrentRoom(room);

                    // Check if current user is the creator/host
                    const currentUserId = currentUser?.id;
                    const isHost = room.ownerId === currentUserId;

                    // If not host, join the room
                    if (!isHost) {
                        try {
                            const joinResponse = await roomApi.joinRoomByCode(roomCode);
                            if (joinResponse.success) {
                                // Join successful - update room data
                                if (joinResponse.data) {
                                    setCurrentRoom(joinResponse.data);
                                }
                            } else {
                                // Check if error is "already joined" - treat as success
                                const errorMsg = joinResponse.error || '';
                                const isAlreadyJoined =
                                    errorMsg.includes('already joined') ||
                                    errorMsg.includes('đã tham gia') ||
                                    errorMsg.includes('already in') ||
                                    errorMsg.includes('ROOM_ALREADY_JOINED');

                                if (isAlreadyJoined) {
                                    // This is OK - user is already in the room, no error needed
                                } else {
                                    // Real error - but don't block if we already have room data
                                    // Don't set error or return - allow user to stay in waiting room
                                }
                            }
                        } catch (joinError) {
                            // Continue anyway - user might already be in room
                        }
                    }

                    // Load room players
                    if (room.id) {
                        try {
                            await fetchRoomPlayers(room.id);
                        } catch (playersError) {
                            // Error loading players - will retry with websocket
                        }
                    }
                } else {
                    setError(response.error || 'Không tìm thấy phòng');
                }
            } catch (err) {
                setError('Có lỗi xảy ra khi tải phòng');
            } finally {
                setFetchingRoom(false);
                setLoading(false);
            }
        };

        fetchRoomData();
    }, [roomCode]);    // Setup socket listeners for real-time updates
    useEffect(() => {
        if (currentRoom && currentRoom.id && !fetchingRoom) {
            // Connect to WebSocket for this room
            connectToRoom(currentRoom.id);

            // Setup real-time listeners
            socketService.on('player-joined', (data) => {
                if (data.roomId === currentRoom.id) {
                    console.log('Player joined:', data);
                    // Refresh players list
                    fetchRoomPlayers(currentRoom.id);
                }
            });

            socketService.on('player-left', (data) => {
                if (data.roomId === currentRoom.id) {
                    console.log('Player left:', data);
                    // Refresh players list
                    fetchRoomPlayers(currentRoom.id);
                }
            });

            socketService.on('room-players', (data) => {
                if (data.roomId === currentRoom.id) {
                    console.log('Players updated:', data.players);
                    // Update players directly from socket
                    setRoomPlayers(data.players);
                }
            });

            // Initial fetch of players
            fetchRoomPlayers(currentRoom.id);
        }

        // Cleanup function
        return () => {
            if (currentRoom && currentRoom.id) {
                socketService.off('player-joined');
                socketService.off('player-left');
                socketService.off('room-players');
                disconnectFromRoom(false);
            }
        };
    }, [currentRoom?.id, fetchingRoom]);

    // Listen for game started events
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
            navigate('/dashboard');
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
                                    // Re-trigger useEffect by clearing and setting room code
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

                {/* Players Section */}
                <div className="players-section">
                    <h3>
                        <FiUsers />
                        Người chơi ({roomPlayers.length}/{currentRoom.maxPlayers || currentRoom.MaxPlayers})
                    </h3>
                    <div className="players-grid">
                        {roomPlayers.map((player, index) => (
                            <div key={player.id || index} className="player-card">
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