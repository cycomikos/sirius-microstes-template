import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
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

function App() {
  const [currentView, setCurrentView] = React.useState('dashboard');
  const { state, signOut } = useAuth();
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

  // Show Error 403 if user is denied access due to Sirius Users group requirement
  if (state.accessDenied) {
    return (
      <Error403 
        requiredRole="Sirius Users Group" 
        resource="SIRIUS Portal"
        siriusGroupRequired={true}
      />
    );
  }

  if (!state.isAuthenticated) {
    return <Login onLogin={() => {}} />;
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