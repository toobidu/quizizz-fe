import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaExclamationCircle, FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import authApi from '../../services/authApi.js';
import '../../styles/pages/auth/Login.css';
import { FaBrain } from "react-icons/fa6";
import Decoration from '../../components/Decoration.jsx';
import Toast from '../../components/Toast.jsx';
import authStore from '../../stores/authStore.js';

function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const isAuthenticated = authStore((state) => state.isAuthenticated);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const validateForm = useCallback(() => {
        const newErrors = {};
        const username = formData.username.trim();
        const password = formData.password;

        if (!username) {
            newErrors.username = 'Vui lòng nhập tên đăng nhập';
        } else if (username.length < 3) {
            newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
        }

        if (!password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: '' }));
    }, []);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (!validateForm()) {
                return;
            }

            setIsSubmitting(true);

            try {
                await authApi.login({
                    username: formData.username,
                    password: formData.password,
                });
                setToast({ type: 'success', message: 'Đăng nhập thành công!' });
                setTimeout(() => navigate('/dashboard', { replace: true }), 1000);
            } catch (error) {
                const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
                setToast({ type: 'error', message: errorMessage });
            } finally {
                setIsSubmitting(false);
            }
        },
        [formData, validateForm, navigate]
    );

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword((prev) => !prev);
    }, []);

    return (
        <div className="login-container">
            <Decoration />
            {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">
                        <FaBrain size={40} color="#dd797a" />
                        <span className="logo-text">BrainGame</span>
                    </div>
                    <h1 className="login-title">Đăng nhập</h1>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="login-label" htmlFor="username">
                            <FaUser size={16} color="#667eea" />
                            Tên đăng nhập
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                id="username"
                                name="username"
                                className={`input ${errors.username ? 'input-error' : ''}`}
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Nhập tên đăng nhập hoặc email"
                                disabled={isSubmitting}
                                autoComplete="username"
                            />
                        </div>
                        {errors.username && (
                            <div className="error-message">
                                <FaExclamationCircle size={16} color="#dc2626" />
                                <span className="error-text">{errors.username}</span>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="login-label" htmlFor="password">
                            <FaLock size={16} color="#667eea" />
                            Mật khẩu
                        </label>
                        <div className="input-wrapper password-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                className={`input ${errors.password ? 'input-error' : ''}`}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu"
                                disabled={isSubmitting}
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                                disabled={isSubmitting}
                                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                            >
                                {showPassword ? (
                                    <FaEyeSlash size={20} color="#718096" />
                                ) : (
                                    <FaEye size={20} color="#718096" />
                                )}
                            </button>
                        </div>
                        <div className="forgot-password">
                            <Link to="/forgot-password">Quên mật khẩu?</Link>
                        </div>
                        {errors.password && (
                            <div className="error-message">
                                <FaExclamationCircle size={16} color="#dc2626" />
                                <span className="error-text">{errors.password}</span>
                            </div>
                        )}
                    </div>

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
                                <span className="button-text">Đang đăng nhập...</span>
                            </>
                        ) : (
                            <span>Đăng nhập</span>
                        )}
                    </button>
                </form>

                <div className="divider">
                    <span>hoặc</span>
                </div>

                <div className="register-link">
                    <span>Chưa có tài khoản? </span>
                    <Link to="/register">Đăng ký ngay</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;