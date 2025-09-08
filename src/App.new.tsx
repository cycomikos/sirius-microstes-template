import React from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import MicrositeLanding from './components/MicrositeLanding/MicrositeLanding';
import MicrositeRouter from './components/MicrositeRouter/MicrositeRouter';
import EsriMapView from './components/EsriMapView/EsriMapView';
import MapsAndScenes from './components/MapsAndScenes/MapsAndScenes';
import Profile from './components/Profile/Profile';
import Error400 from './components/ErrorPages/Error400';
import Error403 from './components/ErrorPages/Error403';
import Error404 from './components/ErrorPages/Error404';
import Error500 from './components/ErrorPages/Error500';
import Error503 from './components/ErrorPages/Error503';
import ErrorBoundary from './components/ErrorPages/ErrorBoundary';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './hooks/useTheme';
import { useSidebar } from './hooks/useSidebar';
import { useLanguage } from './hooks/useLanguage';
import { useMicrositeRegistry } from './services/micrositeRegistry';
import './App.css';

// Force redirect to external portal - simplified immediate approach
const forceRedirectToExternalPortal = () => {
  const externalPortalUrl = 'https://publicgis.petronas.com/sirius-portal';
  
  console.log('🚀 App.tsx: Forcing redirect to external portal immediately');
  
  // Clear session storage immediately
  try {
    sessionStorage.clear();
    localStorage.clear();
  } catch (e) {
    console.warn('Storage cleanup failed:', e);
  }
  
  // Immediate redirect - no delays
  console.log('✅ App.tsx: Executing immediate redirect to:', externalPortalUrl);
  window.location.href = externalPortalUrl;
};

