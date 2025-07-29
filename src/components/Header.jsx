import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiSettings, FiUser } from 'react-icons/fi';
import '../styles/components/Header.css';
import ThemeToggle from './ThemeToggle';
import authStore from '../stores/authStore';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const user = authStore((state) => state.user);
    const isAuthenticated = authStore((state) => state.isAuthenticated);
    const isLoading = authStore((state) => state.isLoading);
    const error = authStore((state) => state.error);
    const logout = authStore((state) => state.logout);

    const actualUserName = user?.username || 'Khách';
    const userInitial = actualUserName.length > 0 ? actualUserName.charAt(0).toUpperCase() : '';

    useEffect(() => {
        authStore.getState().initialize();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMenuOpen && !e.target.closest('.hd-user-menu')) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const handleProfileClick = () => {
        navigate('/profile');
        setIsMenuOpen(false);
    };

    const handleProtectedLink = (path) => {
        if (isAuthenticated) {
            navigate(path);
        } else {
            navigate('/login');
        }
    };

    const homePath = isAuthenticated ? '/dashboard' : '/';
    const gamesPath = isAuthenticated ? '/games' : '/login';
    const leaderboardPath = isAuthenticated ? '/leaderboard' : '/login';

    return (
        <header className="hd-header">
            <div className="hd-header-content">
                <div className="hd-header-left">
                    <Link to={homePath} className="hd-logo">
                        BrainGame
                    </Link>
                </div>

                <div className="hd-header-center"></div>

                <nav className="hd-nav">
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
                                    <div className="hd-avatar">{userInitial}</div>
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
                                        onClick={logout}
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
                <ThemeToggle />
            </div>

            {error && (
                <div className="hd-error-message">
                    {error}
                </div>
            )}
        </header>
    );
}

export default Header;