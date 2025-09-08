import React, { useState } from 'react';
import { CalciteButton, CalciteLoader, CalciteNotice } from '@esri/calcite-components-react';
import { useAuth } from '../../contexts/AuthContext';
import { InputValidator } from '../../utils/validation';
import { getTranslation, Language } from '../../utils/translations';
import { useLanguage } from '../../hooks/useLanguage';
import { authLogger } from '../../utils/logger';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { state, signIn, bypassAuth } = useAuth();
  const { currentLanguage } = useLanguage();
  const [validationError, setValidationError] = useState<string | null>(null);

  const t = (key: keyof typeof import('../../utils/translations').translations.en) => 
    getTranslation(key, currentLanguage as Language);

  const handleLogin = async () => {
    setValidationError(null);
    
    // Validate environment configuration
    if (!process.env.REACT_APP_PORTAL_URL) {
      setValidationError(t('portalConfigurationMissing'));
      return;
    }
    
    const urlValidation = InputValidator.validateUrl(process.env.REACT_APP_PORTAL_URL);
    if (!urlValidation.isValid) {
      setValidationError(t('invalidPortalConfiguration'));
      return;
    }

    try {
      authLogger.info('Login attempt starting');
      await signIn();
      authLogger.info('Login successful');
      onLogin();
    } catch (error) {
      authLogger.error('Login failed', {
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        userGroups: (error as any)?.userGroups,
        userGroupIds: (error as any)?.userGroupIds
      });
      
      authLogger.error('Login failed', error);
      
      // Handle specific Sirius Users access denial
      if (error instanceof Error && (
        error.message.includes('Sirius Users') || 
        (error as any).code === 'SIRIUS_ACCESS_DENIED'
      )) {
        authLogger.warn('Sirius access denied error set');
        setValidationError(t('accessDeniedSiriusUsers'));
      } else {
        authLogger.warn('Generic authentication error set');
        setValidationError(t('authenticationFailed'));
      }
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
        <h1 className="login-title">{t('siriusPortal')}</h1>
        <p className="login-subtitle">{t('enterpriseGisPlatform')}</p>
        
        {state.loading ? (
          <div className="login-loading">
            <CalciteLoader label={t('authenticating')} />
            <p>{t('authenticating')}...</p>
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
              {t('signInWithArcgis')}
            </CalciteButton>
            
            {process.env.NODE_ENV === 'development' && (
              <CalciteButton
                width="full"
                appearance="outline"
                kind="neutral"
                onClick={handleBypass}
                disabled={state.loading}
                className="login-dev-button"
              >
                {t('bypassAuthDev')}
              </CalciteButton>
            )}
          </div>
        )}
        
        {(state.error || validationError || state.accessDenied) && (
          <CalciteNotice 
            kind="danger" 
            icon="exclamation-mark-triangle"
            open={true}
            className="login-error-notice"
          >
            <div slot="title">{t('error')}</div>
            <div slot="message">
              {state.accessDenied ? t('accessDeniedSiriusUsers') : (validationError || state.error)}
            </div>
          </CalciteNotice>
        )}
        
        <p className="login-disclaimer">
          {t('authorizedUsersOnly')}
        </p>
      </div>
    </div>
  );
};

export default Login;