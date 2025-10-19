import React from 'react';
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from 'react-icons/md';
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
                    icon: <MdCheckCircle size={28} color="#fff" />,
                    bgColor: '#4CAF50',
                    title: 'Thành công!'
                };
            case 'error':
                return {
                    icon: <MdError size={28} color="#fff" />,
                    bgColor: '#f44336',
                    title: 'Lỗi!'
                };
            case 'warning':
                return {
                    icon: <MdWarning size={28} color="#fff" />,
                    bgColor: '#FF9800',
                    title: 'Cảnh báo!'
                };
            case 'info':
            default:
                return {
                    icon: <MdInfo size={28} color="#fff" />,
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
                        <MdClose size={20} color="#fff" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default NotificationPopup;
