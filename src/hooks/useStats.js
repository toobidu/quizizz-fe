import { useState, useEffect } from 'react';
import statsApi from '../services/statsApi';

export const useStats = (type = 'dashboard') => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            console.log(`[useStats] Fetching stats for type: ${type}`);
            setLoading(true);
            setError('');
            
            try {
                const result = type === 'profile' 
                    ? await statsApi.getProfileStats()
                    : await statsApi.getDashboardStats();

                console.log(`[useStats] Result for ${type}:`, result);
                
                if (result.success) {
                    console.log(`[useStats] Setting stats data:`, result.data);
                    setStats(result.data);
                } else {
                    console.error(`[useStats] Error:`, result.error);
                    setError(result.error);
                }
            } catch (err) {
                console.error(`[useStats] Exception:`, err);
                setError(err.message || 'Lỗi khi tải thống kê');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [type]);

    return { stats, loading, error };
};

export const useAchievements = () => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAchievements = async () => {
            setLoading(true);
            setError('');
            
            try {
                const result = await statsApi.getAchievements();
                if (result.success) {
                    setAchievements(result.data);
                } else {
                    setError(result.error);
                }
            } catch (err) {
                setError(err.message || 'Lỗi khi tải thành tích');
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, []);

    return { achievements, loading, error };
};
