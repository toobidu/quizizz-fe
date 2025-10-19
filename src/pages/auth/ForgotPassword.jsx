import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaExclamationCircle } from 'react-icons/fa';
import { IoArrowBackSharp } from 'react-icons/io5';
import { FaBrain } from 'react-icons/fa6';
import authApi from '../../services/authApi';
import authStore from '../../stores/authStore';
import Decoration from '../../components/Decoration';
import Toast from '../../components/Toast';
import '../../styles/pages/auth/ForgotPassword.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = authStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = useCallback((e) => {
    setEmail(e.target.value);
    setError('');
    setSuccessMessage('');
  }, []);

  const validateEmail = useCallback(() => {
    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ');
      return false;
    }
    if (email.length > 255) {
      setError('Email quá dài (tối đa 255 ký tự)');
      return false;
    }
    return true;
  }, [email]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateEmail()) return;

      setIsSubmitting(true);
      setError('');
      setSuccessMessage('');

      try {
        await authApi.forgotPassword(email);
        setSuccessMessage('Mật khẩu mới đã được gửi đến email của bạn!');
        setToast({ type: 'success', message: 'Vui lòng kiểm tra hộp thư để lấy mật khẩu mới.' });
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra, vui lòng thử lại';
        setError(errorMessage);
        setToast({ type: 'error', message: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, validateEmail]
  );

  return (
    <div className="fp-container">
      <Decoration />
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <div className="fp-card">
        {!successMessage && (
          <Link to="/login" className="fp-back-button" aria-label="Quay lại trang đăng nhập">
            <IoArrowBackSharp size={20} />
          </Link>
        )}

        <div className="fp-header">
          <div className="fp-logo">
            <div className="fp-logo-icon">
              <FaBrain size={40} color="#dd797a" />
            </div>
            <span className="fp-logo-text">BrainGame</span>
          </div>
          <h1 className="fp-title">
            {successMessage ? 'Email đã được gửi' : 'Quên mật khẩu'}
          </h1>
        </div>

        {successMessage && (
          <div className="fp-success-container">
            <div className="fp-success-message">
              <span className="fp-success-icon">✓</span>
              <span>{successMessage}</span>
            </div>
            <div className="fp-success-actions">
              <Link to="/login" className="fp-submit-button">
                Quay lại trang đăng nhập
              </Link>
            </div>
          </div>
        )}

        {!successMessage && (
          <>

            <form className="fp-form" onSubmit={handleSubmit}>
              <div className="fp-form-group">
                <label className="fp-form-label" htmlFor="email">
                  <FaEnvelope className="fp-input-icon" />
                  <span>Email</span>
                </label>
                <div className="fp-input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`fp-form-input ${error ? 'fp-input-error' : ''}`}
                    value={email}
                    onChange={handleChange}
                    placeholder="Nhập email của bạn"
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                  {error && (
                    <div className="fp-error-message">
                      <FaExclamationCircle size={14} />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                className={`fp-submit-button ${isSubmitting ? 'loading' : ''}`}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="fp-loading-spinner-container">
                      <div className="fp-loading-spinner"></div>
                    </div>
                    <span className="fp-button-text">Đang gửi email...</span>
                  </>
                ) : (
                  <span>Gửi email đặt lại mật khẩu</span>
                )}
              </button>
            </form>

            <div className="fp-divider">
              <span>hoặc</span>
            </div>

            <div className="fp-login-link">
              <span>Đã nhớ mật khẩu?</span>
              <Link to="/login">Đăng nhập ngay</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;