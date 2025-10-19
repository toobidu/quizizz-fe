import React, { useState } from 'react';
import { FiAward, FiLock } from 'react-icons/fi';
import { getAchievementProgress, getTotalAchievementPoints, TIER_CLASSES } from '../../utils/achievements';
import '../../styles/components/AchievementsList.css';

const AchievementsList = ({ achievements }) => {
  const [showAll, setShowAll] = useState(false);

  const earnedAchievements = achievements.filter(a => a.earned);
  const unearnedAchievements = achievements.filter(a => !a.earned);
  const progress = getAchievementProgress(achievements);
  const totalPoints = getTotalAchievementPoints(achievements);

  // Hiển thị 4 achievement đầu tiên hoặc tất cả
  const displayedAchievements = showAll
    ? [...earnedAchievements, ...unearnedAchievements]
    : [...earnedAchievements.slice(0, 4), ...unearnedAchievements.slice(0, 4)].slice(0, 8);

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h3 className="achievements-title">
          <FiAward className="title-icon" />
          Thành Tựu & Huy Chương
        </h3>
        <div className="achievements-stats">
          <div className="stat-badge">
            <span className="stat-label">Hoàn thành:</span>
            <span className="stat-value">{progress}%</span>
          </div>
          <div className="stat-badge">
            <span className="stat-label">Tổng điểm:</span>
            <span className="stat-value">{totalPoints}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          >
            <span className="progress-text">{earnedAchievements.length}/{achievements.length}</span>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="achievements-grid">
        {displayedAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`achievement-card ${achievement.earned ? 'earned' : 'locked'} ${TIER_CLASSES[achievement.tier]}`}
            title={achievement.description}
          >
            <div className="achievement-icon">
              {achievement.earned ? (
                <span className="icon-emoji">{achievement.icon}</span>
              ) : (
                <FiLock className="lock-icon" />
              )}
            </div>
            <div className="achievement-info">
              <h4 className="achievement-name">{achievement.name}</h4>
              <p className="achievement-description">{achievement.description}</p>
              <div className="achievement-footer">
                <span className="achievement-tier">{achievement.tier.toUpperCase()}</span>
                <span className="achievement-points">+{achievement.points} điểm</span>
              </div>
            </div>
            {achievement.earned && (
              <div className="achievement-badge">
                <span className="badge-checkmark">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {achievements.length > 8 && (
        <div className="show-more-container">
          <button
            className="show-more-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Thu gọn' : `Xem thêm (${achievements.length - 8}+)`}
          </button>
        </div>
      )}

      {/* Empty State */}
      {achievements.length === 0 && (
        <div className="achievements-empty">
          <FiAward className="empty-icon" />
          <p>Chưa có thành tựu nào. Hãy chơi game để mở khóa!</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsList;

