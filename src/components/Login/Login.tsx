import React, { useState } from 'react';
import { CalciteButton, CalciteLoader, CalciteNotice } from '@esri/calcite-components-react';
import { useAuth } from '../../contexts/AuthContext';
import { InputValidator } from '../../utils/validation';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { state, signIn, bypassAuth } = useAuth();
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleLogin = async () => {
    setValidationError(null);
    
    // Validate environment configuration
    if (!process.env.REACT_APP_PORTAL_URL) {
      setValidationError('Portal configuration is missing. Please contact administrator.');
      return;
    }
    
    const urlValidation = InputValidator.validateUrl(process.env.REACT_APP_PORTAL_URL);
    if (!urlValidation.isValid) {
      setValidationError('Invalid portal configuration. Please contact administrator.');
      return;
    }

    try {
      await signIn();
      onLogin();
    } catch (error) {
      console.error('Login failed:', error);
      setValidationError('Authentication failed. Please try again.');
    }
  };

  const handleBypass = () => {
    bypassAuth();
    onLogin();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">S</div>
        <h1 className="login-title">SIRIUS Portal</h1>
        <p className="login-subtitle">Enterprise GIS Platform</p>
        
        {state.loading ? (
          <div className="login-loading">
            <CalciteLoader label="Authenticating" />
            <p>Authenticating...</p>
          </div>
        ) : (
          <div>
            <CalciteButton
              width="full"
              appearance="solid"
              kind="brand"
              onClick={handleLogin}
              disabled={state.loading}
            >
              Sign in with ArcGIS Enterprise
            </CalciteButton>
            
            {process.env.NODE_ENV === 'development' && (
              <CalciteButton
                width="full"
                appearance="outline"
                kind="neutral"
                onClick={handleBypass}
                disabled={state.loading}
                style={{ marginTop: '0.5rem' }}
              >
                Bypass Authentication (Dev Only)
              </CalciteButton>
            )}
          </div>
        )}
        
        {(state.error || validationError) && (
          <CalciteNotice 
            kind="danger" 
            icon="exclamation-mark-triangle"
            open={true}
            style={{ marginTop: '1rem' }}
          >
            <div slot="title">Error</div>
            <div slot="message">{validationError || state.error}</div>
          </CalciteNotice>
        )}
        
        <p className="login-disclaimer">
          Authorized for PETRONAS Sirius Users Only
        </p>
      </div>
    </div>
  );
};

export default Login;