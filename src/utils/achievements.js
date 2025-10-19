/**
 * Achievement System
 * Quản lý các thành tựu/huy chương cho người chơi
 */

// Định nghĩa các loại achievement
export const ACHIEVEMENT_TYPES = {
  BEGINNER: 'beginner',
  ENTHUSIAST: 'enthusiast',
  EXPERT: 'expert',
  LEGEND: 'legend',
  SPEED_DEMON: 'speed_demon',
  PERFECTIONIST: 'perfectionist',
  TOPIC_MASTER: 'topic_master',
  WINNER: 'winner',
};

// Cấu hình các achievement
export const ACHIEVEMENTS = [
  {
    id: 'beginner',
    name: '🎯 Người Mới Bắt Đầu',
    description: 'Hoàn thành trò chơi đầu tiên',
    icon: '🎯',
    condition: (stats) => stats.totalGames >= 1,
    tier: 'bronze',
    points: 10,
  },
  {
    id: 'enthusiast',
    name: '🔥 Người Chơi Nhiệt Tình',
    description: 'Chơi 10 trò chơi',
    icon: '🔥',
    condition: (stats) => stats.totalGames >= 10,
    tier: 'silver',
    points: 50,
  },
  {
    id: 'expert',
    name: '💎 Cao Thủ',
    description: 'Đạt 1000 điểm tổng',
    icon: '💎',
    condition: (stats) => stats.totalScore >= 1000,
    tier: 'gold',
    points: 100,
  },
  {
    id: 'legend',
    name: '👑 Huyền Thoại',
    description: 'Chơi 50 trò chơi',
    icon: '👑',
    condition: (stats) => stats.totalGames >= 50,
    tier: 'platinum',
    points: 200,
  },
  {
    id: 'speed_demon',
    name: '⚡ Tốc Độ Ánh Sáng',
    description: 'Hoàn thành game dưới 2 phút',
    icon: '⚡',
    condition: (stats) => stats.fastestTime > 0 && stats.fastestTime <= 120,
    tier: 'gold',
    points: 75,
  },
  {
    id: 'perfectionist',
    name: '🎖️ Hoàn Hảo',
    description: 'Đạt 100% chính xác trong 1 game',
    icon: '🎖️',
    condition: (stats) => stats.perfectGames >= 1,
    tier: 'gold',
    points: 150,
  },
  {
    id: 'topic_master',
    name: '📚 Bậc Thầy Chủ Đề',
    description: 'Đạt trên 90% chính xác ở 1 chủ đề',
    icon: '📚',
    condition: (stats) => stats.bestTopicAccuracy >= 90,
    tier: 'silver',
    points: 80,
  },
  {
    id: 'winner',
    name: '🏆 Nhà Vô Địch',
    description: 'Đạt hạng 1 trong 5 game',
    icon: '🏆',
    condition: (stats) => stats.firstPlaceCount >= 5,
    tier: 'platinum',
    points: 250,
  },
  {
    id: 'consistent',
    name: '📈 Nhất Quán',
    description: 'Chơi 7 ngày liên tiếp',
    icon: '📈',
    condition: (stats) => stats.consecutiveDays >= 7,
    tier: 'silver',
    points: 100,
  },
  {
    id: 'sharp_shooter',
    name: '🎯 Xạ Thủ',
    description: 'Trả lời đúng 100 câu',
    icon: '🎯',
    condition: (stats) => stats.totalCorrectAnswers >= 100,
    tier: 'gold',
    points: 120,
  },
];

/**
 * Tính toán các achievement đã đạt được
 * @param {Object} gameHistories - Danh sách lịch sử game
 * @returns {Array} Danh sách achievements với trạng thái earned
 */
