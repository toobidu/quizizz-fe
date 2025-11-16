// Routes công khai (không cần đăng nhập)
import Login from "../../pages/auth/Login";
import Register from "../../pages/auth/Register";
import ForgotPassword from "../../pages/auth/ForgotPassword";
import VerifyEmail from "../../pages/auth/VerifyEmail";
import Welcome from "../../pages/Welcome";
import AboutPage from "../../pages/footer/AboutPage";
import BlogPage from "../../pages/footer/BlogPage";
import ContactPage from "../../pages/footer/ContactPage";
import HelpPage from "../../pages/footer/HelpPage";
import FaqPage from "../../pages/footer/FAQPage";
import PrivacyPage from "../../pages/footer/PrivacyPage";
import TermsPage from "../../pages/footer/TermsPage";
import FeedbackPage from "../../pages/footer/FeedbackPage";

const publicRoutes = [
  { index: true, element: <Welcome /> },
  { path: "login", element: <Login /> },
  { path: "register", element: <Register /> },
  { path: "forgot-password", element: <ForgotPassword /> },
  { path: "verify-email", element: <VerifyEmail /> },
  { path: "about", element: <AboutPage /> },
  { path: "blog", element: <BlogPage /> },
  { path: "contact", element: <ContactPage /> },
  { path: "help", element: <HelpPage /> },
  { path: "faq", element: <FaqPage /> },
  { path: "privacy", element: <PrivacyPage /> },
  { path: "terms", element: <TermsPage /> },
  { path: "feedback", element: <FeedbackPage /> },
];

export default publicRoutes;
