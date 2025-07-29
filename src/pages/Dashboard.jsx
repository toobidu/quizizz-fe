import "../styles/pages/Dashboard.css";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import HeroSection from './dashboard/HeroSection';
// import StatsSection from './dashboard/StatsSection';
// import QuickActionsSection from './dashboard/QuickActionsSection';
import '../styles/pages/Dashboard.css';

function Dashboard() {
    const navigate = useNavigate();
    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    const handleLogout = () => {
        logout(navigate);
    };

    return (
        <div className="mp-main-layout">
            <main className="mp-main-content">
                <div>Hello</div>
                {/* <HeroSection userName={userName} stats={stats} />
                <StatsSection stats={stats} loading={loading} />
                <QuickActionsSection /> */}
            </main>
        </div>
    );
}

export default Dashboard;
