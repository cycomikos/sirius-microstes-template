import React, { useState } from 'react';
import { User } from '../../types/auth';
import { useClickOutside } from '../../hooks/useClickOutside';
import { APP_CONFIG } from '../../constants';
import './Header.css';

interface UserMicrosite {
  id: string;
  name: string;
  icon: string;
  color: string;
  url: string;
  description?: string;
  lastAccessed?: Date;
}

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  isDarkTheme: boolean;
  user: User | null;
  userMicrosites?: UserMicrosite[];
  onSyncMicrosites?: () => void;
  isLoadingMicrosites?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  onToggleTheme, 
  onLogout, 
  isDarkTheme,
  user,
  userMicrosites = [],
  onSyncMicrosites,
  isLoadingMicrosites = false
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [appLauncherOpen, setAppLauncherOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const userFullName = user?.fullName || 'User';
  const userInitials = userFullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleToggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'en' ? 'ms' : 'en');
    setUserDropdownOpen(false);
  };

  const handleUserMenuClick = () => {
    setUserDropdownOpen(!userDropdownOpen);
    setAppLauncherOpen(false);
  };

  const handleAppLauncherClick = () => {
    setAppLauncherOpen(!appLauncherOpen);
    setUserDropdownOpen(false);
  };

  const handleThemeToggle = () => {
    onToggleTheme();
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setUserDropdownOpen(false);
  };

  const handleMicrositeClick = (microsite: UserMicrosite) => {
    // Navigate to the microsite - user already has access
    if (microsite.url) {
      if (microsite.url.startsWith('http')) {
        // External URL
        window.open(microsite.url, '_blank', 'noopener,noreferrer');
      } else {
        // Internal route
        window.location.href = microsite.url;
      }
    }
    setAppLauncherOpen(false);
  };

  const handleSyncMicrosites = () => {
    onSyncMicrosites?.();
    setAppLauncherOpen(false);
  };

  const userDropdownRef = useClickOutside<HTMLDivElement>(
    () => setUserDropdownOpen(false),
    userDropdownOpen
  );

  const appLauncherRef = useClickOutside<HTMLDivElement>(
    () => setAppLauncherOpen(false),
    appLauncherOpen
  );

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onToggleSidebar}>
          ☰
        </button>
        <div className="logo-section">
          <div className="logo-icon">S</div>
          <div className="logo-text">
            <h1>{APP_CONFIG.APP_NAME}</h1>
            <span>{APP_CONFIG.APP_DESCRIPTION}</span>
          </div>
        </div>
      </div>
      
      <div className="header-right">
        {/* App Launcher */}
        <div className="app-launcher" ref={appLauncherRef}>
          <button 
            className="app-launcher-button" 
            onClick={handleAppLauncherClick}
            title="App Launcher"
            aria-label="Open app launcher"
          >
            <div className="nine-dot-grid">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </button>
          
          <div className={`app-launcher-dropdown ${appLauncherOpen ? 'active' : ''}`}>
            <div className="app-launcher-header">
              <h3>My Microsites</h3>
              <p className="app-count">{userMicrosites.length} microsites available</p>
            </div>
            
            {isLoadingMicrosites ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading your microsites...</p>
              </div>
            ) : userMicrosites.length > 0 ? (
              <div className="app-grid">
                {userMicrosites.map((app) => (
                  <div 
                    key={app.id}
                    className="app-item"
                    onClick={() => handleMicrositeClick(app)}
                    title={app.description || app.name}
                  >
                    <div 
                      className="app-icon"
                      style={{ backgroundColor: app.color }}
                    >
                      {app.icon}
                    </div>
                    <span className="app-name">{app.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📱</div>
                <p>No microsite available</p>
                <span className="empty-subtitle">Contact your administrator to request access</span>
              </div>
            )}
            
            <div className="app-launcher-footer">
              <button 
                className="sync-button"
                onClick={handleSyncMicrosites}
                disabled={isLoadingMicrosites}
                title="Refresh your available applications"
              >
                {isLoadingMicrosites ? '🔄 Syncing...' : '🔄 Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* User Menu */}
        <div className="user-menu" ref={userDropdownRef}>
          <div 
            className="user-info" 
            onClick={handleUserMenuClick}
            title={`User menu for ${userFullName}`}
          >
            <div className="user-avatar">
              {userInitials}
            </div>
            <div className="user-details">
              <div className="user-full-name">{userFullName}</div>
              <div className="user-username">{user?.username || 'user'}</div>
            </div>
          </div>
          
          <div className={`dropdown ${userDropdownOpen ? 'active' : ''}`}>
            <div className="dropdown-item">
              👤 My Profile
            </div>
            <div className="dropdown-item" onClick={handleThemeToggle}>
              {isDarkTheme ? '☀️' : '🌙'} Toggle Theme
            </div>
            <div className="dropdown-item" onClick={handleToggleLanguage}>
              🌐 Language ({currentLanguage.toUpperCase()})
            </div>
            <div className="dropdown-item" onClick={handleLogout}>
              🚪 Sign Out
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;