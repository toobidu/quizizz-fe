import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import { IoArrowBackSharp } from 'react-icons/io5';
import { FaBrain } from 'react-icons/fa6';
import authApi from '../../config/api/auth.api';
import authStore from '../../stores/authStore';
import Background from '../../components/Background';
import '../../style/pages/auth/VerifyOTP.css';

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = authStore();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ. Vui lòng quay lại và nhập lại.');
      setTimeout(() => navigate('/forgot-password'), 3000);
    }
  }, [email, isAuthenticated, navigate]);

  const handleContainerPaste = useCallback((e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{1,6}$/.test(pastedData)) return;

    const digits = pastedData.split('').slice(0, 6);
    const newOtp = ['', '', '', '', '', ''];
    digits.forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);
    setError('');
    setSuccessMessage('');

    const nextEmptyIndex = newOtp.findIndex((val) => val === '');
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  }, []);

  const handleChange = useCallback((index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');
    setSuccessMessage('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [otp]);

  // Xử lý phím Backspace
  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const otpValue = otp.join('');
      if (otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
        setError('Vui lòng nhập mã OTP 6 số');
        inputRefs.current[otp.findIndex((val) => !val) || 0]?.focus();
        return;
      }

      setIsSubmitting(true);
      setError('');
      setSuccessMessage('');

      try {
        await authApi.verifyOtp(email, otpValue);
        navigate('/new-password', { state: { email, otp: otpValue, verified: true } });
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || error.message || 'Mã OTP không chính xác';
        setError(errorMessage);
        console.error('Verify OTP error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [otp, email, navigate]
  );

  const handleResend = useCallback(async () => {
    setIsResending(true);
    setError('');
    setSuccessMessage('');

    try {
      await authApi.forgotPassword(email);
      setSuccessMessage('Mã OTP mới đã được gửi!');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      setError(error.response?.data?.message || 'Không thể gửi lại mã OTP');
      console.error('Resend OTP error:', error);
    } finally {
      setIsResending(false);
    }
  }, [email]);

  if (error && !otp.some((digit) => digit)) {
    return (
      <div className="vo-container">
        <Background />
        <div className="vo-card">
          <a onClick={() => navigate('/forgot-password')} className="vo-back-button" aria-label="Quay lại">
            <IoArrowBackSharp size={20} />
          </a>
          <div className="vo-header">
            <div className="vo-logo">
              <div className="vo-logo-icon">
                <FaBrain size={40} color="#dd797a" />
              </div>
              <span className="vo-logo-text">BrainGame</span>
            </div>
            <h1 className="vo-title">Lỗi</h1>
          </div>
          <div className="vo-error">
            <FaExclamationTriangle size={18} />
            <span>{error}</span>
          </div>
          <p className="vo-subtitle">Chuyển hướng sau 3 giây...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vo-container">
      <Background />
      <div className="vo-card">
        <a onClick={() => navigate('/forgot-password')} className="vo-back-button" aria-label="Quay lại">
          <IoArrowBackSharp size={20} />
        </a>
        <div className="vo-header">
          <div className="vo-logo">
            <div className="vo-logo-icon">
              <FaBrain size={40} color="#dd797a" />
            </div>
            <span className="vo-logo-text">BrainGame</span>
          </div>
          <div className="vo-shield-icon">
            <FaShieldAlt size={60} color="#667eea" />
          </div>
          <h1 className="vo-title">Xác thực OTP</h1>
          <p className="vo-subtitle">
            Nhập mã 6 số đã được gửi đến <strong>{email}</strong>
          </p>
        </div>

        {(error || successMessage) && (
          <div className={`vo-error ${successMessage ? 'vo-success' : ''}`}>
            {successMessage ? (
              <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
            ) : (
              <FaExclamationTriangle size={18} />
            )}
            <span>{successMessage || error}</span>
          </div>
        )}

        <form className="vo-form" onSubmit={handleSubmit}>
          <div
            className="vo-otp-inputs"
            ref={containerRef}
            onPaste={handleContainerPaste}
            tabIndex="0"
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                className={`vo-otp-input ${error ? 'vo-otp-input-error' : ''}`}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isSubmitting || isResending}
              />
            ))}
          </div>

          <button
            className={`vo-submit-button ${isSubmitting ? 'loading' : ''}`}
            type="submit"
            disabled={isSubmitting || isResending}
          >
            {isSubmitting ? (
              <>
                <div className="vo-loading-spinner-container">
                  <div className="vo-loading-spinner"></div>
                </div>
                <span className="vo-button-text">Đang xác thực...</span>
              </>
            ) : (
              <span>Xác thực</span>
            )}
          </button>
        </form>

        <div className="vo-resend-section">
          <span>Không nhận được mã?</span>
          <button
            type="button"
            className={`vo-resend-button ${isResending ? 'loading' : ''}`}
            onClick={handleResend}
            disabled={isSubmitting || isResending}
          >
            {isResending ? 'Đang gửi...' : 'Gửi lại'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;