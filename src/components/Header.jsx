import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiSettings, FiUser, FiMenu, FiX } from 'react-icons/fi';
import '../styles/components/Header.css';
import ThemeToggle from './ThemeToggle';
import authStore from '../stores/authStore';
import authApi from '../services/authApi';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const navigate = useNavigate();

    const user = authStore((state) => state.user);
    const isAuthenticated = authStore((state) => state.isAuthenticated);
    const isLoading = authStore((state) => state.isLoading);
    const error = authStore((state) => state.error);
    const logout = authStore((state) => state.logout);

    // Function to fetch fresh avatar
    const fetchFreshAvatar = async () => {
        try {
            setAvatarLoading(true);
            const response = await authApi.getAvatar();

            if (response.isSuccess && response.data) {
                setAvatarUrl(response.data);
            } else {
                // Try to use data anyway if HTTP status is 200
                if (response.status === 200 && response.data) {
                    // Validate URL format before using
                    try {
                        new URL(response.data);
                        setAvatarUrl(response.data);
                    } catch (urlError) {
                        setAvatarUrl(null);
                    }
                } else {
                    setAvatarUrl(null);
                }
            }
        } catch (error) {
            setAvatarUrl(null);
        } finally {
            setAvatarLoading(false);
        }
    };

    // Handle logout with navigation
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/'); // Redirect to home page after logout
        } catch (error) {
            // Still navigate to home even if logout API fails
            navigate('/');
        }
    };

    // Listen for avatar update events from Profile page
    useEffect(() => {
        const handleAvatarUpdate = () => {
            if (isAuthenticated && user) {
                fetchFreshAvatar();
            }
        };

        window.addEventListener('avatarUpdated', handleAvatarUpdate);

        return () => {
            window.removeEventListener('avatarUpdated', handleAvatarUpdate);
        };
    }, [isAuthenticated, user]);

    // Initialize auth store
    useEffect(() => {
        authStore.getState().initialize();
    }, []);

    // Auto-refresh avatar every 45 minutes to prevent expiration
    useEffect(() => {
        if (!isAuthenticated || !user?.avatarURL) return;

        const refreshAvatar = async () => {
            try {
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
                    }
                }
            } catch (error) {
            }
        };

        // chạy lần đầu để chắc chắn sync avatar
        refreshAvatar();

        const refreshInterval = setInterval(refreshAvatar, 45 * 60 * 1000); // 45 phút

        return () => clearInterval(refreshInterval);
    }, [isAuthenticated, user?.avatarURL]);


    const actualUserName = user?.username || 'Khách';
    const userInitial = actualUserName.length > 0 ? actualUserName.charAt(0).toUpperCase() : '';

    useEffect(() => {
        const handleClickOutside = (e) => {
            if ((isMenuOpen && !e.target.closest('.hd-user-menu')) ||
                (isMobileMenuOpen && !e.target.closest('.hd-mobile-menu-container'))) {
                setIsMenuOpen(false);
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen, isMobileMenuOpen]);

    // Get avatar from user profile data
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.avatarURL) {
                // Check if URL is expired (simple check based on timestamp)
                try {
                    const url = new URL(user.avatarURL);
                    const dateParam = url.searchParams.get('X-Amz-Date');
                    if (dateParam) {
                        const urlDate = new Date(dateParam.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, '$1-$2-$3T$4:$5:$6Z'));
                        const now = new Date();
                        const diffMinutes = (now - urlDate) / (1000 * 60); // Check in minutes

                        if (diffMinutes > 50) { // If URL is older than 50 minutes (buffer for 1 hour expiry)
                            fetchFreshAvatar();
                        }
                    } else {
                        // No date param, assume it's valid for now
                        setAvatarUrl(user.avatarURL);
                        setAvatarLoading(false);
                    }
                } catch (error) {
                    // Invalid URL, fetch a fresh one
                    fetchFreshAvatar();
                }
            } else {
                fetchFreshAvatar();
            }
        } else {
            setAvatarUrl(null);
            setAvatarLoading(false);
        }
    }, [isAuthenticated, user]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setIsMenuOpen(false);
    };

    const isTeacher = user?.role === 'TEACHER';
    const homePath = isAuthenticated ? (isTeacher ? '/teacher/dashboard' : '/dashboard') : '/';
    const gamesPath = isAuthenticated ? '/games' : '/login';
    const leaderboardPath = isAuthenticated ? '/leaderboard' : '/login';

    return (
        <header className="hd-header">
            <div className="hd-header-content">
                <div className="hd-header-left">
                    <Link to={homePath} className="hd-logo" onClick={closeMobileMenu}>
                        BrainGame
                    </Link>
                </div>

                <div className="hd-header-center"></div>

                {/* Desktop Navigation */}
                <nav className="hd-nav hd-nav-desktop">
                    <Link to={homePath} className={`hd-nav-link ${isLoading ? 'disabled' : ''}`}>
                        Trang chủ
                    </Link>
                    <Link to={gamesPath} className={`hd-nav-link ${isLoading ? 'disabled' : ''}`}>
                        Trò chơi
                    </Link>
                    <Link to={leaderboardPath} className={`hd-nav-link ${isLoading ? 'disabled' : ''}`}>
                        Bảng xếp hạng
                    </Link>

                    <div className="hd-header-actions">
                        {isAuthenticated ? (
                            <div className="hd-user-menu">
                                <button
                                    className="hd-user-button"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    disabled={isLoading}
                                >
                                    <div className="hd-avatar">
                                        {avatarUrl ? (
                                            <>
                                                <img
                                                    src={avatarUrl}
                                                    alt={`${actualUserName}'s avatar`}
                                                    className="hd-avatar-image"
                                                    crossOrigin="anonymous"
                                                    onError={() => {
                                                        setAvatarUrl(null);
                                                    }}
                                                />
                                            </>
                                        ) : avatarLoading ? (
                                            <>
                                                <div className="hd-avatar-loading">...</div>
                                            </>
                                        ) : (
                                            <>
                                                {userInitial}
                                            </>
                                        )}
                                    </div>
                                </button>

                                <div className={`hd-dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
                                    <button className="hd-dropdown-item" onClick={handleProfileClick}>
                                        <FiUser /> Hồ sơ cá nhân
                                    </button>
                                    <button
                                        className="hd-dropdown-item"
                                        onClick={() => navigate('/settings')}
                                    >
                                        <FiSettings /> Cài đặt
                                    </button>
                                    <div className="hd-dropdown-divider"></div>
                                    <button
                                        className="hd-dropdown-item logout"
                                        onClick={handleLogout}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Đang đăng xuất...' : <><FiLogOut /> Đăng xuất</>}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="hd-auth-buttons">
                                <Link to="/login" className="hd-nav-link">
                                    Đăng nhập
                                </Link>
                                <Link to="/register" className="hd-nav-link">
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="hd-mobile-menu-toggle touch-target"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle mobile menu"
                >
                    {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>

                <ThemeToggle />
            </div>

            {/* Mobile Navigation Menu */}
            <div className={`hd-mobile-menu-container ${isMobileMenuOpen ? 'open' : ''}`}>
                <nav className="hd-nav hd-nav-mobile container-mobile">
                    <Link to={homePath} className={`hd-nav-link touch-target ${isLoading ? 'disabled' : ''}`} onClick={closeMobileMenu}>
                        Trang chủ
                    </Link>
                    <Link to={gamesPath} className={`hd-nav-link touch-target ${isLoading ? 'disabled' : ''}`} onClick={closeMobileMenu}>
                        Trò chơi
                    </Link>
                    <Link to={leaderboardPath} className={`hd-nav-link touch-target ${isLoading ? 'disabled' : ''}`} onClick={closeMobileMenu}>
                        Bảng xếp hạng
                    </Link>

                    <div className="hd-mobile-menu-divider"></div>

                    {isAuthenticated ? (
                        <div className="hd-mobile-user-section">
                            <div className="hd-mobile-user-info">
                                <div className="hd-avatar hd-avatar-mobile">
                                    {avatarUrl ? (
                                        <>
                                            <img
                                                src={avatarUrl}
                                                alt={`${actualUserName}'s avatar`}
                                                className="hd-avatar-image"
                                                crossOrigin="anonymous"
                                                onError={() => {
                                                    setAvatarUrl(null);
                                                }}
                                            />
                                        </>
                                    ) : avatarLoading ? (
                                        <>
                                            <div className="hd-avatar-loading">...</div>
                                        </>
                                    ) : (
                                        <>
                                            {userInitial}
                                        </>
                                    )}
                                </div>
                                <span className="hd-mobile-username">{actualUserName}</span>
                            </div>
                            <button className="hd-mobile-menu-item touch-target" onClick={() => { handleProfileClick(); closeMobileMenu(); }}>
                                <FiUser /> Hồ sơ cá nhân
                            </button>
                            <button className="hd-mobile-menu-item touch-target" onClick={() => { navigate('/settings'); closeMobileMenu(); }}>
                                <FiSettings /> Cài đặt
                            </button>
                            <button
                                className="hd-mobile-menu-item hd-logout-mobile touch-target"
                                onClick={() => { handleLogout(); closeMobileMenu(); }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang đăng xuất...' : <><FiLogOut /> Đăng xuất</>}
                            </button>
                        </div>
                    ) : (
                        <div className="hd-mobile-auth-section">
                            <Link to="/login" className="hd-mobile-menu-item touch-target" onClick={closeMobileMenu}>
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="hd-mobile-menu-item hd-register-mobile touch-target" onClick={closeMobileMenu}>
                                Đăng ký
                            </Link>
                        </div>
                    )}
                </nav>
            </div>

            {error && isAuthenticated && !error.includes('Invalid token specified') && (
                <div className="hd-error-message">
                    {error}
                </div>
            )}
        </header>
    );
}

export default Header;