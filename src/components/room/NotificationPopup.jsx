import React from 'react';
import '../../styles/components/room/NotificationPopup.css';

/**
 * NotificationPopup - Popup thông báo thay thế cho toast
 * Hỗ trợ các loại: success, error, info, warning
 */
const NotificationPopup = ({ type = 'info', message, onClose, autoClose = true }) => {
    React.useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(() => {
                onClose?.();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [autoClose, onClose]);

    const getTypeConfig = () => {
        switch (type) {
            case 'success':
                return {
                    icon: '✅',
                    bgColor: '#4CAF50',
                    title: 'Thành công!'
                };
            case 'error':
                return {
                    icon: '❌',
                    bgColor: '#f44336',
                    title: 'Lỗi!'
                };
            case 'warning':
                return {
                    icon: '⚠️',
                    bgColor: '#FF9800',
                    title: 'Cảnh báo!'
                };
            case 'info':
            default:
                return {
                    icon: 'ℹ️',
                    bgColor: '#2196F3',
                    title: 'Thông báo'
                };
        }
    };

    const config = getTypeConfig();

    return (
        <div className="notification-popup-overlay">
            <div
                className={`notification-popup ${type}`}
                style={{ backgroundColor: config.bgColor }}
            >
                <div className="notification-icon">{config.icon}</div>
                <div className="notification-content">
                    <h3 className="notification-title">{config.title}</h3>
                    <p className="notification-message">{message}</p>
                </div>
                {onClose && (
                    <button className="notification-close" onClick={onClose}>
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
};

export default NotificationPopup;

