import "../styles/pages/Dashboard.css";
import { useEffect } from 'react';
import HeroSection from './dashboard/HeroSection';
import StatsSection from './dashboard/StatsSection';
import QuickActionsSection from './dashboard/QuickActionsSection';
import authStore from '../stores/authStore';
import profileApi from '../services/profileApi';
import Decoration from "../components/Decoration";
import { useStats } from '../hooks/useStats';

function Dashboard() {
    const { user, isAuthenticated, isLoading } = authStore();
    const { stats: apiStats, loading: statsLoading, error: statsError } = useStats('dashboard');
    
    console.log('[Dashboard] apiStats:', apiStats);
    console.log('[Dashboard] statsLoading:', statsLoading);
    console.log('[Dashboard] statsError:', statsError);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const result = await profileApi.getMyProfile();
            } catch (error) {
            }
        };

        if (isAuthenticated && !user) {
            fetchUserProfile();
        }
    }, [isAuthenticated, user]);

    // Prepare user data for components
    const userName = user?.username || 'User';
    const stats = apiStats || {
        gamesPlayed: 0,
        highScore: 0,
        rank: 0
    };
    
    console.log('[Dashboard] Final stats object:', stats);

    return (
        <div className="mp-main-layout">
            <Decoration />
            <main className="mp-main-content">
                <HeroSection userName={userName} stats={stats} />
                <StatsSection stats={stats} loading={statsLoading} />
                <QuickActionsSection />
            </main>
        </div>
    );
}

export default Dashboard;