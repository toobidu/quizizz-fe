import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/ErrorPage.css';
import authStore from '../stores/authStore';

const ErrorPage = () => {
  const isAuthenticated = authStore((state) => state.isAuthenticated);
  const homePath = isAuthenticated ? '/dashboard' : '/';

  return (
    <div className="error-container">
      <div className="error-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Oops! Page Not Found</h2>
        <p className="error-message">
          It looks like the page you're looking for has vanished or never existed.
        </p>
        <Link to={homePath} className="error-button">
          <span className="button-text">Back to Home</span>
          <svg
            className="button-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;