import { useState } from 'react';
import { FiAlertCircle, FiHash, FiInfo, FiLogIn, FiX, FiKey, FiArrowRight } from 'react-icons/fi';
import '../../styles/components/room/JoinByCodeModal.css';

const JoinByCodeModal = ({ isOpen, onClose, onJoin, loading, error }) => {
    const [roomCode, setRoomCode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (roomCode.trim()) {
            onJoin(roomCode.trim().toUpperCase());
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (value.length <= 6) {
            setRoomCode(value);
        }
    };

    const handleClose = () => {
        setRoomCode('');
        onClose();
    };

    const handleOverlayClick = (e) => {
        // Chỉ đóng modal khi click vào overlay, không phải vào nội dung modal
        if (e.target.className === 'jbc-overlay') {
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="jbc-overlay" onClick={handleOverlayClick}>
            <div className="jbc-container">
                <div className="jbc-header">
                    <div className="jbc-header-content">
                        <div className="jbc-header-icon">
                            <FiKey />
                        </div>
                        <div className="jbc-header-text">
                            <h2 className="jbc-title">Tham gia phòng</h2>
                            <p className="jbc-subtitle">Nhập mã phòng để bắt đầu</p>
                        </div>
                    </div>
                    <button className="jbc-close" onClick={handleClose}>
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="jbc-form">
                    <div className="jbc-form-group">
                        <label htmlFor="roomCode">
                            <FiHash style={{ marginRight: '8px' }} />
                            Mã phòng (6 ký tự)
                        </label>
                        <div className="jbc-code-input-container">
                            <input
                                id="roomCode"
                                type="text"
                                value={roomCode}
                                onChange={handleInputChange}
                                placeholder="ABC123"
                                maxLength={6}
                                autoFocus
                                disabled={loading}
                                className="jbc-input"
                            />
                            <div className="jbc-code-icon">
                                <FiHash />
                            </div>
                        </div>
                        <div className="jbc-input-hint">
                            Chỉ nhập chữ cái và số, không có khoảng trắng
                        </div>
                    </div>

                    {error && (
                        <div className="jbc-error">
                            <FiAlertCircle />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="jbc-actions">
                        <button
                            type="button"
                            className="jbc-button jbc-secondary-btn"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="jbc-button jbc-primary-btn"
                            disabled={!roomCode.trim() || loading}
                        >
                            {loading ? (
                                <>
                                    <div className="jbc-loading-spinner"></div>
                                    Đang tham gia...
                                </>
                            ) : (
                                <>
                                    Tham gia phòng
                                    <FiArrowRight style={{ marginLeft: '8px' }} />
                                </>
                            )}
                        </button>
                    </div>

                    <div className="jbc-info">
                        <FiInfo style={{ marginRight: '8px' }} />
                        Mã phòng được chia sẻ bởi người tạo phòng
                    </div>
                </form>
            </div>
        </div>
    );
};

export default JoinByCodeModal;
