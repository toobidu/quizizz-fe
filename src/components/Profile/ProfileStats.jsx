import { FiTarget, FiUsers, FiTrendingUp, FiAward, FiClock } from 'react-icons/fi';
import { FaRunning, FaTrophy } from 'react-icons/fa';
import '../../styles/components/profile/ProfileStats.css';
import '../../styles/components/profile/ProfileStatsLoading.css';
import { useStats, useAchievements } from '../../hooks/useStats';
import { formatScore, formatRank, formatTime } from '../../utils/statsUtils';

const ProfileStats = ({ profileData }) => {
    const { stats, loading: statsLoading, error: statsError } = useStats('profile');
    const { achievements, loading: achievementsLoading } = useAchievements();

    console.log('[ProfileStats] stats:', stats);
    console.log('[ProfileStats] statsLoading:', statsLoading);
    console.log('[ProfileStats] statsError:', statsError);
    
    const displayStats = stats || {};
    console.log('[ProfileStats] displayStats:', displayStats);

    return (
        <>
            {/* Main Stats Section */}
            <div className="pf-stats-section">
                <h2 className="pf-section-title">
                    <FiTarget className="pf-section-icon" />
                    Thống kê & Thành tích
                </h2>

                {statsLoading ? (
                    <div className="pf-stats-loading">Đang tải thống kê...</div>
                ) : statsError ? (
                    <div className="pf-stats-error">
                        <p>Lỗi: {statsError}</p>
                        <p>Kiểm tra console để biết chi tiết</p>
                    </div>
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="pf-stats-grid">
                            <div className="pf-stat-card pf-stat-primary">
                                <FiAward className="pf-stat-icon" />
                                <div className="pf-stat-value">{formatScore(displayStats.highestScore)}</div>
                                <div className="pf-stat-label">Điểm cao nhất</div>
                            </div>
                            <div className="pf-stat-card pf-stat-secondary">
                                <FiUsers className="pf-stat-icon" />
                                <div className="pf-stat-value">{formatRank(displayStats.highestRank)}</div>
                                <div className="pf-stat-label">Xếp hạng cao nhất</div>
                            </div>
                            <div className="pf-stat-card pf-stat-accent">
                                <FiClock className="pf-stat-icon" />
                                <div className="pf-stat-value">{formatTime(displayStats.fastestTime)}</div>
                                <div className="pf-stat-label">Thời gian nhanh nhất</div>
                            </div>
                            <div className="pf-stat-card pf-stat-info">
                                <FaRunning className="pf-stat-icon" />
                                <div className="pf-stat-value">{displayStats.bestTopic || 'N/A'}</div>
                                <div className="pf-stat-label">Chủ đề tốt nhất</div>
                            </div>
                        </div>
                    </>
                )}

                {/* Achievements Section */}
                <div className="pf-achievements-container">
                    <h3 className="pf-achievements-title">
                        <FaTrophy className="pf-section-icon" />
                        Thành tích
                    </h3>
                    {achievementsLoading ? (
                        <div className="pf-stats-loading">Đang tải thành tích...</div>
                    ) : (
                        <div className="pf-achievements-grid">
                            {achievements?.length > 0 ? (
                                achievements.map((achievement, index) => (
                                    <div
                                        key={achievement.id || index}
                                        className={`pf-achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
                                    >
                                        <div className="pf-achievement-icon">
                                            <FaTrophy />
                                        </div>
                                        <h4>{achievement.name}</h4>
                                        <p>{achievement.description}</p>
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
                    )}
                </div>
            </div>
        </>
    );
};

export default ProfileStats;