/**
 * Format time in seconds to display format
 * @param {number|string} seconds - Time in seconds (number or string)
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
    // Convert to number if string
    const numSeconds = typeof seconds === 'string' ? parseInt(seconds, 10) : seconds;
    
    // Check for invalid values
    if (!numSeconds || isNaN(numSeconds) || numSeconds === 0) return 'N/A';
    
    if (numSeconds < 60) {
        return `${numSeconds}s`;
    }
    
    const minutes = Math.floor(numSeconds / 60);
    const remainingSeconds = numSeconds % 60;
    
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
