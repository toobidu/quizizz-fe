import { FiTarget, FiUsers, FiTrendingUp, FiAward } from 'react-icons/fi';
import { FaRunning, FaTrophy } from "react-icons/fa";

const ProfileStats = ({ profileData }) => {
    return (
        <>
            {/* Stats Section */}
            <div className="pf-stats-section">
                <h2 className="pf-section-title">
                    <FiTarget className="pf-section-icon" />
                    Thống kê
                </h2>
                <div className="pf-stats-grid">
                    <div className="pf-stat-card">
                        <FiAward className="pf-stat-icon" />
                        <div className="pf-stat-value">{profileData.highestScore || 0}</div>
                        <div className="pf-stat-label">Điểm cao nhất</div>
                    </div>
                    <div className="pf-stat-card">
                        <FiUsers className="pf-stat-icon" />
                        <div className="pf-stat-value">#{profileData.highestRank || 'N/A'}</div>
                        <div className="pf-stat-label">Xếp hạng cao nhất</div>
                    </div>
                    <div className="pf-stat-card">
                        <FiTrendingUp className="pf-stat-icon" />
                        <div className="pf-stat-value">{profileData.fastestTime || 'N/A'}</div>
                        <div className="pf-stat-label">Thời gian nhanh nhất</div>
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="pf-stats">
                <div className="pf-stat-card">
                    <FiTarget className="pf-stat-icon" />
                    <div className="pf-stat-value">{profileData?.highestScore?.toLocaleString() || 0}</div>
                    <div className="pf-stat-label">Điểm cao nhất</div>
                </div>
                <div className="pf-stat-card">
                    <FiUsers className="pf-stat-icon" />
                    <div className="pf-stat-value">#{profileData?.highestRank || 'N/A'}</div>
                    <div className="pf-stat-label">Xếp hạng cao nhất</div>
                </div>
                <div className="pf-stat-card">
                    <FiUsers className="pf-stat-icon" />
                    <div className="pf-stat-value">{profileData?.fastestTime || 'N/A'}</div>
                    <div className="pf-stat-label">Thời gian nhanh nhất</div>
                </div>
                <div className="pf-stat-card">
                    <FaRunning className="pf-stat-icon" />
                    <div className="pf-stat-value">{profileData?.bestTopic || 'N/A'}</div>
                    <div className="pf-stat-label">Chủ đề tốt nhất</div>
                </div>
            </div>

            {/* Achievements Section */}
            <div className="pf-achievements-section">
                <h2>Thành tích</h2>
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
                                <h3>{achievement.name}</h3>
                                <p>{achievement.desc}</p>
                            </div>
                        ))
                    ) : (
                        <div className="pf-no-achievements">
                            <p>Chưa có thành tích nào</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProfileStats;