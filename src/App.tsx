import React from 'react';
import Login from './components/Login/Login';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './hooks/useTheme';
import { useSidebar } from './hooks/useSidebar';
import './App.css';

function App() {
  const { state, signOut } = useAuth();
  const { isDarkTheme, toggleTheme } = useTheme();
  const {
    sidebarExpanded,
    activePanel,
    isMobileOpen,
    toggleSidebar,
    handlePanelChange
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
        onLogout={signOut}
        isDarkTheme={isDarkTheme}
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
        />

        {/* Content Area */}
        <Dashboard />
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