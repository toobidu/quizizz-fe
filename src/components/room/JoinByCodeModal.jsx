import { useState } from 'react';
import { FiAlertCircle, FiHash, FiInfo, FiLogIn, FiX, FiKey, FiArrowRight } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import useRoomStore from '../../stores/useRoomStore';
import '../../styles/components/room/JoinByCodeModal.css';

const JoinByCodeModal = ({ isOpen, onClose, onJoin, onSuccess }) => {
    const [roomCode, setRoomCode] = useState('');
    const { theme } = useTheme();
    const { joinRoomByCode, isLoading, error: storeError } = useRoomStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (roomCode.trim()) {
            try {
                const result = await joinRoomByCode(roomCode.trim().toUpperCase());
                if (result.success) {
                    if (onJoin) {
                        onJoin(roomCode.trim().toUpperCase());
                    }
                    if (onSuccess) {
                        onSuccess(result);
                    }
                    handleClose();
                }
            } catch (err) {
            }
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        // Chỉ cho phép nhập đúng 8 ký tự
        const truncatedValue = value.substring(0, 8);
        setRoomCode(truncatedValue);
    };

    const handleKeyDown = (e) => {
        // Ngăn chặn nhập thêm khi đã đủ 8 ký tự
        if (roomCode.length >= 8 && e.key !== 'Backspace' && e.key !== 'Delete' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
        }
    };

    const handlePaste = (e) => {
        // Ngăn chặn paste khi đã đủ 8 ký tự
        if (roomCode.length >= 8) {
            e.preventDefault();
            return;
        }

        // Xử lý paste content
        const paste = e.clipboardData.getData('text');
        const cleanedPaste = paste.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const combinedValue = roomCode + cleanedPaste;
        const truncatedValue = combinedValue.substring(0, 8);
        setRoomCode(truncatedValue);
        e.preventDefault();
    };

    const handleClose = () => {
        setRoomCode('');
        onClose();
    };

    const handleOverlayClick = (e) => {
        // Chỉ đóng modal khi click vào overlay, không phải vào nội dung modal
        if (e.target.className.includes('jbc-overlay')) {
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`jbc-overlay ${theme}`} onClick={handleOverlayClick}>
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
                            Mã phòng (8 ký tự)
                        </label>
                        <div className={`jbc-code-input-container has-${roomCode.length}-char`}>
                            <input
                                id="roomCode"
                                type="text"
                                value={roomCode}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onPaste={handlePaste}
                                placeholder="ABC12345"
                                maxLength={8}
                                autoFocus
                                disabled={isLoading}
                                className="jbc-input"
                            />
                            <div className="jbc-code-icon">
                                <FiHash />
                            </div>
                        </div>
                        <div className="jbc-input-hint">
                            {roomCode.length === 8
                                ? "Mã phòng hợp lệ! Nhấn tham gia để tiếp tục"
                                : roomCode.length > 0
                                    ? `Đã nhập ${roomCode.length}/8 ký tự`
                                    : "Chỉ nhập chữ cái và số, không có khoảng trắng"
                            }
                        </div>
                    </div>

                    {storeError && (
                        <div className="jbc-error">
                            <FiAlertCircle />
                            <span>{storeError}</span>
                        </div>
                    )}

                    <div className="jbc-actions">
                        <button
                            type="button"
                            className="jbc-button jbc-secondary-btn"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="jbc-button jbc-primary-btn"
                            disabled={!roomCode.trim() || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="jbc-loading-spinner"></div>
                                    Đang tham gia...
                                </>
                            ) : (
                                <>
                                    Tham gia
                                    <FiArrowRight style={{ marginLeft: '4px' }} />
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
