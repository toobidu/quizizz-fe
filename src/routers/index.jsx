import { createBrowserRouter, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import App from "../App";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";
import Welcome from "../pages/Welcome";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import ErrorPage from "../pages/ErrorPage";
import AboutPage from "../pages/footer/AboutPage";
import BlogPage from "../pages/footer/BlogPage";
import ContactPage from "../pages/footer/ContactPage";
import HelpPage from "../pages/footer/HelpPage";
import FaqPage from "../pages/footer/FAQPage";
import PrivacyPage from "../pages/footer/PrivacyPage";
import TermsPage from "../pages/footer/TermsPage";
import FeedbackPage from "../pages/footer/FeedbackPage";
import RoomsPage from "../pages/room/RoomPage";
import WaitingRoom from "../components/room/WaitingRoom";
import GameRoom from "../components/room/GameRoom";
import Leaderboard from "../pages/Leaderboard";
import authStore from "../stores/authStore";

// Teacher imports
import TeacherDashboard from "../features/teacher/pages/TeacherDashboard";
import AIQuestionGenerator from "../features/teacher/pages/AIQuestionGenerator";
import Statistics from "../features/teacher/pages/Statistics";
import TopicManagement from "../features/teacher/pages/TopicManagement";
import QuestionManagement from "../features/teacher/pages/QuestionManagement";

// Protected Route Component
const ProtectedRoute = ({ children, requireTeacher = false }) => {
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const isLoading = authStore((state) => state.isLoading);
  const user = authStore((state) => state.user);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await authStore.getState().initialize();
      } catch (error) {
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Show loading while initializing or while auth is loading
  if (!isInitialized || isLoading) {
    return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.2rem',
          color: '#666'
        }}>
          Đang tải...
        </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requireTeacher && user?.role !== 'TEACHER') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Welcome /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "rooms", element: <ProtectedRoute><RoomsPage /></ProtectedRoute> },
      { path: "leaderboard", element: <ProtectedRoute><Leaderboard /></ProtectedRoute> },
      { path: "waiting-room/:roomCode", element: <ProtectedRoute><WaitingRoom /></ProtectedRoute> },
      { path: "game/:roomCode", element: <ProtectedRoute><GameRoom /></ProtectedRoute> },
      { path: "about", element: <AboutPage /> },
      { path: "blog", element: <BlogPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "help", element: <HelpPage /> },
      { path: "faq", element: <FaqPage /> },
      { path: "privacy", element: <PrivacyPage /> },
      { path: "terms", element: <TermsPage /> },
      { path: "feedback", element: <FeedbackPage /> },
      
      // Teacher routes
      { path: "teacher/dashboard", element: <ProtectedRoute requireTeacher={true}><TeacherDashboard /></ProtectedRoute> },
      { path: "teacher/topics", element: <ProtectedRoute requireTeacher={true}><TopicManagement /></ProtectedRoute> },
      { path: "teacher/questions", element: <ProtectedRoute requireTeacher={true}><QuestionManagement /></ProtectedRoute> },
      { path: "teacher/ai-generator", element: <ProtectedRoute requireTeacher={true}><AIQuestionGenerator /></ProtectedRoute> },
      { path: "teacher/statistics", element: <ProtectedRoute requireTeacher={true}><Statistics /></ProtectedRoute> },
      
      { path: "*", element: <ErrorPage /> }
    ]
  }
]);

export { router };