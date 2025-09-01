import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPages.css';

const Error404: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <main className="error-page">
      <div className="error-container">
        <div className="error-icon">
          <span className="error-code error-404">404</span>
        </div>
        
        <div className="error-content">
          <h1 className="error-title">Page Not Found</h1>
          <p className="error-message">
            Sorry, the page you are looking for doesn't exist or has been moved.
          </p>
          <p className="error-description">
            This might be because the URL was typed incorrectly, the page was deleted, 
            or you don't have permission to access it. Try checking the URL or 
            navigate back to the homepage.
          </p>
        </div>

        <div className="error-actions">
          <button className="btn btn-primary" onClick={handleGoHome}>
            Go Home
          </button>
          <button className="btn btn-secondary" onClick={handleGoBack}>
            Go Back
          </button>
          <button className="btn btn-tertiary" onClick={handleRefresh}>
            Refresh Page
          </button>
        </div>
      </div>
    </main>
  );
};

export default Error404;