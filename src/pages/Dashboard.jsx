import "../styles/pages/Dashboard.css";
import { useEffect } from 'react';
import HeroSection from './dashboard/HeroSection';
import StatsSection from './dashboard/StatsSection';
import QuickActionsSection from './dashboard/QuickActionsSection';
import authStore from '../stores/authStore';
import profileApi from '../services/profileApi';
import Decoration from "../components/Decoration";

function Dashboard() {
    const { user, isAuthenticated, isLoading } = authStore();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const result = await profileApi.getMyProfile();
            } catch (error) {
            }
        };

        if (isAuthenticated && !user) {
            fetchUserProfile();
        } else {
        }
    }, [isAuthenticated, user]);

    // Prepare user data for components
    const userName = user?.username || 'User';
    const stats = user?.stats || {
        gamesPlayed: 0,
        highScore: 0,
        rank: 0,
        medals: 0
    };

    return (
        <div className="mp-main-layout">
            <Decoration />
            <main className="mp-main-content">
                <HeroSection userName={userName} stats={stats} />
                <StatsSection stats={stats} loading={isLoading} />
                <QuickActionsSection />
            </main>
        </div>
    );
}

export default Dashboard;
