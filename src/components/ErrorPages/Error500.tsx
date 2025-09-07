import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logger, LogCategory } from '../../utils/logger';
import './ErrorPages.css';

interface Error500Props {
  error?: Error;
  resetError?: () => void;
}

const Error500: React.FC<Error500Props> = ({ error, resetError }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (resetError) {
      resetError();
    }
    navigate('/');
  };

  const handleRefresh = () => {
    if (resetError) {
      resetError();
    }
    window.location.reload();
  };

  const handleReportIssue = () => {
    // In a real app, this would open a support ticket or send error report
    const errorDetails = {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace available',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    logger.error('Error Report generated for user', LogCategory.UI, errorDetails);
    alert('Error report generated. Please check the console and contact support.');
  };

  return (
    <main className="error-page">
      <div className="error-container">
        <div className="error-icon">
          <span className="error-code error-500">500</span>
        </div>
        
        <div className="error-content">
          <h1 className="error-title">Internal Server Error</h1>
          <p className="error-message">
            Something went wrong on our end. We're working to fix this issue.
          </p>
          <p className="error-description">
            Our team has been automatically notified about this error. 
            Please try refreshing the page or returning to the homepage. 
            If the problem persists, please report the issue.
          </p>
          {error && process.env.NODE_ENV === 'development' && (
            <details className="error-details">
              <summary>Technical Details (Development)</summary>
              <pre className="error-stack">
                <strong>Error:</strong> {error.message}
                <br />
                <strong>Stack:</strong>
                <br />
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="error-actions">
          <button className="btn btn-primary" onClick={handleRefresh}>
            Try Again
          </button>
          <button className="btn btn-secondary" onClick={handleGoHome}>
            Go Home
          </button>
          <button className="btn btn-tertiary" onClick={handleReportIssue}>
            Report Issue
          </button>
        </div>
      </div>
    </main>
  );
};

export default Error500;