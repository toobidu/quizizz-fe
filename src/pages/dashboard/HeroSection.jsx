import { useNavigate } from 'react-router-dom';
import { FiAward, FiTrendingUp, FiZap } from 'react-icons/fi';
import { GiBrain } from 'react-icons/gi';
import { FaStar } from 'react-icons/fa';
import { GoGoal } from 'react-icons/go';
import WelcomeMessage from '../../contexts/data/WelcomeMessage.jsx';
import '../../styles/pages/dashboard/HeroSection.css';

function HeroSection({ userName, stats }) {
    const navigate = useNavigate();

    return (
        <div className="dh-hero-section">
            <div className="dh-hero-content">
                <div className="dh-hero-left">
                    <h1 className="dh-hero-title">Xin chào, {userName}!</h1>
                    <div className="dh-hero-subtitle">
                        <WelcomeMessage userName={userName} />
                    </div>
                    <div className="dh-hero-actions">
                        <button
                            className="dh-hero-button primary"
                            onClick={() => navigate('/rooms')}
                        >
                            <FiZap /> Bắt đầu ngay
                        </button>
                        <button
                            className="dh-hero-button secondary"
                            onClick={() => navigate('/leaderboard')}
                        >
                            <FiTrendingUp /> Xem xếp hạng
                        </button>
                    </div>
                    <div className="dh-hero-stats" style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
                        <div className="dh-hero-stat-item">
                            <FaStar style={{ marginRight: 6 }} /> <span>{stats?.points ?? 0}</span> <span>Điểm</span>
                        </div>
                        <div className="dh-hero-stat-item">
                            <GoGoal style={{ marginRight: 6 }} /> <span>{stats?.streak ?? 0}</span> <span>Ngày liên tiếp</span>
                        </div>
                    </div>
                </div>
                <div className="dh-hero-right">
                    <div className="dh-hero-decoration">
                        <div className="dh-brain-icon-container">
                            <GiBrain className="dh-brain-icon-main" />
                        </div>
                    </div>
                    <div className="dh-hero-badge">
                        <FiAward className="dh-badge-icon" />
                        <span>Top {stats?.rank ?? '100'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeroSection;