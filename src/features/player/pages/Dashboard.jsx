import "../../../styles/pages/Dashboard.css";
import { useEffect } from 'react';
import HeroSection from '../../../pages/dashboard/HeroSection';
import StatsSection from '../../../pages/dashboard/StatsSection';
import QuickActionsSection from '../../../pages/dashboard/QuickActionsSection';
import authStore from '../../../stores/authStore';
import profileApi from '../../../services/profileApi';
import Decoration from "../../../components/Decoration";
import { useStats } from '../../../hooks/useStats';

function Dashboard() {
    const { user, isAuthenticated, isLoading } = authStore();
    const { stats: apiStats, loading: statsLoading, error: statsError } = useStats('dashboard');

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