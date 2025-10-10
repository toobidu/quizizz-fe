import React, { useState } from 'react';
import { FiAlertCircle, FiHash, FiInfo, FiX, FiKey, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useTheme } from '../../contexts/ThemeContext';
import useRoomStore from '../../stores/useRoomStore';
import '../../styles/components/room/JoinByCodeModal.css';

const JoinByCodeModal = ({ isOpen, onClose, onJoin, onSuccess }) => {
  const [roomCode, setRoomCode] = useState('');
  const { theme } = useTheme();
  const { joinRoomByCode, isLoading, error: storeError } = useRoomStore();

  const validateRoomCode = (code) => {
    return /^[A-Z0-9]{8}$/.test(code);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      toast.error('Vui lòng nhập mã phòng');
      return;
    }
    if (!validateRoomCode(roomCode)) {
      toast.error('Mã phòng phải gồm 8 ký tự chữ cái hoặc số');
      return;
    }

    try {
      const result = await joinRoomByCode(roomCode);
      if (result.success) {
        toast.success('Tham gia phòng thành công!');
        onJoin?.(roomCode);
        onSuccess?.(result);
        handleClose();
      } else {
        toast.error(result.error || 'Không thể tham gia phòng');
      }
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra khi tham gia phòng');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setRoomCode(value.substring(0, 8));
  };

  const handleKeyDown = (e) => {
    if (roomCode.length >= 8 && e.key !== 'Backspace' && e.key !== 'Delete' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    if (roomCode.length >= 8) {
      e.preventDefault();
      return;
    }
    const paste = e.clipboardData.getData('text');
    const cleanedPaste = paste.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setRoomCode((roomCode + cleanedPaste).substring(0, 8));
    e.preventDefault();
  };

  const handleClose = () => {
    setRoomCode('');
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('jbc-overlay')) {
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
                    ? validateRoomCode(roomCode)
                        ? 'Mã phòng hợp lệ! Nhấn tham gia để tiếp tục'
                        : 'Mã phòng không hợp lệ'
                    : roomCode.length > 0
                        ? `Đã nhập ${roomCode.length}/8 ký tự`
                        : 'Chỉ nhập chữ cái và số, không có khoảng trắng'}
              </div>
            </div>

            {storeError && (
                <div className="jbc-error">
                  <FiAlertCircle />
                  <span>{storeError}</span>
                  <button onClick={() => setRoomCode('')} className="jbc-error-clear">
                    Thử lại
                  </button>
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
                  disabled={!validateRoomCode(roomCode) || isLoading}
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