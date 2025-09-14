import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaRunning } from 'react-icons/fa';
import { FiUser, FiUsers, FiTarget, FiCalendar, FiLoader, FiEdit, FiSave, FiX, FiLock } from 'react-icons/fi';
import authApi from '../services/authApi';
import profileApi from '../services/profileApi';
import authStore from '../stores/authStore';
import useDocumentTitle from '../hooks/useDocumentTitle';
import '../style/pages/Profile.css';

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

  const [profileData, setProfileData] = useState(null);
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
          response = await authApi.getUser();
        } else {
          // TODO: Implement search user functionality
          throw new Error('Chức năng xem hồ sơ người khác chưa được implement');
        }

        if (response.isSuccess) {
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
      <div className="pf-layout">
        <div className="pf-loading-container">
          <FiLoader className="pf-loading-spinner" />
          <p>Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pf-layout">
        <Header userName={user?.username} handleLogout={handleLogout} />
        <div className="pf-error-container">
          <p className="pf-error-message">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="pf-back-button">
            Quay lại trang chủ
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="pf-layout">
      <Header userName={user?.username} handleLogout={handleLogout} />
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
        <div className="pf-header">
          <div className="pf-avatar">{profileData?.username?.charAt(0).toUpperCase() || 'U'}</div>
          <div className="pf-info">
            <div className="pf-title">
              <h1>{profileData?.username || 'Unknown User'}</h1>
              <div className="pf-actions">
                {isOwnProfile && !isEditing && !isChangingPassword ? (
                  <>
                    <button className="pf-edit-btn" onClick={() => setIsEditing(true)}>
                      <FiEdit className="pf-btn-icon" /> Cập nhật thông tin
                    </button>
                    <button className="pf-edit-btn" onClick={() => setIsChangingPassword(true)}>
                      <FiLock className="pf-btn-icon" /> Đổi mật khẩu
                    </button>
                  </>
                ) : null}
              </div>
            </div>
            <div className="pf-info-grid">
              {[
                { name: 'fullName', label: 'Họ tên', type: 'text', placeholder: 'Nhập họ tên' },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'Nhập email', disabled: true },
                { name: 'phoneNumber', label: 'Số điện thoại', type: 'tel', placeholder: 'Nhập số điện thoại' },
                { name: 'address', label: 'Địa chỉ', type: 'text', placeholder: 'Nhập địa chỉ' },
              ].map(({ name, label, type, placeholder, disabled }) => (
                <div className="pf-info-item" key={name}>
                  <p className="pf-info-label">{label}:</p>
                  {isOwnProfile && isEditing && !disabled ? (
                    <input
                      type={type}
                      name={name}
                      className={`pf-edit-input ${formErrors[name] ? 'pf-input-error' : ''}`}
                      value={formData[name]}
                      onChange={handleProfileChange}
                      placeholder={placeholder}
                      disabled={updateLoading}
                    />
                  ) : (
                    <p className="pf-info-value">{getFieldValue(profileData, name)}</p>
                  )}
                  {formErrors[name] && (
                    <p className="pf-error-message">
                      <FaExclamationTriangle /> {formErrors[name]}
                    </p>
                  )}
                </div>
              ))}
              <div className="pf-info-item">
                <p className="pf-info-label">Tham gia từ:</p>
                <p className="pf-info-value">
                  <FiCalendar className="pf-icon" /> {formatDate(getFieldValue(profileData, 'createdAt'))}
                </p>
              </div>
            </div>
          </div>
        </div>

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
                    <FiTrophy />
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
      <Footer />
    </div>
  );
}

export default Profile;