export const calculateAchievements = (gameHistories = []) => {
  // Tính toán các stats cần thiết
  const totalGames = gameHistories.length;
  const totalScore = gameHistories.reduce((sum, game) => sum + (game.score || 0), 0);
  const totalCorrectAnswers = gameHistories.reduce((sum, game) => sum + (game.correctAnswers || 0), 0);

  // Tính fastest time
  const fastestTime = gameHistories.reduce((min, game) => {
    if (!game.totalTime || game.totalTime === 0) return min;
    return min === 0 ? game.totalTime : Math.min(min, game.totalTime);
  }, 0);

  // Đếm số game perfect (100% correct)
  const perfectGames = gameHistories.filter(game =>
    game.totalQuestions > 0 && game.correctAnswers === game.totalQuestions
  ).length;

  // Đếm số lần đạt hạng 1
  const firstPlaceCount = gameHistories.filter(game => game.ranking === 1).length;

  // Tính best topic accuracy (giả sử từ API)
  const bestTopicAccuracy = 0; // TODO: Cần tính từ API hoặc thêm vào gameHistories

  // Tính consecutive days (giả sử từ API)
  const consecutiveDays = 0; // TODO: Cần logic phức tạp hơn để tính

  const stats = {
    totalGames,
    totalScore,
    totalCorrectAnswers,
    fastestTime,
    perfectGames,
    firstPlaceCount,
    bestTopicAccuracy,
    consecutiveDays,
  };

  // Map qua tất cả achievements và check điều kiện
  return ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    earned: achievement.condition(stats),
  }));
};

/**
 * Lấy tổng điểm từ các achievement đã đạt
 */
export const getTotalAchievementPoints = (achievements) => {
  return achievements
    .filter(a => a.earned)
    .reduce((sum, a) => sum + a.points, 0);
};

/**
 * Lấy achievement theo tier
 */
export const getAchievementsByTier = (achievements, tier) => {
  return achievements.filter(a => a.tier === tier);
};

/**
 * Lấy % hoàn thành achievements
 */
export const getAchievementProgress = (achievements) => {
  const earned = achievements.filter(a => a.earned).length;
  const total = achievements.length;
  return total > 0 ? Math.round((earned / total) * 100) : 0;
};

/**
 * CSS classes cho các tier
 */
export const TIER_CLASSES = {
  bronze: 'achievement-bronze',
  silver: 'achievement-silver',
  gold: 'achievement-gold',
  platinum: 'achievement-platinum',
};

/**
 * Colors cho các tier (dark và light mode)
 */
export const TIER_COLORS = {
  bronze: {
    light: {
      bg: 'linear-gradient(135deg, #cd7f32 0%, #b8733d 100%)',
      shadow: 'rgba(205, 127, 50, 0.4)',
    },
    dark: {
      bg: 'linear-gradient(135deg, #a06328 0%, #8b5a2b 100%)',
      shadow: 'rgba(160, 99, 40, 0.6)',
    },
  },
  silver: {
    light: {
      bg: 'linear-gradient(135deg, #c0c0c0 0%, #b8b8b8 100%)',
      shadow: 'rgba(192, 192, 192, 0.4)',
    },
    dark: {
      bg: 'linear-gradient(135deg, #9a9a9a 0%, #8a8a8a 100%)',
      shadow: 'rgba(154, 154, 154, 0.6)',
    },
  },
  gold: {
    light: {
      bg: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
      shadow: 'rgba(255, 215, 0, 0.4)',
    },
    dark: {
      bg: 'linear-gradient(135deg, #ccac00 0%, #ccbe3e 100%)',
      shadow: 'rgba(204, 172, 0, 0.6)',
    },
  },
  platinum: {
    light: {
      bg: 'linear-gradient(135deg, #e5e4e2 0%, #b0c4de 100%)',
      shadow: 'rgba(229, 228, 226, 0.4)',
    },
    dark: {
      bg: 'linear-gradient(135deg, #9b9a98 0%, #7a8ca0 100%)',
      shadow: 'rgba(155, 154, 152, 0.6)',
    },
  },
};

export default {
  ACHIEVEMENT_TYPES,
  ACHIEVEMENTS,
  calculateAchievements,
  getTotalAchievementPoints,
  getAchievementsByTier,
  getAchievementProgress,
  TIER_CLASSES,
  TIER_COLORS,
};

