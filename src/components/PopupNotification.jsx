import { useState, useEffect } from 'react';
import { FiX, FiCheck, FiAlertTriangle, FiInfo, FiAlertCircle } from 'react-icons/fi';
import './PopupNotification.css';

const PopupNotification = ({ 
    type = 'info', 
    title, 
    message, 
    isVisible, 
    onClose, 
    autoClose = true, 
    duration = 4000,
    showConfirm = false,
    onConfirm,
    onCancel,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy'
}) => {
    const [show, setShow] = useState(isVisible);

    useEffect(() => {
        setShow(isVisible);
        
        if (isVisible && autoClose && !showConfirm) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            
            return () => clearTimeout(timer);
        }
    }, [isVisible, autoClose, duration, showConfirm]);

    const handleClose = () => {
        setShow(false);
        setTimeout(() => {
            onClose?.();
        }, 300);
    };

    const handleConfirm = () => {
        onConfirm?.();
        handleClose();
    };

    const handleCancel = () => {
        onCancel?.();
        handleClose();
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FiCheck />;
            case 'error':
                return <FiAlertCircle />;
            case 'warning':
                return <FiAlertTriangle />;
            default:
                return <FiInfo />;
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`popup-overlay ${show ? 'show' : ''}`}>
            <div className={`popup-notification ${type} ${show ? 'show' : ''}`}>
                <div className="popup-header">
                    <div className="popup-icon">
                        {getIcon()}
                    </div>
                    <div className="popup-content">
                        {title && <h3 className="popup-title">{title}</h3>}
                        <p className="popup-message">{message}</p>
                    </div>
                    {!showConfirm && (
                        <button className="popup-close" onClick={handleClose}>
                            <FiX />
                        </button>
                    )}
                </div>
                
                {showConfirm && (
                    <div className="popup-actions">
                        <button className="popup-btn popup-btn-cancel" onClick={handleCancel}>
                            {cancelText}
                        </button>
                        <button className="popup-btn popup-btn-confirm" onClick={handleConfirm}>
                            {confirmText}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PopupNotification;