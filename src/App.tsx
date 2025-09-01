import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
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
        />

        {/* Content Area with Routing */}
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard currentLanguage={currentLanguage} />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            
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