import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/Welcome.css';
import Decoration from '../components/Decoration';
import authStore from '../stores/authStore';

function Welcome() {
    const navigate = useNavigate();
    const buttonGroupRef = useRef(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const isAuthenticated = authStore((state) => state.isAuthenticated);
    const isLoading = authStore((state) => state.isLoading);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                await authStore.getState().initialize();
            } catch (error) {
            } finally {
                setIsInitialized(true);
            }
        };

        initializeAuth();
    }, []);

    // Redirect based on role if user is authenticated
    useEffect(() => {
        if (isInitialized && isAuthenticated && !isLoading) {
            const user = authStore.getState().user;
            let redirectPath = '/dashboard';
            if (user?.role === 'ADMIN') redirectPath = '/admin/dashboard';
            else if (user?.role === 'TEACHER') redirectPath = '/teacher/dashboard';
            else if (user?.role === 'PLAYER') redirectPath = '/dashboard';
            navigate(redirectPath, { replace: true });
        }
    }, [isInitialized, isAuthenticated, isLoading, navigate]);

    // Show loading while initializing
    if (!isInitialized || isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '1.2rem',
                color: '#666'
            }}>
                Đang tải...
            </div>
        );
    }

    return (<div className="wp-welcome-page-container">
        {/* Hero Section */}
        <div className="wp-hero-section" id="hero" ref={buttonGroupRef}>
            <div className="wp-hero-content">
                <div className="wp-logo-container">
                    <div className="wp-logo">BrainGame</div>
                    <div className="wp-logo-tagline">Rèn luyện não bộ thông minh</div>
                </div>

                <div className="wp-hero-text">
                    <h1 className="wp-title">Phát triển trí tuệ cùng BrainGame</h1>
                    <p className="wp-subtitle">
                        Nâng cao khả năng tư duy, cải thiện trí nhớ và rèn luyện não bộ mỗi ngày với các bài tập thú
                        vị và hiệu quả
                    </p>
                </div>

                <div className="wp-button-group">
                    <button className="wp-btn primary" onClick={() => navigate('/login')}>Đăng nhập ngay</button>
                    <button className="wp-btn secondary" onClick={() => navigate('/register')}>Tạo tài khoản
                    </button>
                </div>
            </div>

            <Decoration />
        </div>

        {/* Features Section */}
        <div className="wp-features-section">
            <div className="wp-section-header">
                <h2 className="wp-section-title">Tại sao chọn BrainGame?</h2>
                <p className="wp-section-subtitle">
                    Khám phá những tính năng độc đáo giúp bạn phát triển tối đa tiềm năng
                </p>
            </div>

            <div className="wp-features-grid">
                <div className="wp-feature-card">
                    <div className="wp-feature-icon-wrapper">
                        <div className="wp-feature-icon"></div>
                    </div>
                    <h3 className="wp-feature-title">Rèn luyện trí não</h3>
                    <p className="wp-feature-text">
                        Các bài tập được thiết kế khoa học giúp phát triển tư duy logic và khả năng tập trung.
                    </p>
                </div>
                <div className="wp-feature-card">
                    <div className="wp-feature-icon-wrapper">
                        <div className="wp-feature-icon"></div>
                    </div>
                    <h3 className="wp-feature-title">Theo dõi tiến độ</h3>
                    <p className="wp-feature-text">
                        Hệ thống thống kê chi tiết giúp bạn theo dõi sự tiến bộ của bản thân.
                    </p>
                </div>
                <div className="wp-feature-card">
                    <div className="wp-feature-icon-wrapper">
                        <div className="wp-feature-icon"></div>
                    </div>
                    <h3 className="wp-feature-title">Đa dạng thử thách</h3>
                    <p className="wp-feature-text">
                        Nhiều thể loại game hấp dẫn, phù hợp với mọi lứa tuổi và trình độ.
                    </p>
                </div>
            </div>
        </div>

        {/* CTA Section */}
        <div className="wp-cta-section">
            <div className="wp-cta-content">
                <h2 className="wp-cta-title">Sẵn sàng bắt đầu hành trình?</h2>
                <p className="wp-cta-subtitle">Tham gia cùng hàng ngàn người dùng đã cải thiện khả năng tư duy</p>
                <button
                    className="wp-btn primary wp-cta-button"
                    onClick={() => buttonGroupRef.current?.scrollIntoView({ behavior: 'smooth' })}
                >
                    Bắt đầu ngay
                </button>

            </div>
        </div>
    </div>);
}

export default Welcome;
