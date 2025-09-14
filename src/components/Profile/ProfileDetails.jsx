import { FiUser } from 'react-icons/fi';
import { getFieldValue, formatDate } from '../../utils/profileUtils';

const ProfileDetails = ({
    profileData,
    isOwnProfile,
    isEditing,
    formData,
    formErrors,
    handleProfileChange
}) => {
    return (
        <div className="pf-profile-details">
            <div className="pf-section">
                <h2 className="pf-section-title">
                    <FiUser className="pf-section-icon" />
                    Thông tin cá nhân
                </h2>
                <div className="pf-info-grid">
                    <div className="pf-info-card">
                        <label className="pf-info-label">Họ tên</label>
                        {isOwnProfile && isEditing ? (
                            <input
                                type="text"
                                name="fullName"
                                className={`pf-info-input ${formErrors.fullName ? 'pf-input-error' : ''}`}
                                value={formData.fullName}
                                onChange={handleProfileChange}
                                placeholder="Nhập họ tên"
                            />
                        ) : (
                            <p className="pf-info-value">{profileData.fullName || 'Chưa cập nhật'}</p>
                        )}
                        {formErrors.fullName && <span className="pf-error-text">{formErrors.fullName}</span>}
                    </div>

                    <div className="pf-info-card">
                        <label className="pf-info-label">Email</label>
                        {isOwnProfile && isEditing ? (
                            <input
                                type="email"
                                name="email"
                                className={`pf-info-input ${formErrors.email ? 'pf-input-error' : ''}`}
                                value={formData.email || profileData.email || ''}
                                onChange={handleProfileChange}
                                placeholder="Nhập email"
                                disabled
                            />
                        ) : (
                            <p className="pf-info-value">{profileData.email || 'Chưa cập nhật'}</p>
                        )}
                    </div>

                    <div className="pf-info-card">
                        <label className="pf-info-label">Số điện thoại</label>
                        {isOwnProfile && isEditing ? (
                            <input
                                type="tel"
                                name="phoneNumber"
                                className={`pf-info-input ${formErrors.phoneNumber ? 'pf-input-error' : ''}`}
                                value={formData.phoneNumber}
                                onChange={handleProfileChange}
                                placeholder="Nhập số điện thoại"
                            />
                        ) : (
                            <p className="pf-info-value">{profileData.phoneNumber || 'Chưa cập nhật'}</p>
                        )}
                        {formErrors.phoneNumber && <span className="pf-error-text">{formErrors.phoneNumber}</span>}
                    </div>

                    <div className="pf-info-card">
                        <label className="pf-info-label">Địa chỉ</label>
                        {isOwnProfile && isEditing ? (
                            <input
                                type="text"
                                name="address"
                                className={`pf-info-input ${formErrors.address ? 'pf-input-error' : ''}`}
                                value={formData.address}
                                onChange={handleProfileChange}
                                placeholder="Nhập địa chỉ"
                            />
                        ) : (
                            <p className="pf-info-value">{profileData.address || 'Chưa cập nhật'}</p>
                        )}
                        {formErrors.address && <span className="pf-error-text">{formErrors.address}</span>}
                    </div>

                    <div className="pf-info-card">
                        <label className="pf-info-label">Ngày sinh</label>
                        <p className="pf-info-value">{formatDate(profileData.dob)}</p>
                    </div>
                    <div className="pf-info-card">
                        <label className="pf-info-label">Username</label>
                        <p className="pf-info-value">{profileData.username || 'Chưa cập nhật'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetails;