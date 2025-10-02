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
import webSocketManager from '../../utils/webSocketManager';
import websocketService from '../../services/websocketService';
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
                console.error('WaitingRoom - No room code provided');
                setError('Mã phòng không hợp lệ');
                return;
            }

            console.log('WaitingRoom - Starting room fetch for code:', roomCode);

            // Check if room data was passed via navigate state (from CreateRoomModal)
            if (location.state?.room && location.state?.fromCreate) {
                console.log('WaitingRoom - Using room data from navigation state:', location.state.room);
                const roomData = location.state.room;
                setCurrentRoom(roomData);

                // Load players for this room
                if (roomData.id) {
                    try {
                        await fetchRoomPlayers(roomData.id);
                        console.log('WaitingRoom - Players loaded successfully');
                    } catch (playersError) {
                        console.error('WaitingRoom - Failed to load players:', playersError);
                    }
                }

                setLoading(false);
                return; // Skip API call since we have the data
            }

            // Check if room is already loaded in store
            if (currentRoom && currentRoom.roomCode === roomCode) {
                console.log('WaitingRoom - Room already loaded in store:', currentRoom);
                if (currentRoom.id) {
                    await fetchRoomPlayers(currentRoom.id);
                }
                return;
            }

            setFetchingRoom(true);
            setLoading(true);
            setError(null);

            try {
                console.log('WaitingRoom - Calling roomApi.getRoomByCode with:', roomCode);

                // Get room info by code from backend
                const response = await roomApi.getRoomByCode(roomCode);
                console.log('WaitingRoom - getRoomByCode response:', response);

                if (response.success && response.data) {
                    const room = response.data;
                    console.log('WaitingRoom - Setting room in store:', room);
                    setCurrentRoom(room);

                    // Check if current user is the creator/host
                    const currentUserId = currentUser?.id;
                    const isHost = room.ownerId === currentUserId;

                    console.log('WaitingRoom - User check:', {
                        currentUserId,
                        roomOwnerId: room.ownerId,
                        isHost
                    });

                    // If not host, join the room
                    if (!isHost) {
                        console.log('WaitingRoom - User is not host, attempting to join...');
                        try {
                            const joinResponse = await roomApi.joinRoomByCode(roomCode);
                            console.log('WaitingRoom - Join response:', joinResponse);

                            if (joinResponse.success) {
                                // Join successful - update room data
                                console.log('WaitingRoom - Join successful, updating room data');
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
                                    console.log('WaitingRoom - User already in room, continuing...');
                                    // This is OK - user is already in the room, no error needed
                                } else {
                                    // Real error - but don't block if we already have room data
                                    console.warn('WaitingRoom - Join error (non-critical):', errorMsg);
                                    // Don't set error or return - allow user to stay in waiting room
                                }
                            }
                        } catch (joinError) {
                            console.error('WaitingRoom - Join exception (non-critical):', joinError);
                            // Continue anyway - user might already be in room
                        }
                    } else {
                        console.log('WaitingRoom - User is host, no need to join');
                    }

                    // Load room players
                    if (room.id) {
                        console.log('WaitingRoom - Loading players for room ID:', room.id);
                        try {
                            await fetchRoomPlayers(room.id);
                            console.log('WaitingRoom - Players loaded successfully');
                        } catch (playersError) {
                            console.error('WaitingRoom - Failed to load players:', playersError);
                        }
                    } else {
                        console.warn('WaitingRoom - Room has no ID, cannot load players');
                    }
                } else {
                    console.error('WaitingRoom - Failed to get room data:', response);
                    setError(response.error || 'Không tìm thấy phòng');
                }
            } catch (err) {
                console.error('WaitingRoom - Critical error loading room:', err);
                setError('Có lỗi xảy ra khi tải phòng');
            } finally {
                setFetchingRoom(false);
                setLoading(false);
                console.log('WaitingRoom - Fetch completed');
            }
        };

        console.log('WaitingRoom - useEffect triggered with roomCode:', roomCode);
        fetchRoomData();
    }, [roomCode]);    // Additional connection when room changes
    useEffect(() => {
        if (currentRoom && currentRoom.id && !fetchingRoom) {
            console.log('🔌 Setting up real-time updates for room:', currentRoom.id);

            // Connect to WebSocket for this room
            connectToRoom(currentRoom.id);

            // Also set up a simple WebSocket subscription for real-time updates
            const setupRealTimeUpdates = async () => {
                try {
                    // Use static imports instead of dynamic
                    await webSocketManager.initialize();

                    // Subscribe to room-specific events
                    const roomTopic = `/topic/room/${currentRoom.id}`;
                    console.log('📡 Subscribing to real-time updates:', roomTopic);

                    websocketService.subscribe(roomTopic, (message) => {
                        console.log('🎯 Real-time room event:', message);

                        if (message.type === 'JOIN_ROOM') {
                            const { userId, username } = message.data;
                            console.log('👤 New player joined via WebSocket:', { userId, username });

                            // Immediately add player to local state if not exists
                            const existingPlayer = roomPlayers.find(p => p.id === userId);
                            if (!existingPlayer) {
                                const newPlayer = {
                                    id: userId,
                                    username: username,
                                    name: username,
                                    isHost: false
                                };
                                // Update local state immediately
                                useRoomStore.getState().setRoomPlayers([...roomPlayers, newPlayer]);
                            }

                            // Also refresh from server to ensure consistency
                            setTimeout(() => {
                                console.log('🔄 Refreshing player list after join...');
                                fetchRoomPlayers(currentRoom.id);
                            }, 500);

                        } else if (message.type === 'LEAVE_ROOM') {
                            const { userId } = message.data;
                            console.log('👋 Player left via WebSocket:', userId);

                            // Immediately remove player from local state
                            const updatedPlayers = roomPlayers.filter(p => p.id !== userId);
                            useRoomStore.getState().setRoomPlayers(updatedPlayers);

                            // Also refresh from server to ensure consistency
                            setTimeout(() => {
                                console.log('🔄 Refreshing player list after leave...');
                                fetchRoomPlayers(currentRoom.id);
                            }, 500);

                        } else if (message.type === 'ROOM_UPDATED') {
                            console.log('🔄 Room updated via WebSocket');
                            // Refresh room data
                            fetchRoomPlayers(currentRoom.id);
                        }
                    });

                    console.log('✅ Real-time updates enabled for room');

                } catch (error) {
                    console.warn('⚠️ Failed to setup real-time updates, using polling:', error);

                    // Fallback: Set up polling for player updates
                    const pollInterval = setInterval(() => {
                        if (currentRoom && currentRoom.id) {
                            console.log('🔄 Polling for player updates...');
                            fetchRoomPlayers(currentRoom.id);
                        }
                    }, 5000); // Poll every 5 seconds

                    // Cleanup on unmount
                    return () => {
                        clearInterval(pollInterval);
                    };
                }
            };

            setupRealTimeUpdates();

            // Initial fetch of players
            fetchRoomPlayers(currentRoom.id);
        }

        // Cleanup function - DO NOT leave room on unmount
        // This allows users to reload page without losing room membership
        return () => {
            if (currentRoom && currentRoom.id) {
                console.log('🧹 Cleaning up subscriptions (keeping room membership)');
                // Pass false to disconnect WITHOUT leaving room
                disconnectFromRoom(false);
            }
        };
    }, [currentRoom?.id, fetchingRoom]);

    const handleCopyCode = async () => {
        if (currentRoom?.roomCode || currentRoom?.code) {
            try {
                await navigator.clipboard.writeText(currentRoom.roomCode || currentRoom.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
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