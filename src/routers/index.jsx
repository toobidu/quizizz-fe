import { createBrowserRouter, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import App from "../App";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Welcome from "../pages/Welcome";
import Dashboard from "../pages/Dashboard";
import ErrorPage from "../pages/ErrorPage";
import AboutPage from "../pages/footer/AboutPage";
import BlogPage from "../pages/footer/BlogPage";
import ContactPage from "../pages/footer/ContactPage";
import HelpPage from "../pages/footer/HelpPage";
import FaqPage from "../pages/footer/FaqPage";
import PrivacyPage from "../pages/footer/PrivacyPage";
import TermsPage from "../pages/footer/TermsPage";
import FeedbackPage from "../pages/footer/FeedbackPage";
import ForgotPassword from "../pages/auth/ForgotPassword";
import authStore from "../stores/authStore";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const isLoading = authStore((state) => state.isLoading);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await authStore.getState().initialize();
      } catch (error) {
        console.error('Auth initialization error:', error);
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
    console.log('🚫 ProtectedRoute: User not authenticated, redirecting to /');
    return <Navigate to="/" replace />;
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
      { path: "dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: "about", element: <AboutPage /> },
      { path: "blog", element: <BlogPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "help", element: <HelpPage /> },
      { path: "faq", element: <FaqPage /> },
      { path: "privacy", element: <PrivacyPage /> },
      { path: "terms", element: <TermsPage /> },
      { path: "feedback", element: <FeedbackPage /> },
      { path: "*", element: <ErrorPage /> }
    ]
  }
]);

export { router };