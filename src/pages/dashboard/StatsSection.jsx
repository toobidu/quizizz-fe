import '../../styles/pages/dashboard/StatsSection.css';
import { formatScore, formatRank } from '../../utils/statsUtils';

function StatsSection({ stats, loading }) {
    const safeValue = (value, formatter = null) => {
        if (loading) return '...';
        if (value === undefined || value === null) return 'N/A';
        return formatter ? formatter(value) : value.toLocaleString();
    };

    const formattedStats = {
        gamesPlayed: safeValue(stats?.gamesPlayed),
        highScore: safeValue(stats?.highestScore, formatScore),
        rank: safeValue(stats?.highestRank, formatRank)
    };

    return (
        <div className="ds-stats-section">
            <div className="ds-stats-grid">
                <div className="ds-stat-card">
                    <div className="ds-stat-value">{formattedStats.gamesPlayed}</div>
                    <div className="ds-stat-label">Số lần chơi</div>
                </div>
                <div className="ds-stat-card">
                    <div className="ds-stat-value">{formattedStats.highScore}</div>
                    <div className="ds-stat-label">Điểm cao nhất</div>
                </div>
                <div className="ds-stat-card">
                    <div className="ds-stat-value">{formattedStats.rank}</div>
                    <div className="ds-stat-label">Xếp hạng</div>
                </div>

            </div>
        </div>
    );
}

export default StatsSection;