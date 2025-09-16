import { FiX, FiSave, FiLoader, FiLock } from 'react-icons/fi';
import '../../styles/components/profile/PasswordChangeModal.css';

const PasswordChangeModal = ({
    showModal,
    onClose,
    passwordData,
    formErrors,
    updateLoading,
    handlePasswordChange,
    handleSubmit
}) => {
    if (!showModal) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="pf-password-modal-overlay" onClick={handleOverlayClick}>
            <div className="pf-password-modal">
                <div className="pf-password-modal-header">
                    <h3>
                        <FiLock className="pf-modal-icon" />
                        Đổi mật khẩu
                    </h3>
                    <button
                        className="pf-password-modal-close"
                        onClick={onClose}
                        disabled={updateLoading}
                    >
                        <FiX />
                    </button>
                </div>

                <div className="pf-password-modal-body">
                    <div className="pf-password-form">
                        <div className="pf-password-field">
                            <label className="pf-password-label">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                name="currentPassword"
                                className={`pf-password-input ${formErrors.currentPassword ? 'pf-password-input-error' : ''}`}
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Nhập mật khẩu hiện tại"
                                disabled={updateLoading}
                            />
                            {formErrors.currentPassword && (
                                <span className="pf-password-error-text">{formErrors.currentPassword}</span>
                            )}
                        </div>

                        <div className="pf-password-field">
                            <label className="pf-password-label">Mật khẩu mới</label>
                            <input
                                type="password"
                                name="newPassword"
                                className={`pf-password-input ${formErrors.newPassword ? 'pf-password-input-error' : ''}`}
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                disabled={updateLoading}
                            />
                            {formErrors.newPassword && (
                                <span className="pf-password-error-text">{formErrors.newPassword}</span>
                            )}
                        </div>

                        <div className="pf-password-field">
                            <label className="pf-password-label">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className={`pf-password-input ${formErrors.confirmPassword ? 'pf-password-input-error' : ''}`}
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Nhập lại mật khẩu mới"
                                disabled={updateLoading}
                            />
                            {formErrors.confirmPassword && (
                                <span className="pf-password-error-text">{formErrors.confirmPassword}</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pf-password-modal-footer">
                    <button
                        className="pf-password-cancel-btn"
                        onClick={onClose}
                        disabled={updateLoading}
                    >
                        Hủy
                    </button>
                    <button
                        className="pf-password-save-btn"
                        onClick={handleSubmit}
                        disabled={updateLoading}
                    >
                        {updateLoading ? (
                            <>
                                <FiLoader className="pf-spin" />
                                Đang cập nhật...
                            </>
                        ) : (
                            <>
                                <FiSave />
                                Đổi mật khẩu
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasswordChangeModal;