import { FiTarget, FiUsers, FiTrendingUp, FiAward } from 'react-icons/fi';
import { FaRunning, FaTrophy } from 'react-icons/fa';
import '../../styles/components/profile/ProfileStats.css';

const ProfileStats = ({ profileData }) => {
    return (
        <>
            {/* Main Stats Section */}
            <div className="pf-stats-section">
                <h2 className="pf-section-title">
                    <FiTarget className="pf-section-icon" />
                    Thống kê & Thành tích
                </h2>

                {/* Stats Grid */}
                <div className="pf-stats-grid">
                    <div className="pf-stat-card pf-stat-primary">
                        <FiAward className="pf-stat-icon" />
                        <div className="pf-stat-value">{profileData?.highestScore?.toLocaleString() || 0}</div>
                        <div className="pf-stat-label">Điểm cao nhất</div>
                    </div>
                    <div className="pf-stat-card pf-stat-secondary">
                        <FiUsers className="pf-stat-icon" />
                        <div className="pf-stat-value">#{profileData?.highestRank || 'N/A'}</div>
                        <div className="pf-stat-label">Xếp hạng cao nhất</div>
                    </div>
                    <div className="pf-stat-card pf-stat-accent">
                        <FiTrendingUp className="pf-stat-icon" />
                        <div className="pf-stat-value">{profileData?.fastestTime || 'N/A'}</div>
                        <div className="pf-stat-label">Thời gian nhanh nhất</div>
                    </div>
                    <div className="pf-stat-card pf-stat-info">
                        <FaRunning className="pf-stat-icon" />
                        <div className="pf-stat-value">{profileData?.bestTopic || 'N/A'}</div>
                        <div className="pf-stat-label">Chủ đề tốt nhất</div>
                    </div>
                </div>

                {/* Achievements Section */}
                <div className="pf-achievements-container">
                    <h3 className="pf-achievements-title">
                        <FaTrophy className="pf-section-icon" />
                        Thành tích
                    </h3>
                    <div className="pf-achievements-grid">
                        {profileData?.achievements?.length > 0 ? (
                            profileData.achievements.map((achievement, index) => (
                                <div
                                    key={index}
                                    className={`pf-achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
                                >
                                    <div className="pf-achievement-icon">
                                        <FaTrophy />
                                    </div>
                                    <h4>{achievement.name}</h4>
                                    <p>{achievement.description || achievement.desc}</p>
                                </div>
                            ))
                        ) : (
                            <div className="pf-no-achievements">
                                <FaTrophy className="pf-empty-icon" />
                                <p>Chưa có thành tích nào</p>
                                <span className="pf-empty-subtitle">Hãy tham gia các bài quiz để đạt được thành tích!</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileStats;