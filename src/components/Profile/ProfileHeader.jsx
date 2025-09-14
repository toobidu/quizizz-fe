import { FiUser, FiCalendar, FiEdit, FiLock, FiLoader, FiCamera } from 'react-icons/fi';
import { formatDate, getAvatarUrl } from '../../utils/profileUtils';

const ProfileHeader = ({
    profileData,
    isOwnProfile,
    avatarUrl,
    avatarLoading,
    isEditing,
    isChangingPassword,
    setIsEditing,
    setIsChangingPassword,
    handleFileSelect,
    uploadingAvatar,
    setUser
}) => {
    return (
        <div className="pf-profile-header">
            <div className="pf-avatar-section">
                {avatarLoading ? (
                    <div className="pf-avatar-loading">
                        <FiLoader className="pf-spin" />
                    </div>
                ) : avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={`${profileData.username}'s avatar`}
                        className="pf-avatar-image"
                        onError={(e) => {
                            console.error('Avatar presigned URL failed:', avatarUrl, e);
                            // setAvatarUrl(null); // Có thể thêm logic này sau
                        }}
                    />
                ) : profileData.avatarURL ? (
                    <img
                        src={getAvatarUrl(profileData.avatarURL)}
                        alt={`${profileData.username}'s avatar`}
                        className="pf-avatar-image"
                        onError={(e) => {
                            console.error('Fallback avatar URL failed:', getAvatarUrl(profileData.avatarURL), e);
                        }}
                    />
                ) : null}
                <div
                    className="pf-avatar-fallback"
                    style={{
                        display: (avatarUrl || profileData.avatarURL) && !avatarLoading ? 'none' : 'flex'
                    }}
                >
                    {profileData.username?.charAt(0).toUpperCase() || 'U'}
                </div>

                {/* Avatar Upload Button */}
                {isOwnProfile && (
                    <div className="pf-avatar-upload">
                        <input
                            type="file"
                            id="avatar-upload"
                            accept="image/png,image/jpeg,image/jpg"
                            onChange={(e) => handleFileSelect(e, setUser)}
                            style={{ display: 'none' }}
                            disabled={uploadingAvatar}
                        />
                        <label htmlFor="avatar-upload" className="pf-avatar-upload-btn">
                            {uploadingAvatar ? (
                                <FiLoader className="pf-spin" />
                            ) : (
                                <FiCamera />
                            )}
                        </label>
                    </div>
                )}
            </div>
            <div className="pf-user-info">
                <h1 className="pf-username">{profileData.username || 'Unknown User'}</h1>
                <p className="pf-fullname">{profileData.fullName || 'Chưa cập nhật'}</p>
                <div className="pf-user-meta">
                    <span className="pf-join-date">
                        <FiCalendar className="pf-meta-icon" />
                        Tham gia: {formatDate(profileData.createdAt)}
                    </span>
                </div>
            </div>
            {isOwnProfile && (
                <div className="pf-actions">
                    {!isEditing && !isChangingPassword && (
                        <>
                            <button className="pf-edit-btn" onClick={() => setIsEditing(true)}>
                                <FiEdit className="pf-btn-icon" /> Cập nhật thông tin
                            </button>
                            <button className="pf-edit-btn" onClick={() => setIsChangingPassword(true)}>
                                <FiLock className="pf-btn-icon" /> Đổi mật khẩu
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProfileHeader;