import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiBookOpen,
    FiCheck,
    FiClock,
    FiCopy,
    FiHelpCircle,
    FiLock,
    FiSettings,
    FiUnlock,
    FiUsers,
    FiX,
    FiZap,
    FiChevronDown,
    FiStar,
    FiAlertCircle,
    FiLoader
} from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import useRoomStore from '../../stores/useRoomStore';
import useTopics from '../../hooks/useTopics';
import '../../styles/components/room/CreateRoomModal.css';

function CreateRoomModal({ onClose, onSuccess, onNavigateToRoom }) {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { createRoom, createRoomViaWebSocket, joinRoom, isLoading, error: storeError } = useRoomStore();
    const { topics, loading: loadingTopics, error: topicsError, getTopicById } = useTopics();

    const [roomData, setRoomData] = useState({
        name: '',
        isPrivate: false,
        maxPlayers: 2,
        timeLimit: 60,
        questionCount: 10,
        topicId: '',
        gameMode: 'ONE_VS_ONE'
    });

    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    // Room mode options
    const roomModes = [
        {
            value: 'ONE_VS_ONE',
            label: '1vs1',
            description: 'Đấu một đối một',
            icon: FiUsers,
            maxPlayers: 2,
            minPlayers: 2
        },
        {
            value: 'BATTLE_ROYAL',
            label: 'Battle Royal',
            description: 'Nhiều người chơi cùng lúc',
            icon: FiZap,
            maxPlayers: 999, // Không giới hạn max
            minPlayers: 3
        }
    ];

    useEffect(() => {
        if (onClose) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'gameMode') {
            const selectedMode = roomModes.find(mode => mode.value === value);
            if (selectedMode) {
                setRoomData({
                    ...roomData,
                    gameMode: value,
                    maxPlayers: selectedMode.minPlayers // Reset về min khi chuyển mode
                });
            }
        } else if (name === 'maxPlayers') {
            const numValue = parseInt(value) || '';
            setRoomData({
                ...roomData,
                maxPlayers: numValue === '' ? '' : numValue
            });
        } else if (name === 'timeLimit') {
            const numValue = parseInt(value) || 10;
            setRoomData({
                ...roomData,
                timeLimit: Math.max(10, Math.min(300, numValue))
            });
        } else if (name === 'questionCount') {
            const numValue = parseInt(value) || 5;
            setRoomData({
                ...roomData,
                questionCount: Math.max(5, Math.min(50, numValue))
            });
        } else if (name === 'topicId') {
            const numValue = parseInt(value) || '';
            setRoomData({
                ...roomData,
                topicId: numValue
            });
        } else {
            setRoomData({
                ...roomData,
                [name]: type === 'checkbox' ? checked : value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLoading) return;

        if (!roomData.name.trim()) {
            setError('Vui lòng nhập tên phòng');
            return;
        }

        if (!roomData.topicId) {
            setError('Vui lòng chọn chủ đề câu hỏi');
            return;
        }

        const topicIdNum = parseInt(roomData.topicId);
        if (isNaN(topicIdNum)) {
            setError('Chủ đề không hợp lệ');
            return;
        }

        if (!roomData.questionCount || roomData.questionCount < 1) {
            setError('Số câu hỏi phải lớn hơn 0');
            return;
        }

        // Validate max players based on game mode
        const selectedMode = roomModes.find(mode => mode.value === roomData.gameMode);
        if (selectedMode) {
            const maxPlayersNum = parseInt(roomData.maxPlayers);
            if (isNaN(maxPlayersNum) || maxPlayersNum < selectedMode.minPlayers) {
                setError(`Số người chơi cho ${selectedMode.label} phải ít nhất ${selectedMode.minPlayers} người`);
                return;
            }
            // Chỉ kiểm tra max cho các mode có giới hạn max
            if (selectedMode.value !== 'BATTLE_ROYAL' && maxPlayersNum > selectedMode.maxPlayers) {
                setError(`Số người chơi cho ${selectedMode.label} không được vượt quá ${selectedMode.maxPlayers} người`);
                return;
            }
        }

        setError('');

        try {
            const topicIdNum = parseInt(roomData.topicId);
            console.log('Room data to send:', {
                roomName: roomData.name,
                isPrivate: roomData.isPrivate,
                maxPlayers: roomData.maxPlayers,
                countdownTime: roomData.timeLimit,
                topicId: topicIdNum,
                roomMode: roomData.gameMode,
                questionCount: roomData.questionCount
            });

            // Use REST API for room creation since WebSocket is not working
            const result = await createRoom({
                roomName: roomData.name,
                isPrivate: roomData.isPrivate,
                maxPlayers: parseInt(roomData.maxPlayers),
                countdownTime: roomData.timeLimit,
                topicId: topicIdNum,
                roomMode: roomData.gameMode, // Đã match với backend enum
                questionCount: roomData.questionCount
            });

            if (result.success) {
                // Lấy roomCode từ nhiều field có thể có
                const roomCode = result.data?.roomCode ||
                    result.data?.Code ||
                    result.data?.code ||
                    result.data?.room_code ||
                    (result.data?.room?.roomCode) ||
                    (result.data?.room?.Code) ||
                    (result.data?.room?.code);
                if (!roomCode) {
                    setError('Tạo phòng thành công nhưng không nhận được mã phòng. Vui lòng thử lại.');
                    return;
                }

                // Chuẩn bị dữ liệu phòng để truyền qua navigate state
                const roomDataForNavigation = {
                    id: result.data.id || result.data.roomId,
                    roomCode: roomCode,
                    code: roomCode,
                    roomName: result.data.roomName || result.data.name,
                    isPrivate: result.data.isPrivate,
                    maxPlayers: result.data.maxPlayers,
                    currentPlayers: result.data.currentPlayers || 1, // Creator is first player
                    hostId: result.data.hostId || result.data.ownerId,
                    status: result.data.status || 'WAITING',
                    topicId: result.data.topicId,
                    topicName: result.data.topicName || result.data.topic?.name,
                    createdAt: result.data.createdAt,
                    isHost: true, // Creator is always host
                    autoJoined: true, // Backend auto-joins creator
                    ...result.data
                };

                console.log('Room created successfully, navigating with data:', roomDataForNavigation);

                // Người tạo phòng thường đã được backend tự động thêm vào phòng
                // Chuyển thẳng vào waiting room và truyền data qua state
                if (onSuccess) {
                    onSuccess({
                        message: 'Phòng đã được tạo thành công!',
                        roomCode: roomCode,
                        autoJoined: true,
                        ...roomData
                    });
                }

                handleClose(); // Close modal

                // Navigate with room data in state to avoid API call
                navigate(`/waiting-room/${roomCode}`, {
                    state: {
                        room: roomDataForNavigation,
                        fromCreate: true // Flag to indicate this is from room creation
                    }
                });
                return;
            } else {
                console.error('Room creation failed:', result);
                setError(result.error || 'Có lỗi xảy ra khi tạo phòng');
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi tạo phòng. Vui lòng thử lại.');
        }
    };

    const handleClose = () => {
        if (onClose) onClose();
        if (roomCode) {
            setRoomCode('');
            setRoomData({
                name: '',
                isPrivate: false,
                maxPlayers: 2,
                timeLimit: 60,
                questionCount: 10,
                topicId: '',
                gameMode: 'ONE_VS_ONE'
            });
            setError('');
        }
    };

    const handleOverlayClick = (e) => {
        // Chỉ đóng modal khi click vào overlay, không phải vào nội dung modal
        if (e.target.className === 'crm-overlay') {
            handleClose();
        }
    };

    if (!onClose) return null;

    return (
        <div className={`crm-overlay ${theme}`} onClick={handleOverlayClick}>
            <div className="crm-container">
                <div className="crm-header">
                    <div className="crm-header-content">
                        <div className="crm-header-icon">
                            <FiStar />
                        </div>
                        <div className="crm-header-text">
                            <h2 className="crm-title">Tạo phòng thử thách</h2>
                            <p className="crm-subtitle">Thiết lập phòng chơi của bạn</p>
                        </div>
                    </div>
                    <button className="crm-close" onClick={handleClose}>
                        <FiX />
                    </button>
                </div>

                {(error || storeError || topicsError) && (
                    <div className="crm-error">
                        <FiAlertCircle />
                        <span>{error || storeError || topicsError}</span>
                    </div>
                )}

                {roomCode ? (
                    <div className="crm-success">
                        <div className="crm-success-icon">
                            <FiCheck />
                        </div>
                        <h2>Phòng đã được tạo thành công!</h2>
                        <p>Chia sẻ mã phòng với bạn bè để họ có thể tham gia</p>
                        <div className="crm-room-code">
                            <div className="crm-code-display">
                                <span className="crm-code-label">Mã phòng:</span>
                                <span className="crm-code-value">{roomCode}</span>
                            </div>
                            <button onClick={() => {
                                navigator.clipboard.writeText(roomCode);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                            }} className="crm-copy-btn">
                                {copied ? <FiCheck /> : <FiCopy />}
                                {copied ? 'Đã sao chép' : 'Sao chép'}
                            </button>
                        </div>
                        <div className="crm-success-actions">
                            <button
                                className="crm-button crm-secondary-btn"
                                onClick={handleClose}
                            >
                                Đóng
                            </button>
                            <button
                                className="crm-button crm-primary-btn"
                                onClick={() => {
                                    handleClose(); // Close modal first
                                    if (onNavigateToRoom) {
                                        onNavigateToRoom(roomCode);
                                    } else {
                                        navigate(`/waiting-room/${roomCode}`);
                                    }
                                }}
                            >
                                Vào phòng
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="crm-form">
                        <div className="crm-form-group">
                            <label htmlFor="name">
                                <FiStar style={{ marginRight: '8px' }} />
                                Tên phòng
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={roomData.name}
                                onChange={handleChange}
                                required
                                placeholder="Ví dụ: Phòng toán vui"
                                className="crm-input"
                            />
                        </div>

                        <div className="crm-form-group crm-toggle-group">
                            <label htmlFor="isPrivate" className="crm-toggle-label">
                                {roomData.isPrivate ? (
                                    <>
                                        <FiLock style={{ marginRight: '8px' }} />
                                        Phòng riêng tư
                                    </>
                                ) : (
                                    <>
                                        <FiUnlock style={{ marginRight: '8px' }} />
                                        Phòng công khai
                                    </>
                                )}
                            </label>
                            <label className="crm-toggle-switch">
                                <input
                                    type="checkbox"
                                    id="isPrivate"
                                    name="isPrivate"
                                    checked={roomData.isPrivate}
                                    onChange={handleChange}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="crm-settings">
                            <h3 className="crm-settings-title">
                                <FiSettings style={{ marginRight: '8px' }} />
                                Cài đặt phòng
                            </h3>

                            <div className="crm-form-group">
                                <label htmlFor="topicId">
                                    <FiBookOpen style={{ marginRight: '8px' }} />
                                    Chủ đề câu hỏi
                                </label>
                                <div className="crm-select-wrapper">
                                    <select
                                        id="topicId"
                                        name="topicId"
                                        value={roomData.topicId}
                                        onChange={handleChange}
                                        className="crm-input crm-select"
                                        required
                                        disabled={loadingTopics}
                                    >
                                        <option value="" disabled>
                                            {loadingTopics ? 'Đang tải chủ đề...' : 'Chọn chủ đề'}
                                        </option>
                                        {topics.map((topic) => (
                                            <option key={`topic-${topic.id}`} value={topic.id}>
                                                {topic.name}
                                            </option>
                                        ))}
                                    </select>
                                    {loadingTopics ? (
                                        <FiLoader className="crm-select-icon crm-loading" />
                                    ) : (
                                        <FiChevronDown className="crm-select-icon" />
                                    )}
                                </div>
                                {topics.length > 0 && roomData.topicId && (
                                    <div className="crm-topic-description">
                                        {getTopicById(roomData.topicId)?.description}
                                    </div>
                                )}
                            </div>

                            <div className="crm-form-group">
                                <label htmlFor="gameMode">
                                    <FiZap style={{ marginRight: '8px' }} />
                                    Chế độ chơi
                                </label>
                                <div className="crm-select-wrapper">
                                    <select
                                        id="gameMode"
                                        name="gameMode"
                                        value={roomData.gameMode}
                                        onChange={handleChange}
                                        className="crm-input crm-select"
                                    >
                                        {roomModes.map((mode) => (
                                            <option key={mode.value} value={mode.value}>
                                                {mode.label}
                                            </option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="crm-select-icon" />
                                </div>
                                {roomData.gameMode && (
                                    <div className="crm-input-hint">
                                        {roomModes.find(m => m.value === roomData.gameMode)?.description}
                                    </div>
                                )}
                            </div>

                            <div className="crm-form-group">
                                <label htmlFor="maxPlayers">
                                    <FiUsers style={{ marginRight: '8px' }} />
                                    Số người chơi tối đa
                                </label>
                                <input
                                    type="number"
                                    id="maxPlayers"
                                    name="maxPlayers"
                                    min={roomModes.find(m => m.value === roomData.gameMode)?.minPlayers || 2}
                                    max={roomData.gameMode === 'BATTLE_ROYAL' ? undefined : (roomModes.find(m => m.value === roomData.gameMode)?.maxPlayers || 20)}
                                    value={roomData.maxPlayers || ''}
                                    onChange={handleChange}
                                    className="crm-input"
                                    disabled={roomData.gameMode === 'ONE_VS_ONE'}
                                />
                                <div className="crm-input-hint">
                                    {roomData.gameMode === 'ONE_VS_ONE'
                                        ? 'Chế độ 1vs1 luôn có 2 người chơi'
                                        : roomData.gameMode === 'BATTLE_ROYAL'
                                            ? 'Tối thiểu 3 người chơi, không giới hạn tối đa'
                                            : `Từ ${roomModes.find(m => m.value === roomData.gameMode)?.minPlayers} đến ${roomModes.find(m => m.value === roomData.gameMode)?.maxPlayers} người chơi`
                                    }
                                </div>
                            </div>

                            <div className="crm-form-group">
                                <label htmlFor="timeLimit">
                                    <FiClock style={{ marginRight: '8px' }} />
                                    Thời gian trả lời (giây)
                                </label>
                                <input
                                    type="number"
                                    id="timeLimit"
                                    name="timeLimit"
                                    min="10"
                                    max="300"
                                    value={roomData.timeLimit || ''}
                                    onChange={handleChange}
                                    className="crm-input"
                                />
                            </div>

                            <div className="crm-form-group">
                                <label htmlFor="questionCount">
                                    <FiHelpCircle style={{ marginRight: '8px' }} />
                                    Số câu hỏi
                                </label>
                                <input
                                    type="number"
                                    id="questionCount"
                                    name="questionCount"
                                    min="5"
                                    max="50"
                                    value={roomData.questionCount || ''}
                                    onChange={handleChange}
                                    className="crm-input"
                                />
                            </div>
                        </div>

                        <div className="crm-form-actions">
                            <button
                                type="button"
                                className="crm-button crm-secondary-btn"
                                onClick={handleClose}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="crm-button crm-primary-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="crm-loading-spinner"></div>
                                        Đang tạo phòng...
                                    </>
                                ) : (
                                    <>
                                        <FiStar style={{ marginRight: '8px' }} />
                                        Tạo phòng
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default CreateRoomModal;
