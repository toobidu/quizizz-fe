import '../../styles/pages/dashboard/StatsSection.css';
function StatsSection({ stats, loading }) {
    const safeValue = (value, formatter = null) => {
        if (loading) return '...';
        if (value === undefined || value === null) return 'N/A';
        return formatter ? formatter(value) : value.toLocaleString();
    };

    const formattedStats = {
        gamesPlayed: safeValue(stats?.gamesPlayed),
        highScore: safeValue(stats?.highScore, (val) => val.toLocaleString()),
        rank: safeValue(stats?.rank, (val) => `#${val}`),
        medals: safeValue(stats?.medals),
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
                <div className="ds-stat-card">
                    <div className="ds-stat-value">{formattedStats.medals}</div>
                    <div className="ds-stat-label">Huy chương</div>
                </div>
            </div>
        </div>
    );
}

export default StatsSection;