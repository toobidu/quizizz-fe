import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaExclamationCircle, FaExclamationTriangle, FaHome, FaLock, FaPhoneAlt, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { FaBrain } from 'react-icons/fa6';
import authApi from '../../services/authApi.js';
import authStore from '../../stores/authStore.js';
import Decoration from '../../components/Decoration.jsx';
import '../../styles/pages/auth/Register.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    dob: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ success: false, message: '' });
  const firstErrorInputRef = useRef(null);
  const { isAuthenticated } = authStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSubmitStatus({ success: false, message: '' });
  }, []);

  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Vui lòng nhập tên người dùng';
        if (value.length < 3) return 'Tên người dùng phải có ít nhất 3 ký tự';
        return '';
      case 'fullName':
        if (!value.trim()) return 'Vui lòng nhập họ tên';
        return '';
      case 'email':
        if (!value) return 'Vui lòng nhập email';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email không hợp lệ';
        return '';
      case 'phoneNumber':
        if (!value.trim()) return 'Vui lòng nhập số điện thoại';
        if (!/^\d{10}$/.test(value)) return 'Số điện thoại phải có 10 chữ số';
        return '';
      case 'address':
        if (!value.trim()) return 'Vui lòng nhập địa chỉ';
        return '';
      case 'dob':
        if (!value) return 'Vui lòng nhập ngày sinh';
        const birthDate = new Date(value);
        const today = new Date();
        if (birthDate > today) return 'Ngày sinh không thể ở tương lai';
        return '';
      case 'password':
        if (!value) return 'Vui lòng nhập mật khẩu';
        if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
        return '';
      case 'confirmPassword':
        if (value !== formData.password) return 'Mật khẩu không khớp';
        return '';
      default:
        return '';
    }
  }, [formData.password]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  useEffect(() => {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      firstErrorInputRef.current = document.getElementById(firstErrorKey);
      firstErrorInputRef.current?.focus();
    }
  }, [errors]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) {
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey) {
          firstErrorInputRef.current = document.getElementById(firstErrorKey);
          firstErrorInputRef.current?.focus();
        }
        return;
      }

      setIsSubmitting(true);
      setSubmitStatus({ success: false, message: '' });

      try {
        await authApi.register({
          username: formData.username,
          full_name: formData.fullName,
          email: formData.email,
          phone_number: formData.phoneNumber,
          address: formData.address,
          password: formData.password,
          confirm_password: formData.confirmPassword,
        });

        setSubmitStatus({ success: true, message: 'Đăng ký thành công! Chuyển hướng sau 3 giây...' });
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
        if (error.response?.status === 400) {
          const newErrors = {};
          if (error.response?.data?.field === 'email') {
            newErrors.email = 'Email đã tồn tại';
            firstErrorInputRef.current = document.getElementById('email');
          } else if (error.response?.data?.field === 'username') {
            newErrors.username = 'Tên người dùng đã tồn tại';
            firstErrorInputRef.current = document.getElementById('username');
          } else {
            setSubmitStatus({ success: false, message: errorMessage });
          }
          setErrors((prev) => ({ ...prev, ...newErrors }));
          firstErrorInputRef.current?.focus();
        } else {
          setSubmitStatus({ success: false, message: errorMessage });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, navigate]
  );

  return (
    <div className="register-container">
      <Decoration />
      <div className="register-card">
        <div className="register-header">
          <div className="register-logo">
            <div className="logo-icon">
              <FaBrain size={40} color="#dd797a" />
            </div>
            <span className="logo-text">BrainGame</span>
          </div>
          <h1 className="register-title">Đăng ký</h1>
        </div>

        {submitStatus.message && (
          <div className={`register-error ${submitStatus.success ? 'register-success' : ''}`}>
            {submitStatus.success ? (
              <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span>
            ) : (
              <FaExclamationTriangle size={20} color="#dc2626" />
            )}
            <span>{submitStatus.message}</span>
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          {[
            { name: 'username', label: 'Tên người dùng', icon: FaUser, type: 'text', placeholder: 'Nhập tên người dùng' },
            { name: 'fullName', label: 'Họ tên', icon: FaUser, type: 'text', placeholder: 'Nhập họ tên' },
            { name: 'email', label: 'Email', icon: FaEnvelope, type: 'email', placeholder: 'example@email.com' },
            { name: 'phoneNumber', label: 'Số điện thoại', icon: FaPhoneAlt, type: 'tel', placeholder: 'Nhập số điện thoại (10 chữ số)' },
            { name: 'address', label: 'Địa chỉ', icon: FaHome, type: 'text', placeholder: 'Nhập địa chỉ' },
            { name: 'dob', label: 'Ngày sinh', icon: FaCalendarAlt, type: 'date', placeholder: 'Chọn ngày sinh' },
            { name: 'password', label: 'Mật khẩu', icon: FaLock, type: 'password', placeholder: 'Nhập mật khẩu' },
            { name: 'confirmPassword', label: 'Xác nhận mật khẩu', icon: FaLock, type: 'password', placeholder: 'Nhập lại mật khẩu' },
          ].map(({ name, label, icon: Icon, type, placeholder }) => (
            <div className="form-group" key={name}>
              <label className="register-label" htmlFor={name}>
                <Icon size={16} color="#667eea" />
                {label}
              </label>
              <input
                type={type}
                id={name}
                name={name}
                className={`input ${errors[name] ? 'input-error' : ''}`}
                value={formData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={isSubmitting}
                autoComplete={name.includes('password') ? name : 'off'}
              />
              {errors[name] && (
                <div className="error-message">
                  <FaExclamationCircle size={16} color="#dc2626" />
                  {errors[name]}
                </div>
              )}
            </div>
          ))}

          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="loading-spinner"></div>
                Đang đăng ký...
              </>
            ) : (
              <>Đăng ký</>
            )}
          </button>
        </form>

        <div className="divider">
          <span>hoặc</span>
        </div>

        <div className="login-link">
          <span>Đã có tài khoản?</span>
          <Link to="/login">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;