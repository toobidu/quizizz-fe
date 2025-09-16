import { FiUser } from 'react-icons/fi';
import { getFieldValue, formatDate } from '../../utils/profileUtils';
import '../../styles/components/profile/ProfileDetails.css';

const ProfileDetails = ({
    profileData,
    isOwnProfile,
    isEditing,
    formData,
    formErrors,
    handleProfileChange
}) => {
    if (!profileData) {
        return null;
    }

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
                                value={profileData.email || ''}
                                onChange={handleProfileChange}
                            />
                        ) : (
                            <p className="pf-info-value">{profileData.email || 'Chưa cập nhật'}</p>
                        )}
                        {formErrors.email && <span className="pf-error-text">{formErrors.email}</span>}
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
                        {isOwnProfile && isEditing ? (
                            <input
                                type="date"
                                name="dob"
                                className={`pf-info-input ${formErrors.dob ? 'pf-input-error' : ''}`}
                                value={formData.dob}
                                onChange={handleProfileChange}
                                placeholder="Chọn ngày sinh"
                            />
                        ) : (
                            <p className="pf-info-value">{formatDate(profileData.dob)}</p>
                        )}
                        {formErrors.dob && <span className="pf-error-text">{formErrors.dob}</span>}
                    </div>
                    <div className="pf-info-card">
                        <label className="pf-info-label">Username</label>
                        <p className="pf-info-value pf-readonly-field">{profileData.username || 'Chưa cập nhật'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetails;