import { useEffect } from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';
import './SuccessModal.css';

const SuccessModal = ({ show, message, onClose, autoCloseDelay = 3000 }) => {

    // Auto close after delay
    useEffect(() => {
        if (show && autoCloseDelay > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [show, onClose, autoCloseDelay]);

    if (!show) {
        return null;
    }

    return (
        <div className="success-modal-overlay">
            <div className="success-modal">
                <div className="success-modal-content">
                    <div className="success-modal-icon">
                        <FiCheckCircle />
                    </div>
                    <h3 className="success-modal-title">Thành công!</h3>
                    <p className="success-modal-message">{message}</p>
                    <button
                        className="success-modal-close"
                        onClick={onClose}
                        aria-label="Đóng"
                    >
                        <FiX />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;