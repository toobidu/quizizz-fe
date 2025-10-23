/**
 * Format time in seconds to display format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return 'N/A';
    
    if (seconds < 60) {
        return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (remainingSeconds === 0) {
        return `${minutes} phút`;
    }
    
    return `${minutes} phút ${remainingSeconds}s`;
};

/**
 * Format rank display
 * @param {number} rank - Player rank
 * @returns {string} Formatted rank string
 */
export const formatRank = (rank) => {
    if (!rank || rank === 0) return 'N/A';
    return `#${rank}`;
};

/**
 * Format score display
 * @param {number} score - Player score
 * @returns {string} Formatted score string
 */
export const formatScore = (score) => {
    if (!score && score !== 0) return 'N/A';
    return score.toLocaleString();
};
