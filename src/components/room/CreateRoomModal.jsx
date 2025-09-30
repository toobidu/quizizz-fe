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
    FiAlertCircle
} from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/components/room/CreateRoomModal.css';

function CreateRoomModal({ onClose, onSuccess, onNavigateToRoom }) {
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [roomData, setRoomData] = useState({
        name: '',
        isPrivate: false,
        maxPlayers: 2,
        timeLimit: 60,
        questionCount: 10,
        topic: '',
        gameMode: '1vs1'
    });

    const [loading, setLoading] = useState(false);
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [topics, setTopics] = useState([
        { id: '1', name: 'Toán học' },
        { id: '2', name: 'Khoa học' },
        { id: '3', name: 'Lịch sử' },
        { id: '4', name: 'Địa lý' },
        { id: '5', name: 'Ngữ văn' },
        { id: '6', name: 'Tiếng Anh' },
        { id: '7', name: 'Kiến thức chung' }
    ]);

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
            if (value === '1vs1') {
                setRoomData({
                    ...roomData, gameMode: value, maxPlayers: 2
                });
            } else if (value === 'battle' && roomData.maxPlayers < 3) {
                setRoomData({
                    ...roomData, gameMode: value, maxPlayers: 3
                });
            } else {
                setRoomData({
                    ...roomData, gameMode: value
                });
            }
        } else {
            setRoomData({
                ...roomData, [name]: type === 'checkbox' ? checked : value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        if (!roomData.name.trim()) {
            setError('Vui lòng nhập tên phòng');
            return;
        }

        if (!roomData.topic) {
            setError('Vui lòng chọn chủ đề câu hỏi');
            return;
        }

        setLoading(true);
        setError('');

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate mock room code
            const mockRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            setRoomCode(mockRoomCode);

            if (onSuccess) {
                onSuccess({ code: mockRoomCode, ...roomData });
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi tạo phòng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
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
                topic: '',
                gameMode: '1vs1'
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

                {error && (
                    <div className="crm-error">
                        <FiAlertCircle />
                        <span>{error}</span>
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
                                <label htmlFor="topic">
                                    <FiBookOpen style={{ marginRight: '8px' }} />
                                    Chủ đề câu hỏi
                                </label>
                                <div className="crm-select-wrapper">
                                    <select
                                        id="topic"
                                        name="topic"
                                        value={roomData.topic}
                                        onChange={handleChange}
                                        className="crm-input crm-select"
                                        required
                                    >
                                        <option value="" disabled>Chọn chủ đề</option>
                                        {topics.map((topic) => (
                                            <option key={`topic-${topic.id}`} value={topic.id}>
                                                {topic.name}
                                            </option>
                                        ))}
                                    </select>
                                    <FiChevronDown className="crm-select-icon" />
                                </div>
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
                                        <option value="1vs1">1 vs 1</option>
                                        <option value="battle">Battle Royale</option>
                                    </select>
                                    <FiChevronDown className="crm-select-icon" />
                                </div>
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
                                    min={roomData.gameMode === '1vs1' ? 2 : 3}
                                    max="20"
                                    value={roomData.maxPlayers}
                                    onChange={handleChange}
                                    className="crm-input"
                                    disabled={roomData.gameMode === '1vs1'}
                                />
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
                                    value={roomData.timeLimit}
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
                                    value={roomData.questionCount}
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
                                disabled={loading}
                            >
                                {loading ? (
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
