import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import { IoArrowBackSharp } from 'react-icons/io5';
import { FaBrain } from 'react-icons/fa6';
import { ImSpinner8 } from 'react-icons/im';
import authStore from '../../stores/authStore';
import Background from '../../components/Background';
import '../../style/pages/auth/VerifyEmail.css';

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = authStore();
  const email = location.state?.email || '';
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Email không hợp lệ. Vui lòng quay lại và nhập lại.');
      setTimeout(() => navigate('/forgot-password'), 3000);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 3.33; 
      });
    }, 100);

    const timer = setTimeout(() => {
      navigate('/verify-otp', { state: { email } });
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [email, isAuthenticated, navigate]);

  const handleBack = useCallback(() => {
    navigate('/forgot-password');
  }, [navigate]);

  if (error) {
    return (
      <div className="verify-email-container">
        <Background />
        <div className="verify-email-card">
          <a onClick={handleBack} className="back-button" aria-label="Quay lại">
            <IoArrowBackSharp size={20} />
          </a>
          <div className="verify-email-header">
            <div className="verify-email-logo">
              <div className="logo-icon">
                <FaBrain size={40} color="#dd797a" />
              </div>
              <span className="logo-text">BrainGame</span>
            </div>
            <h1 className="verify-email-title">Lỗi</h1>
          </div>
          <div className="loading-content">
            <p className="loading-text">{error}</p>
            <p className="loading-subtext">Chuyển hướng sau 3 giây...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="verify-email-container">
      <Background />
      <div className="verify-email-card">
        <a onClick={handleBack} className="back-button" aria-label="Quay lại">
          <IoArrowBackSharp size={20} />
        </a>
        <div className="verify-email-header">
          <div className="verify-email-logo">
            <div className="logo-icon">
              <FaBrain size={40} color="#dd797a" />
            </div>
            <span className="logo-text">BrainGame</span>
          </div>
          <div className="email-icon">
            <FaEnvelope size={60} color="#667eea" />
          </div>
          <h1 className="verify-email-title">Đang gửi mã xác thực</h1>
        </div>
        <div className="loading-content">
          <div className="loading-spinner-wrapper">
            <ImSpinner8 size={40} className="loading-spinner-large" />
          </div>
          <p className="loading-text">
            Hệ thống đang gửi mã OTP về email <strong>{email}</strong>
          </p>
          <p className="loading-subtext">Vui lòng kiểm tra hộp thư của bạn...</p>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;