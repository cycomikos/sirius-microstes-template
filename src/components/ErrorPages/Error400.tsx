import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPages.css';

const Error400: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <main className="error-page">
      <div className="error-container">
        <div className="error-icon">
          <span className="error-code">400</span>
        </div>
        
        <div className="error-content">
          <h1 className="error-title">Bad Request</h1>
          <p className="error-message">
            The server cannot process your request due to invalid syntax or malformed data.
          </p>
          <p className="error-description">
            This usually happens when the request is missing required information 
            or contains invalid parameters. Please check your input and try again.
          </p>
        </div>

        <div className="error-actions">
          <button className="btn btn-primary" onClick={handleGoBack}>
            Go Back
          </button>
          <button className="btn btn-secondary" onClick={handleGoHome}>
            Go Home
          </button>
        </div>
      </div>
    </main>
  );
};

export default Error400;