import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './ErrorPages.css';

interface Error403Props {
  requiredRole?: string;
  resource?: string;
}

const Error403: React.FC<Error403Props> = ({ requiredRole, resource }) => {
  const navigate = useNavigate();
  const { state, signOut } = useAuth();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogin = () => {
    signOut(); // Clear current session
    navigate('/'); // Will redirect to login
  };

  const handleRequestAccess = () => {
    // In a real app, this would submit an access request
    const requestDetails = {
      user: state.user?.username || 'Unknown',
      requiredRole: requiredRole || 'Unknown',
      resource: resource || window.location.pathname,
      timestamp: new Date().toISOString()
    };
    
    console.log('Access Request:', requestDetails);
    alert('Access request submitted. You will be notified when approved.');
  };

  return (
    <main className="error-page">
      <div className="error-container">
        <div className="error-icon">
          <span className="error-code error-403">403</span>
        </div>
        
        <div className="error-content">
          <h1 className="error-title">Access Forbidden</h1>
          <p className="error-message">
            You don't have permission to access this resource.
          </p>
          <p className="error-description">
            {requiredRole ? (
              <>This resource requires <strong>{requiredRole}</strong> privileges. </>
            ) : null}
            {resource ? (
              <>You are trying to access: <strong>{resource}</strong>. </>
            ) : null}
            Please contact your administrator if you believe this is an error, 
            or try logging in with different credentials.
          </p>
          {state.user && (
            <div className="user-info">
              <p className="current-user">
                Currently logged in as: <strong>{state.user.username}</strong>
                {state.user.groups.length > 0 && <span className="user-role"> ({state.user.groups.join(', ')})</span>}
              </p>
            </div>
          )}
        </div>

        <div className="error-actions">
          <button className="btn btn-primary" onClick={handleGoHome}>
            Go Home
          </button>
          <button className="btn btn-secondary" onClick={handleGoBack}>
            Go Back
          </button>
          {state.user ? (
            <>
              <button className="btn btn-tertiary" onClick={handleRequestAccess}>
                Request Access
              </button>
              <button className="btn btn-outline" onClick={handleLogin}>
                Switch Account
              </button>
            </>
          ) : (
            <button className="btn btn-tertiary" onClick={handleLogin}>
              Login
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default Error403;