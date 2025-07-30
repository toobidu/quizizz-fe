import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaExclamationCircle, FaExclamationTriangle, FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import { IoArrowBackSharp } from 'react-icons/io5';
import { FaBrain } from 'react-icons/fa6';
import authApi from '../../config/api/auth.api';
import authStore from '../../stores/authStore';
import Background from '../../components/Background';
import '../../style/pages/auth/NewPassword.css';

function NewPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = authStore();
  const { email, otp, verified } = location.state || {};
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Chuyển hướng nếu đã đăng nhập hoặc thiếu thông tin
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (!email || !otp || !verified) {
      setError('Thông tin xác thực không hợp lệ. Vui lòng thử lại từ đầu.');
      setTimeout(() => navigate('/forgot-password'), 3000);
    }
  }, [email, otp, verified, isAuthenticated, navigate]);

  // Xử lý thay đổi input
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
    setSuccessMessage('');
  }, []);

  // Validate từng trường
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'password':
        if (!value) return 'Vui lòng nhập mật khẩu mới';
        if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
        return '';
      case 'confirmPassword':
        if (!value) return 'Vui lòng xác nhận mật khẩu';
        if (value !== formData.password) return 'Mật khẩu xác nhận không khớp';
        return '';
      default:
        return '';
    }
  }, [formData.password]);

  // Validate toàn bộ form
  const validateForm = useCallback(() => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // Xử lý submit form
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      setError('');
      setSuccessMessage('');

      try {
        await authApi.resetPassword(email, otp, formData.password);
        setSuccessMessage('Đặt lại mật khẩu thành công! Chuyển hướng sau 3 giây...');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
        setError(errorMessage);
        console.error('Reset password error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, otp, formData, validateForm, navigate]
  );

  // Xử lý quay lại
  const handleBack = useCallback(() => {
    navigate('/verify-otp', { state: { email } });
  }, [email, navigate]);

  if (error && !successMessage) {
    return (
      <div className="new-password-container">
        <Background />
        <div className="new-password-card">
          <a onClick={handleBack} className="back-button" aria-label="Quay lại">
            <IoArrowBackSharp size={20} />
          </a>
          <div className="new-password-header">
            <div className="new-password-logo">
              <div className="logo-icon">
                <FaBrain size={40} color="#dd797a" />
              </div>
              <span className="logo-text">BrainGame</span>
            </div>
            <h1 className="new-password-title">Lỗi</h1>
          </div>
          <div className="new-password-error">
            <FaExclamationTriangle size={18} />
            <span>{error}</span>
          </div>
          <p className="new-password-subtitle">Chuyển hướng sau 3 giây...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="new-password-container">
      <Background />
      <div className="new-password-card">
        <a onClick={handleBack} className="back-button" aria-label="Quay lại">
          <IoArrowBackSharp size={20} />
        </a>
        <div className="new-password-header">
          <div className="new-password-logo">
            <div className="logo-icon">
              <FaBrain size={40} color="#dd797a" />
            </div>
            <span className="logo-text">BrainGame</span>
          </div>
          <h1 className="new-password-title">Đặt mật khẩu mới</h1>
          <p className="new-password-subtitle">Tạo mật khẩu mới cho tài khoản của bạn</p>
        </div>

        {(error || successMessage) && (
          <div className={`new-password-error ${successMessage ? 'new-password-success' : ''}`}>
            {successMessage ? (
              <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
            ) : (
              <FaExclamationTriangle size={18} />
            )}
            <span>{successMessage || error}</span>
          </div>
        )}

        <form className="new-password-form" onSubmit={handleSubmit}>
          {[
            {
              name: 'password',
              label: 'Mật khẩu mới',
              icon: FaLock,
              type: showPassword ? 'text' : 'password',
              placeholder: 'Nhập mật khẩu mới',
              showToggle: showPassword,
              setShowToggle: setShowPassword,
              error: errors.password,
            },
            {
              name: 'confirmPassword',
              label: 'Xác nhận mật khẩu',
              icon: FaLock,
              type: showConfirmPassword ? 'text' : 'password',
              placeholder: 'Nhập lại mật khẩu mới',
              showToggle: showConfirmPassword,
              setShowToggle: setShowConfirmPassword,
              error: errors.confirmPassword,
            },
          ].map(({ name, label, icon: Icon, type, placeholder, showToggle, setShowToggle, error }) => (
            <div className="form-group" key={name}>
              <label className="form-label" htmlFor={name}>
                <Icon className="input-icon" />
                <span>{label}</span>
              </label>
              <div className="input-wrapper password-wrapper">
                <input
                  type={type}
                  id={name}
                  name={name}
                  className={`form-input ${error ? 'input-error' : ''}`}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowToggle(!showToggle)}
                  disabled={isSubmitting}
                >
                  {showToggle ? <FaEyeSlash size={20} color="#718096" /> : <FaEye size={20} color="#718096" />}
                </button>
              </div>
              {error && (
                <div className="error-message">
                  <FaExclamationCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </div>
          ))}

          <button
            className={`submit-button ${isSubmitting ? 'loading' : ''}`}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner-container">
                  <div className="loading-spinner"></div>
                </div>
                <span className="button-text">Đang cập nhật...</span>
              </>
            ) : (
              <span>Cập nhật mật khẩu</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default NewPassword;