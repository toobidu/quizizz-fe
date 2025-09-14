import { FaExclamationTriangle } from 'react-icons/fa';

const PasswordChangeForm = ({
    isChangingPassword,
    passwordData,
    formErrors,
    updateLoading,
    handlePasswordChange
}) => {
    if (!isChangingPassword) return null;

    return (
        <div className="pf-password-section">
            <h3>Đổi mật khẩu</h3>
            <div className="pf-password-grid">
                <div className="pf-info-card">
                    <label className="pf-info-label">Mật khẩu hiện tại</label>
                    <input
                        type="password"
                        name="currentPassword"
                        className={`pf-info-input ${formErrors.currentPassword ? 'pf-input-error' : ''}`}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu hiện tại"
                    />
                    {formErrors.currentPassword && <span className="pf-error-text">{formErrors.currentPassword}</span>}
                </div>

                <div className="pf-info-card">
                    <label className="pf-info-label">Mật khẩu mới</label>
                    <input
                        type="password"
                        name="newPassword"
                        className={`pf-info-input ${formErrors.newPassword ? 'pf-input-error' : ''}`}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu mới"
                    />
                    {formErrors.newPassword && <span className="pf-error-text">{formErrors.newPassword}</span>}
                </div>

                <div className="pf-info-card">
                    <label className="pf-info-label">Xác nhận mật khẩu</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        className={`pf-info-input ${formErrors.confirmPassword ? 'pf-input-error' : ''}`}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập lại mật khẩu mới"
                    />
                    {formErrors.confirmPassword && <span className="pf-error-text">{formErrors.confirmPassword}</span>}
                </div>
            </div>
        </div>
    );
};

export default PasswordChangeForm;