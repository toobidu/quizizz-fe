import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FiUser, FiUsers, FiTarget, FiCalendar, FiLoader, FiEdit, FiSave, FiX, FiLock, FiAward, FiTrendingUp } from 'react-icons/fi';
import authApi from '../services/authApi';
import profileApi from '../services/profileApi';
import authStore from '../stores/authStore';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { FaRunning } from "react-icons/fa";
import '../styles/pages/Profile.css';
import { FaTrophy } from "react-icons/fa";

function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, setUser } = authStore();
  const isOwnProfile = !username || username === user?.username;

  useDocumentTitle(isOwnProfile ? 'Hồ sơ của tôi' : `Hồ sơ của ${username}`);

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleDateString('vi-VN');
    } catch {
      return 'Chưa cập nhật';
    }
  };

  const getFieldValue = (data, fieldName) => data?.[fieldName] || 'Chưa cập nhật';

  // Hàm xử lý avatar URL
  const getAvatarUrl = (avatarURL) => {
    if (!avatarURL) return '';

    // Nếu là full URL (http/https), trả về nguyên
    if (avatarURL.startsWith('http://') || avatarURL.startsWith('https://')) {
      return avatarURL;
    }

    // Backend URL - thay đổi theo cấu hình thực tế
    const BACKEND_URL = 'http://localhost:8080';

    // Nếu avatarURL chỉ là filename, tạo full URL
    if (!avatarURL.includes('/')) {
      return `${BACKEND_URL}/api/v1/profile/avatar/${avatarURL}`;
    }

    // Nếu đã có path, chỉ cần thêm base URL
    return `${BACKEND_URL}${avatarURL.startsWith('/') ? '' : '/'}${avatarURL}`;
  };

  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Khai báo profileData trước các callback sử dụng nó
  const [profileData, setProfileData] = useState(null);

  // Hàm fetch avatar theo cách của Header
  const fetchAvatar = useCallback(async () => {
    if (avatarUrl || avatarLoading || !profileData?.avatarURL) return;

    try {
      setAvatarLoading(true);
      console.log('Fetching avatar for user:', profileData.username);

      const response = await authApi.getAvatar();

      if (response.isSuccess && response.data) {
        setAvatarUrl(response.data);
        console.log('Avatar URL set successfully');
        return;
      }

      if (response.status === 200 && response.data) {
        try {
          new URL(response.data); // validate URL
          setAvatarUrl(response.data);
          console.log('Avatar URL validated and set');
        } catch {
          console.warn("Invalid avatar URL received:", response.data);
          setAvatarUrl(null);
        }
      } else {
        console.log('Failed to fetch avatar:', response.message);
        setAvatarUrl(null);
      }
    } catch (error) {
      console.error('Error fetching avatar:', error);
      setAvatarUrl(null);
    } finally {
      setAvatarLoading(false);
    }
  }, [avatarUrl, avatarLoading, profileData?.avatarURL, profileData?.username]);

  // Fetch avatar khi có profileData
  useEffect(() => {
    if (profileData?.avatarURL && !avatarUrl && !avatarLoading) {
      fetchAvatar();
    }
  }, [profileData?.avatarURL, avatarUrl, avatarLoading, fetchAvatar]);

  // Auto-refresh avatar every 45 minutes to prevent expiration
  useEffect(() => {
    if (!isAuthenticated || !profileData?.avatarURL) return;

    const refreshAvatar = async () => {
      try {
        console.log('Auto-refreshing avatar...');
        const response = await authApi.getAvatar();

        if (response.isSuccess && response.data) {
          setAvatarUrl(response.data);
          return;
        }

        if (response.status === 200 && response.data) {
          try {
            new URL(response.data); // validate URL
            setAvatarUrl(response.data);
          } catch {
            console.warn("Invalid avatar URL received during refresh:", response.data);
          }
        }
      } catch (error) {
        console.error("Error refreshing avatar:", error);
      }
    };

    // Refresh every 45 minutes (45 * 60 * 1000 ms)
    const refreshInterval = setInterval(refreshAvatar, 45 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated, profileData?.avatarURL]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', phoneNumber: '', address: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        let response;

        if (isOwnProfile) {
          console.log('Profile: Calling getMyProfile()');
          response = await profileApi.getMyProfile();
          console.log('Profile: Full API Response:', JSON.stringify(response, null, 2));
        } else {
          // TODO: Implement search user functionality
          throw new Error('Chức năng xem hồ sơ người khác chưa được implement');
        }

        if (response.isSuccess) {
          console.log('Profile data received:', response.data);
          setProfileData(response.data);
          if (isOwnProfile) {
            setUser(response.data);
            setFormData({
              fullName: getFieldValue(response.data, 'fullName'),
              phoneNumber: getFieldValue(response.data, 'phoneNumber'),
              address: getFieldValue(response.data, 'address'),
            });
          }
        } else {
          console.log('Profile API failed:', response.message);
          setError(response.message);
        }
      } catch (err) {
        setError(err.message || 'Lỗi kết nối đến server');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, isOwnProfile, setUser]);

  const validateProfile = useCallback(() => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Vui lòng nhập họ tên';
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Vui lòng nhập số điện thoại';
    else if (!/^\d{10}$/.test(formData.phoneNumber)) errors.phoneNumber = 'Số điện thoại phải có 10 chữ số';
    if (!formData.address.trim()) errors.address = 'Vui lòng nhập địa chỉ';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const validatePassword = useCallback(() => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    if (!passwordData.newPassword) errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    else if (passwordData.newPassword.length < 6) errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    if (!passwordData.confirmPassword) errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (passwordData.newPassword !== passwordData.confirmPassword)
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [passwordData]);

  const handleProfileChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
    setSuccessMessage('');
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
    setSuccessMessage('');
  }, []);

  const handleUpdateProfile = useCallback(async () => {
    if (!validateProfile()) return;

    try {
      setUpdateLoading(true);
      setError('');
      setSuccessMessage('');

      const updateData = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        email: getFieldValue(profileData, 'email'),
      };

      const result = await profileApi.updateProfile(updateData);

      if (result.isSuccess) {
        setProfileData(result.data);
        setSuccessMessage('Cập nhật thông tin thành công!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setIsEditing(false);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError(error.message || 'Không thể cập nhật thông tin');
    } finally {
      setUpdateLoading(false);
    }
  }, [formData, profileData, validateProfile]);

  const handleChangePassword = useCallback(async () => {
    if (!validatePassword()) return;

    try {
      setUpdateLoading(true);
      setError('');
      setSuccessMessage('');

      const result = await profileApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.isSuccess) {
        setSuccessMessage('Đổi mật khẩu thành công!');
        setTimeout(() => setSuccessMessage(''), 3000);
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError(error.message || 'Không thể đổi mật khẩu');
    } finally {
      setUpdateLoading(false);
    }
  }, [passwordData, validatePassword]);

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
      authStore.getState().logout();
      navigate('/');
    } catch (error) {
      setError(error.message || 'Lỗi khi đăng xuất');
    }
  }, [navigate]);

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
        <button onClick={() => navigate('/dashboard')} className="pf-back-button">
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="pf-layout">
      <main className="pf-content">
        {successMessage && (
          <div className="pf-success-toast">
            <span>{successMessage}</span>
          </div>
        )}
        {error && (
          <div className="pf-error-container">
            <FaExclamationTriangle />
            <span>{error}</span>
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
                    crossOrigin="anonymous"
                    onError={() => {
                      console.log('Avatar URL failed, showing fallback');
                      setAvatarUrl(null);
                    }}
                  />
                ) : profileData.avatarURL ? (
                  <img
                    src={getAvatarUrl(profileData.avatarURL)}
                    alt={`${profileData.username}'s avatar`}
                    className="pf-avatar-image"
                    crossOrigin="anonymous"
                    onError={() => {
                      console.log('Direct avatar URL failed, showing fallback');
                      // Không set avatarUrl = null ở đây để tránh loop
                    }}
                  />
                ) : null}
                <div className="pf-avatar-fallback" style={{
                  display: (avatarUrl || profileData.avatarURL) && !avatarLoading ? 'none' : 'flex'
                }}>
                  {profileData.username?.charAt(0).toUpperCase() || 'U'}
                </div>
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

            {/* Profile Details */}
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

            {/* Edit Actions */}
            {isOwnProfile && (isEditing || isChangingPassword) && (
              <div className="pf-edit-actions">
                <button
                  className="pf-save-btn"
                  onClick={isEditing ? handleUpdateProfile : handleChangePassword}
                  disabled={updateLoading}
                >
                  {updateLoading ? <FiLoader className="pf-spin" /> : <FiSave />} Lưu
                </button>
                <button
                  className="pf-cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setIsChangingPassword(false);
                    setFormErrors({});
                  }}
                  disabled={updateLoading}
                >
                  <FiX /> Hủy
                </button>
              </div>
            )}

            {/* Password Change Form */}
            {isOwnProfile && isChangingPassword && (
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
            )}

            {/* Stats Section */}
            <div className="pf-stats-section">
              <h2 className="pf-section-title">
                <FiTarget className="pf-section-icon" />
                Thống kê
              </h2>
              <div className="pf-stats-grid">
                <div className="pf-stat-card">
                  <FiAward className="pf-stat-icon" />
                  <div className="pf-stat-value">{profileData.highestScore || 0}</div>
                  <div className="pf-stat-label">Điểm cao nhất</div>
                </div>
                <div className="pf-stat-card">
                  <FiUsers className="pf-stat-icon" />
                  <div className="pf-stat-value">#{profileData.highestRank || 'N/A'}</div>
                  <div className="pf-stat-label">Xếp hạng cao nhất</div>
                </div>
                <div className="pf-stat-card">
                  <FiTrendingUp className="pf-stat-icon" />
                  <div className="pf-stat-value">{profileData.fastestTime || 'N/A'}</div>
                  <div className="pf-stat-label">Thời gian nhanh nhất</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isOwnProfile && isChangingPassword && (
          <div className="pf-password-form">
            {[
              { name: 'currentPassword', label: 'Mật khẩu hiện tại', placeholder: 'Nhập mật khẩu hiện tại' },
              { name: 'newPassword', label: 'Mật khẩu mới', placeholder: 'Nhập mật khẩu mới' },
              { name: 'confirmPassword', label: 'Xác nhận mật khẩu', placeholder: 'Nhập lại mật khẩu mới' },
            ].map(({ name, label, placeholder }) => (
              <div className="pf-info-item" key={name}>
                <p className="pf-info-label">{label}:</p>
                <input
                  type="password"
                  name={name}
                  className={`pf-edit-input ${formErrors[name] ? 'pf-input-error' : ''}`}
                  value={passwordData[name]}
                  onChange={handlePasswordChange}
                  placeholder={placeholder}
                  disabled={updateLoading}
                />
                {formErrors[name] && (
                  <p className="pf-error-message">
                    <FaExclamationTriangle /> {formErrors[name]}
                  </p>
                )}
              </div>
            ))}
            <div className="pf-edit-actions">
              <button
                className="pf-save-btn"
                onClick={handleChangePassword}
                disabled={updateLoading}
              >
                {updateLoading ? <FiLoader className="pf-spin" /> : <FiSave />} Lưu
              </button>
              <button
                className="pf-cancel-btn"
                onClick={() => setIsChangingPassword(false)}
                disabled={updateLoading}
              >
                <FiX /> Hủy
              </button>
            </div>
          </div>
        )}

        {isOwnProfile && isEditing && (
          <div className="pf-edit-actions">
            <button
              className="pf-save-btn"
              onClick={handleUpdateProfile}
              disabled={updateLoading}
            >
              {updateLoading ? <FiLoader className="pf-spin" /> : <FiSave />} Lưu
            </button>
            <button
              className="pf-cancel-btn"
              onClick={() => setIsEditing(false)}
              disabled={updateLoading}
            >
              <FiX /> Hủy
            </button>
          </div>
        )}

        <div className="pf-stats">
          <div className="pf-stat-card">
            <FiTarget className="pf-stat-icon" />
            <div className="pf-stat-value">{profileData?.highestScore?.toLocaleString() || 0}</div>
            <div className="pf-stat-label">Điểm cao nhất</div>
          </div>
          <div className="pf-stat-card">
            <FiUsers className="pf-stat-icon" />
            <div className="pf-stat-value">#{profileData?.highestRank || 'N/A'}</div>
            <div className="pf-stat-label">Xếp hạng cao nhất</div>
          </div>
          <div className="pf-stat-card">
            <FiUser className="pf-stat-icon" />
            <div className="pf-stat-value">{profileData?.fastestTime || 'N/A'}</div>
            <div className="pf-stat-label">Thời gian nhanh nhất</div>
          </div>
          <div className="pf-stat-card">
            <FaRunning className="pf-stat-icon" />
            <div className="pf-stat-value">{profileData?.bestTopic || 'N/A'}</div>
            <div className="pf-stat-label">Chủ đề tốt nhất</div>
          </div>
        </div>

        <div className="pf-achievements-section">
          <h2>Thành tích</h2>
          <div className="pf-achievements-grid">
            {profileData?.achievements?.length > 0 ? (
              profileData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`pf-achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
                >
                  <div className="pf-achievement-icon">
                    <FaTrophy />
                  </div>
                  <h3>{achievement.name}</h3>
                  <p>{achievement.desc}</p>
                </div>
              ))
            ) : (
              <div className="pf-no-achievements">
                <p>Chưa có thành tích nào</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;