import React, { Suspense } from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import { useSidebar } from '../../hooks/useSidebar';
import { useMicrositeRegistry } from '../../services/micrositeRegistry';
import { MicrositeConfig } from '../../types/microsite';
import Error403 from '../ErrorPages/Error403';
import Error404 from '../ErrorPages/Error404';

const MicrositeRouter: React.FC = () => {
  const { micrositeId } = useParams<{ micrositeId: string }>();
  const { state } = useAuth();
  const { currentLanguage } = useLanguage();
  const { sidebarExpanded, panelWidth } = useSidebar();
  const { getConfig, loadComponent, isRegistered } = useMicrositeRegistry();
  
  const [MicrositeComponent, setMicrositeComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [config, setConfig] = React.useState<MicrositeConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [hasAccess, setHasAccess] = React.useState(false);

  React.useEffect(() => {
    const loadMicrosite = async () => {
      if (!micrositeId) {
        setError('No microsite ID provided');
        setLoading(false);
        return;
      }

      try {
        // Check if microsite is registered
        if (!isRegistered(micrositeId)) {
          setError('Microsite not found');
          setLoading(false);
          return;
        }

        // Get microsite configuration
        const micrositeConfig = getConfig(micrositeId);
        if (!micrositeConfig) {
          setError('Microsite configuration not found');
          setLoading(false);
          return;
        }

        setConfig(micrositeConfig);

        // Check if user has access
        const userGroups = state.user?.groups || [];
        const hasRequiredAccess = userGroups.includes(micrositeConfig.requiredGroupId);
        
        if (!hasRequiredAccess) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        setHasAccess(true);

        // Load microsite component
        const component = await loadComponent(micrositeId);
        if (component) {
          setMicrositeComponent(() => component);
        } else {
          setError('Failed to load microsite component');
        }

      } catch (err) {
        console.error('Error loading microsite:', err);
        setError('Failed to load microsite');
      } finally {
        setLoading(false);
      }
    };

    if (state.user) {
      loadMicrosite();
    }
  }, [micrositeId, state.user, isRegistered, getConfig, loadComponent]);

  // Show loading state
  if (loading) {
    return (
      <div className="microsite-router-loading">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            {currentLanguage === 'en' 
              ? `Loading ${micrositeId} microsite...` 
              : `Memuatkan mikrosite ${micrositeId}...`
            }
          </div>
        </div>
      </div>
    );
  }

  // Show 404 if microsite not found or error
  if (error || !config) {
    return <Error404 />;
  }

  // Show 403 if user doesn't have access
  if (!hasAccess) {
    return (
      <Error403 
        requiredRole={config.requiredGroupName}
        resource={`${config.title[currentLanguage]} Microsite`}
        siriusGroupRequired={true}
        accessRevoked={false}
      />
    );
  }

  // Show 404 if component failed to load
  if (!MicrositeComponent) {
    return <Error404 />;
  }

  // Render microsite component
  return (
    <Suspense 
      fallback={
        <div className="microsite-component-loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">
            {currentLanguage === 'en' 
              ? 'Initializing microsite...' 
              : 'Memulakan mikrosite...'
            }
          </div>
        </div>
      }
    >
      <MicrositeComponent
        config={config}
        user={state.user}
        currentLanguage={currentLanguage}
        sidebarExpanded={sidebarExpanded}
        panelWidth={panelWidth}
      />
    </Suspense>
  );
};

// Microsite Routes Component
const MicrositeRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Specific microsite route */}
      <Route path="/:micrositeId/*" element={<MicrositeRouter />} />
      
      {/* Redirect root to main microsite landing */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default MicrositeRoutes;