import React from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
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
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <div style={{ marginBottom: '20px' }}>Processing authentication...</div>
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = React.useState('dashboard');
  const { state, signIn, signOut } = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();
  const { currentLanguage, toggleLanguage } = useLanguage();
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

  // Sample microsite data for app launcher - organized by country
  const sampleMicrosites = [
    // Malaysia
    {
      id: 'refinery-ops-my',
      name: 'Refinery Operations',
      icon: '🏭',
      color: '#0079c1',
      url: 'https://refinery-my.petronas.com',
      description: 'Malaysia refinery monitoring and operations dashboard',
      country: 'Malaysia',
      countryFlag: '🇲🇾'
    },
    {
      id: 'exploration-my',
      name: 'Exploration Hub',
      icon: '🌍',
      color: '#00a19c',
      url: 'https://exploration-my.petronas.com',
      description: 'Malaysia geological data and exploration projects',
      country: 'Malaysia',
      countryFlag: '🇲🇾'
    },
    {
      id: 'safety-my',
      name: 'Safety Portal',
      icon: '🦺',
      color: '#e74c3c',
      url: 'https://safety-my.petronas.com',
      description: 'Malaysia safety incidents and compliance tracking',
      country: 'Malaysia',
      countryFlag: '🇲🇾'
    },
    // Singapore
    {
      id: 'supply-chain-sg',
      name: 'Supply Chain',
      icon: '📦',
      color: '#f39c12',
      url: 'https://supply-sg.petronas.com',
      description: 'Singapore vendor management and procurement',
      country: 'Singapore',
      countryFlag: '🇸🇬'
    },
    {
      id: 'trading-sg',
      name: 'Trading Hub',
      icon: '📈',
      color: '#8e44ad',
      url: 'https://trading-sg.petronas.com',
      description: 'Singapore oil trading and market analytics',
      country: 'Singapore',
      countryFlag: '🇸🇬'
    },
    // UAE
    {
      id: 'environmental-ae',
      name: 'Environmental',
      icon: '🌱',
      color: '#27ae60',
      url: 'https://environment-ae.petronas.com',
      description: 'UAE environmental monitoring and sustainability',
      country: 'UAE',
      countryFlag: '🇦🇪'
    },
    {
      id: 'logistics-ae',
      name: 'Logistics Center',
      icon: '🚛',
      color: '#34495e',
      url: 'https://logistics-ae.petronas.com',
      description: 'UAE logistics and distribution management',
      country: 'UAE',
      countryFlag: '🇦🇪'
    },
    // Canada
    {
      id: 'upstream-ca',
      name: 'Upstream Operations',
      icon: '⛽',
      color: '#d35400',
      url: 'https://upstream-ca.petronas.com',
      description: 'Canada upstream oil and gas operations',
      country: 'Canada',
      countryFlag: '🇨🇦'
    },
    {
      id: 'hr-ca',
      name: 'HR Portal',
      icon: '👥',
      color: '#9b59b6',
      url: 'https://hr-ca.petronas.com',
      description: 'Canada human resources and employee services',
      country: 'Canada',
      countryFlag: '🇨🇦'
    }
  ];

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
      accessDenied: !!state.accessDenied
    });
  }, [state.isAuthenticated, state.loading, state.user, state.error, state.accessDenied]);

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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '20px', fontSize: '48px' }}>S</div>
        <div style={{ marginBottom: '10px', fontSize: '24px', fontWeight: 'bold' }}>SIRIUS Portal</div>
        <div style={{ marginBottom: '10px' }}>Authenticating with ArcGIS Enterprise...</div>
        <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
          If you cancel or close the login page, you'll be redirected to the public portal
        </div>
        <div className="login-loading">
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #0079c1', 
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }



  // If we get here and not authenticated, show login screen
  if (!state.isAuthenticated) {
    console.log('🔄 Not authenticated and not loading - showing login screen');
    
    // Check if user previously cancelled authentication
    const userCancelled = sessionStorage.getItem('auth_cancelled');
    
    if (userCancelled) {
      // User cancelled - show message and redirect to public portal after 2 seconds
      
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>S</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>SIRIUS Portal</div>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ color: '#f39c12', marginBottom: '20px' }}>
              Authentication was cancelled
            </div>
            <div style={{ marginBottom: '10px' }}>
              Redirecting you to the public portal in 30 seconds...
            </div>
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#666',
            textAlign: 'center'
          }}>
            <a 
              href="https://publicgis.petronas.com/sirius-portal"
              style={{ color: '#0079c1', textDecoration: 'none', fontSize: '16px' }}
            >
              Continue to Public Portal Now →
            </a>
          </div>
        </div>
      );
    }
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>S</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>SIRIUS Portal</div>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {state.error ? (
            <div style={{ color: '#e74c3c', marginBottom: '20px' }}>
              Authentication failed: {state.error}
            </div>
          ) : null}
          <div style={{ marginBottom: '10px' }}>
            Please sign in with your ArcGIS Enterprise account
          </div>
        </div>
        <button 
          onClick={() => signIn()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#0079c1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Sign In with ArcGIS Enterprise
        </button>
        <div style={{ 
          marginTop: '20px', 
          fontSize: '14px', 
          color: '#666',
          textAlign: 'center'
        }}>
          <a 
            href="https://publicgis.petronas.com/sirius-portal"
            style={{ color: '#0079c1', textDecoration: 'none' }}
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
        userMicrosites={sampleMicrosites}
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
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
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