// OAuth Callback Handler Component
const OAuthCallbackHandler: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  React.useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const code = searchParams.get('code');
    
    console.log('🔍 OAuth Callback Handler:', {
      currentUrl: window.location.href,
      error,
      errorDescription,
      code,
      allParams: Object.fromEntries(searchParams.entries())
    });
    
    // If there's an error (including user cancellation), redirect to external portal
    if (error) {
      console.log('🚫 OAuth error detected, redirecting to external portal');
      forceRedirectToExternalPortal();
      return;
    }
    
    // If no error and no code, something went wrong
    if (!code) {
      console.log('🔄 No OAuth code received, redirecting to external portal');
      forceRedirectToExternalPortal();
      return;
    }
    
    // If we have a code, redirect to home page to continue authentication
    console.log('✅ OAuth code received, redirecting to home');
    window.location.href = '/';
  }, [searchParams]);

  // Show loading while processing
  return (
    <div className="auth-loading-container">
      <div className="auth-processing-text">Processing authentication...</div>
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = React.useState('dashboard');
  const { state, signIn, signOut } = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();
  const { currentLanguage, toggleLanguage } = useLanguage();
  const { getAccessibleConfigs } = useMicrositeRegistry();
  const {
    sidebarExpanded,
    activePanel,
    isMobileOpen,
    panelWidth,
    isResizing,
    toggleSidebar,
    handlePanelChange,
    handleResizeStart
  } = useSidebar();

  // Auto-redirect to external portal if user cancelled authentication
  React.useEffect(() => {
    const userCancelled = sessionStorage.getItem('auth_cancelled');
    if (userCancelled && !state.isAuthenticated) {
      const timer = setTimeout(() => {
        window.location.href = 'https://publicgis.petronas.com/sirius-portal';
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [state.isAuthenticated]);

  // Get user's accessible microsites and convert to UserMicrosite format
  const userMicrosites = React.useMemo(() => {
    if (!state.user?.groups) return [];
    const accessibleConfigs = getAccessibleConfigs(state.user.groups);
    
    // Convert MicrositeConfig to UserMicrosite format expected by Header
    return accessibleConfigs.map(config => ({
      id: config.id,
      name: config.title[currentLanguage],
      icon: config.icon,
      color: config.color,
      url: `/microsites/${config.id}`,
      description: config.description[currentLanguage],
      country: 'Malaysia', // Default country
      countryFlag: '🇲🇾'
    }));
  }, [state.user?.groups, getAccessibleConfigs, currentLanguage]);

  // Navigate to dashboard handler
  const handleNavigateHome = () => {
    setCurrentView('dashboard');
  };

  // Debug logging - must be before any conditional returns
  React.useEffect(() => {
    console.log('🔍 App state changed:', {
      isAuthenticated: state.isAuthenticated,
      loading: state.loading,
      hasUser: !!state.user,
      error: state.error,
      accessDenied: !!state.accessDenied,
      userMicrosites: userMicrosites.length
    });
  }, [state.isAuthenticated, state.loading, state.user, state.error, state.accessDenied, userMicrosites.length]);

  // Handle redirect when not authenticated (must be before any conditional returns)
  React.useEffect(() => {
    if (!state.isAuthenticated && !state.loading) {
      console.log('🔄 Not authenticated and not loading - should trigger ArcGIS Enterprise login');
      // Don't redirect to external portal - let AuthContext handle ArcGIS Enterprise login
    }
  }, [state.isAuthenticated, state.loading]);

  // Show Error 403 if user is denied access due to Sirius Users group requirement
  if (state.accessDenied) {
    const isAccessRevoked = state.accessDenied.message.includes('revoked') || 
                           state.accessDenied.message.includes('no longer a member');
    
    return (
      <Error403 
        requiredRole="Sirius Users Group" 
        resource="SIRIUS Portal"
        siriusGroupRequired={!isAccessRevoked}
        accessRevoked={isAccessRevoked}
      />
    );
  }

  // Show loading state during automatic authentication
  // In the simplified flow, we don't show the login screen - authentication is automatic
  if (!state.isAuthenticated && state.loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-logo">S</div>
        <div className="auth-title">SIRIUS Portal</div>
        <div className="auth-subtitle">Authenticating with ArcGIS Enterprise...</div>
        <div className="auth-info-text">
          If you cancel or close the login page, you'll be redirected to the public portal
        </div>
        <div className="login-loading">
          <div className="auth-spinner"></div>
        </div>
      </div>
    );
  }

  // If we get here and not authenticated, show login screen
  if (!state.isAuthenticated) {
    console.log('🔄 Not authenticated and not loading - showing login screen');
    
    // Check if user previously cancelled authentication
    const userCancelled = sessionStorage.getItem('auth_cancelled');
    
    if (userCancelled) {
      // User cancelled - show message and redirect to public portal after 30 seconds
      return (
        <div className="cancelled-auth-container">
          <div className="cancelled-auth-logo">S</div>
          <div className="cancelled-auth-title">SIRIUS Portal</div>
          <div className="cancelled-auth-content">
            <div className="cancelled-auth-warning">
              Authentication was cancelled
            </div>
            <div className="cancelled-auth-redirect">
              Redirecting you to the public portal in 30 seconds...
            </div>
          </div>
          <div className="cancelled-auth-footer">
            <a 
              href="https://publicgis.petronas.com/sirius-portal"
              className="login-link-large"
            >
              Continue to Public Portal Now →
            </a>
          </div>
        </div>
      );
    }
    
    return (
      <div className="login-container">
        <div className="login-logo">S</div>
        <div className="login-title">SIRIUS Portal</div>
        <div className="login-content">
          {state.error ? (
            <div className="login-error">
              Authentication failed: {state.error}
            </div>
          ) : null}
          <div className="login-instruction">
            Please sign in with your ArcGIS Enterprise account
          </div>
        </div>
        <button 
          onClick={() => signIn()}
          className="login-button"
        >
          Sign In with ArcGIS Enterprise
        </button>
        <div className="login-footer">
          <a 
            href="https://publicgis.petronas.com/sirius-portal"
            className="login-link"
          >
            Or visit the public portal →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="mobile-overlay" 
          onClick={toggleSidebar}
        />
      )}

      {/* Header */}
      <Header 
        onToggleSidebar={toggleSidebar}
        onToggleTheme={toggleTheme}
        onToggleLanguage={toggleLanguage}
        onLogout={signOut}
        isDarkTheme={isDarkTheme}
        currentLanguage={currentLanguage}
        user={state.user}
        userMicrosites={userMicrosites}
        onNavigateHome={handleNavigateHome}
      />

      {/* Main Layout */}
      <div className="main-layout">
        {/* Sidebar */}
        <Sidebar 
          isExpanded={sidebarExpanded}
          activePanel={activePanel}
          onPanelChange={handlePanelChange}
          isMobileOpen={isMobileOpen}
          currentLanguage={currentLanguage}
          panelWidth={panelWidth}
          isResizing={isResizing}
          onResizeStart={handleResizeStart}
          onViewChange={setCurrentView}
        />

        {/* Content Area with Routing */}
        <ErrorBoundary>
          <Routes>
            {/* Main Dashboard Route */}
            <Route path="/" element={
              currentView === 'maps-and-scenes' ? (
                <MapsAndScenes 
                  currentLanguage={currentLanguage} 
                  sidebarExpanded={sidebarExpanded}
                  panelWidth={panelWidth}
                />
              ) : (
                <Dashboard 
                  currentLanguage={currentLanguage} 
                  sidebarExpanded={sidebarExpanded}
                  panelWidth={panelWidth}
                />
              )
            } />
            
            {/* Dashboard redirect */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            
            {/* Microsite Landing Page */}
            <Route path="/microsites" element={
              <MicrositeLanding 
                sidebarExpanded={sidebarExpanded}
                panelWidth={panelWidth}
              />
            } />
            
            {/* Individual Microsite Routes */}
            <Route path="/microsites/*" element={<MicrositeRouter />} />
            
            {/* Legacy routes */}
            <Route path="/maps" element={<EsriMapView />} />
            <Route path="/profile" element={
              <Profile 
                currentLanguage={currentLanguage}
                sidebarExpanded={sidebarExpanded}
                panelWidth={panelWidth}
              />
            } />
            
            {/* OAuth Callback Route */}
            <Route path="/auth/callback" element={<OAuthCallbackHandler />} />
            <Route path="/login" element={<OAuthCallbackHandler />} />
            
            {/* Error Pages */}
            <Route path="/error/400" element={<Error400 />} />
            <Route path="/error/403" element={<Error403 />} />
            <Route path="/error/404" element={<Error404 />} />
            <Route path="/error/500" element={<Error500 />} />
            <Route path="/error/503" element={<Error503 />} />
            
            {/* Catch-all route - 404 for unknown pages */}
            <Route path="*" element={<Error404 />} />
          </Routes>
        </ErrorBoundary>
      </div>

      {/* Footer */}
      <footer className="footer">
        Geospatial Data Operations, Data Operations – Subsurface, Data – Upstream, 
        Upstream Technology, Digital, & Innovation (UTDI), Development, PETRONAS
      </footer>
    </div>
  );
}

export default App;