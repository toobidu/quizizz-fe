import { useNavigate } from 'react-router-dom';
import authStore from '../../stores/authStore';
import '../../styles/pages/dashboard/QuickActionsSection.css';

const quickActions = [
    { title: 'Chơi ngay', desc: 'Bắt đầu trò chơi mới', action: (navigate) => navigate('/games') },
    { title: 'Xem bảng xếp hạng', desc: 'Top người chơi', action: (navigate) => navigate('/leaderboard') },
    { title: 'Hồ sơ cá nhân', desc: 'Xem thống kê của bạn', action: (navigate) => navigate('/profile') },
];

function QuickActionsSection({ onLogout }) {
    const navigate = useNavigate();
    const { user } = authStore();

    if (!user) {
        return <div className="qa-actions-section">Vui lòng đăng nhập để tiếp tục.</div>;
    }

    return (
        <div className="qa-actions-section">
            <h2 className="qa-section-title">Hành động nhanh</h2>
            <div className="qa-actions-grid">
                {quickActions.map((action, index) => (
                    <button
                        key={index}
                        className="qa-action-card"
                        onClick={() => action.action(navigate)}
                    >
                        <h3>{action.title}</h3>
                        <p>{action.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default QuickActionsSection;