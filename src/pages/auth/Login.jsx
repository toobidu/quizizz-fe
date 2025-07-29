import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaExclamationCircle, FaExclamationTriangle, FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import authApi from '../../services/authApi.js';
import '../../styles/pages/auth/Login.css';
import { FaBrain } from "react-icons/fa6";
import Decoration from '../../components/Decoration.jsx';
import authStore from '../../stores/authStore.js';

function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    
    const setUser = authStore((state) => state.setUser);
    const setAuthenticated = authStore((state) => state.setAuthenticated);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name] || loginError) {
            setErrors(prev => ({ ...prev, [name]: '' }));
            setLoginError('');
        }
    }

    const validate = () => {
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = 'Vui lòng nhập tên đăng nhập';
        if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        setLoginError('');

        try {
            const res = await authApi.login({
                username: formData.username,
                password: formData.password,
            });

            const accessToken = res.data?.accessToken;
            if (accessToken) {
                try {
                    const payload = JSON.parse(atob(accessToken.split('.')[1]));
                    setUser({
                        username: payload.username || payload.name || payload.sub,
                        ...payload
                    });
                    setAuthenticated(true);
                } catch (error) {
                    setUser(null);
                    setAuthenticated(false);
                }
            }
            navigate('/dashboard');
        } catch (error) {
            setLoginError(error.message || 'Sai tên đăng nhập hoặc mật khẩu');
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (<div className="login-container">
        <Decoration />
        <div className="login-card">
            <div className="login-header">
                <div className="login-logo">
                    <div className="logo-icon">
                        <FaBrain size={40} color="#dd797a" />
                    </div>
                    <span className="logo-text">BrainGame</span>
                </div>
                <h1 className="login-title">Đăng nhập</h1>
            </div>

            {loginError && (<div className="login-error">
                <FaExclamationTriangle size={20} color="#dc2626" />
                <span style={{ marginLeft: '10px' }}>{loginError}</span>
            </div>)}

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
                    {errors.username && (<div className="error-message">
                        <FaExclamationCircle size={16} color="#dc2626" />
                        <span style={{ marginLeft: '8px' }}>{errors.username}</span>
                    </div>)}
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
                            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                            {showPassword ? (<FaEyeSlash size={20} color="#718096" />) : (
                                <FaEye size={20} color="#718096" />)}
                        </button>
                    </div>
                    <div className="forgot-password">
                        <Link to="/forgot-password">Quên mật khẩu?</Link>
                    </div>
                    {errors.password && (<div className="error-message">
                        <FaExclamationCircle size={16} color="#dc2626" />
                        <span style={{ marginLeft: '8px' }}>{errors.password}</span>
                    </div>)}
                </div>

                <button
                    className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (<>
                        <div className="loading-spinner-container">
                            <div className="loading-spinner"></div>
                        </div>
                        <span className="button-text">Đang đăng nhập...</span>
                    </>) : (<span>Đăng nhập</span>)}
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
    </div>);
}

export default Login;
