import { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import authStore from '../stores/authStore';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useProfileData } from '../hooks/useProfileData';
import { useProfileEdit } from '../hooks/useProfileEdit';
import { usePasswordChange } from '../hooks/usePasswordChange';
import { useAvatarUpload } from '../hooks/useAvatarUpload';
import ProfileHeader from '../components/Profile/ProfileHeader';
import ProfileDetails from '../components/Profile/ProfileDetails';
import ProfileStats from '../components/Profile/ProfileStats';
import SuccessModal from '../components/Profile/SuccessModal';
import EditActions from '../components/Profile/EditActions';
import PasswordChangeModal from '../components/Profile/PasswordChangeModal';
import '../styles/pages/Profile.css';
import Decoration from '../components/Decoration';

function Profile() {
  const { isAuthenticated, user, setUser } = authStore();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Custom hooks
  const { profileData, loading, isOwnProfile, setProfileData, setError: setProfileError } = useProfileData();
  const profileEdit = useProfileEdit(profileData, setProfileData);
  const passwordChange = usePasswordChange();
  const avatarUpload = useAvatarUpload(profileData);

  useDocumentTitle(isOwnProfile ? 'Hồ sơ của tôi' : `Hồ sơ của ${profileData?.username}`);

  // Handlers
  const handleUpdateProfile = () => {
    profileEdit.handleUpdateProfile(setError, setSuccessMessage);
  };

  const handleChangePassword = () => {
    passwordChange.handleChangePassword(setError, setSuccessMessage);
  };

  const handleOpenPasswordModal = () => {
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    // Reset form errors when closing
    passwordChange.setFormErrors({});
  };

  const handlePasswordSubmit = () => {
    passwordChange.handleChangePassword(setError, setSuccessMessage);
    if (!passwordChange.updateLoading) {
      setShowPasswordModal(false);
    }
  };

  if (loading) {
    return (
      <div className="pf-loading-container">
        <FiLoader className="pf-loading-spinner" />
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pf-error-container">
        <p className="pf-error-message">{error}</p>
        <button onClick={() => window.history.back()} className="pf-back-button">
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="pf-layout">
      <Decoration />
      <main className="pf-content">
        {(error || avatarUpload.uploadError) && (
          <div className="pf-error-container">
            <FaExclamationTriangle />
            <span>{error || avatarUpload.uploadError}</span>
          </div>
        )}

        {/* Debug info */}
        {!profileData && !loading && (
          <div style={{ padding: '2rem', background: '#f0f0f0', borderRadius: '8px', marginBottom: '2rem' }}>
            <h3>Debug Info:</h3>
            <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
            <p><strong>user:</strong> {JSON.stringify(user, null, 2)}</p>
            <p><strong>profileData:</strong> {JSON.stringify(profileData, null, 2)}</p>
            <p><strong>isOwnProfile:</strong> {isOwnProfile ? 'true' : 'false'}</p>
            <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
          </div>
        )}

        {profileData && (
          <div className="pf-profile-container">
            {/* Profile Header */}
            <ProfileHeader
              profileData={profileData}
              isOwnProfile={isOwnProfile}
              avatarUrl={avatarUpload.avatarUrl}
              avatarLoading={avatarUpload.avatarLoading}
              isEditing={profileEdit.isEditing}
              isChangingPassword={passwordChange.isChangingPassword}
              setIsEditing={profileEdit.setIsEditing}
              setIsChangingPassword={passwordChange.setIsChangingPassword}
              handleFileSelect={(event) => avatarUpload.handleFileSelect(event, setUser)}
              uploadingAvatar={avatarUpload.uploadingAvatar}
              handleOpenPasswordModal={handleOpenPasswordModal}
            />

            {/* Profile Details */}
            <ProfileDetails
              profileData={profileData}
              isOwnProfile={isOwnProfile}
              isEditing={profileEdit.isEditing}
              formData={profileEdit.formData}
              formErrors={profileEdit.formErrors}
              handleProfileChange={profileEdit.handleProfileChange}
            />

            {/* Edit Actions */}
            <EditActions
              isEditing={profileEdit.isEditing}
              isChangingPassword={passwordChange.isChangingPassword}
              updateLoading={profileEdit.updateLoading || passwordChange.updateLoading}
              handleUpdateProfile={handleUpdateProfile}
              handleOpenPasswordModal={handleOpenPasswordModal}
              setIsEditing={profileEdit.setIsEditing}
              setIsChangingPassword={passwordChange.setIsChangingPassword}
              setFormErrors={() => { }} // Có thể implement sau
            />

            {/* Profile Stats */}
            <ProfileStats profileData={profileData} />
          </div>
        )}

        {/* Success Modal for Avatar Upload */}
        <SuccessModal
          show={avatarUpload.showSuccessModal}
          message={avatarUpload.successMessage}
          onClose={avatarUpload.closeSuccessModal}
        />

        {/* Password Change Modal */}
        <PasswordChangeModal
          showModal={showPasswordModal}
          onClose={handleClosePasswordModal}
          passwordData={passwordChange.passwordData}
          formErrors={passwordChange.formErrors}
          updateLoading={passwordChange.updateLoading}
          handlePasswordChange={passwordChange.handlePasswordChange}
          handleSubmit={handlePasswordSubmit}
        />
      </main>
    </div>
  );
}

export default Profile;