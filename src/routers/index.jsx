import { createBrowserRouter } from "react-router-dom";
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    children: [
      { index: true, element: <Welcome /> }, 
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      {path: "forgot-password", element: <ForgotPassword /> },
      {path: "dashboard", element: <Dashboard /> },
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