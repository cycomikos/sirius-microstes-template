import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClickOutside } from '../../hooks/useClickOutside';
import { getTranslation, TranslationKey, Language } from '../../utils/translations';
import siriusLogo from '../../assets/images/logo-sirius.jpeg';
import './Header.css';

interface User {
  username: string;
  fullName: string;
  groups: string[];
  token: string;
}

interface UserMicrosite {
  id: string;
  name: string;
  icon: string;
  color: string;
  url: string;
  description?: string;
  lastAccessed?: Date;
  country: string;
  countryFlag: string;
}

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onToggleLanguage: () => void;
  onLogout: () => void;
  isDarkTheme: boolean;
  currentLanguage: Language;
  user: User | null;
  userMicrosites?: UserMicrosite[];
  onSyncMicrosites?: () => void;
  isLoadingMicrosites?: boolean;
  onNavigateHome?: () => void;
}

// Helper function to get translated text
const t = (key: TranslationKey, language: Language) => getTranslation(key, language);

const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  onToggleTheme, 
  onToggleLanguage,
  onLogout, 
  isDarkTheme,
  currentLanguage,
  user,
  userMicrosites = [],
  onSyncMicrosites,
  isLoadingMicrosites = false,
  onNavigateHome
}) => {
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [appLauncherOpen, setAppLauncherOpen] = useState(false);

  // Get user display info
  const userFullName = user?.fullName || t('developmentUser', currentLanguage);
  const userUsername = user?.username || 'dev-user';
  const userInitials = userFullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Event handlers
  const handleUserMenuClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    setUserDropdownOpen(!userDropdownOpen);
    setAppLauncherOpen(false);
  };

  const handleAppLauncherClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAppLauncherOpen(!appLauncherOpen);
    setUserDropdownOpen(false);
  };

  const handleThemeToggle = () => {
    onToggleTheme();
    setUserDropdownOpen(false);
  };

  const handleLanguageToggle = () => {
    onToggleLanguage();
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setUserDropdownOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setUserDropdownOpen(false);
  };

  const handleMicrositeClick = (microsite: UserMicrosite) => {
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
  };


  const handleLogoClick = () => {
    navigate('/');
    onNavigateHome?.();
  };

  // Group microsites by country
  const groupedMicrosites = React.useMemo(() => {
    const groups: { [country: string]: UserMicrosite[] } = {};
    userMicrosites.forEach(microsite => {
      if (!groups[microsite.country]) {
        groups[microsite.country] = [];
      }
      groups[microsite.country].push(microsite);
    });
    return groups;
  }, [userMicrosites]);

  // Click outside handlers
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
        <button 
          className="menu-toggle" 
          onClick={onToggleSidebar}
          aria-label={t('toggleSidebar', currentLanguage)}
        >
          ☰
        </button>
        
        <div 
          className="logo-section"
          onClick={handleLogoClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLogoClick();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label={t('goToDashboard', currentLanguage)}
          title={t('goToDashboard', currentLanguage)}
        >
          <img src={siriusLogo} alt={t('siriusLogo', currentLanguage)} className="logo-icon" />
          <div className="logo-text">
            <h1>{t('appName', currentLanguage)}</h1>
            <span>{t('appDescription', currentLanguage)}</span>
          </div>
        </div>
      </div>
      
      <div className="header-right">
        {/* App Launcher */}
        <div className="app-launcher" ref={appLauncherRef}>
          <button 
            className="app-launcher-button" 
            onClick={handleAppLauncherClick}
            title={t('myApplications', currentLanguage)}
            aria-label={t('myApplications', currentLanguage)}
            aria-expanded={appLauncherOpen}
            aria-haspopup="true"
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
              <h3>{t('myApplications', currentLanguage)}</h3>
              <p className="app-count">
                {userMicrosites.length} {userMicrosites.length !== 1 ? t('applicationsAvailable', currentLanguage) : t('application', currentLanguage)}
              </p>
            </div>
            
            {isLoadingMicrosites ? (
              <div className="loading-state">
                <div className="loading-spinner" aria-label={t('loading', currentLanguage)}></div>
                <p>{t('loadingApplications', currentLanguage)}</p>
              </div>
            ) : userMicrosites.length > 0 ? (
              <div className="app-grid-container">
                {Object.entries(groupedMicrosites).map(([country, apps]) => (
                  <div key={country} className="country-section">
                    <div className="country-header">
                      <span className="country-flag">{apps[0].countryFlag}</span>
                      <h4 className="country-name">{country}</h4>
                      <span className="country-count">({apps.length})</span>
                    </div>
                    <div className="app-grid">
                      {apps.map((app) => (
                        <div 
                          key={app.id}
                          className="app-item"
                          onClick={() => handleMicrositeClick(app)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleMicrositeClick(app);
                            }
                          }}
                          title={app.description || app.name}
                          tabIndex={0}
                          role="button"
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📱</div>
                <p>{t('noApplicationsAvailable', currentLanguage)}</p>
                <span className="empty-subtitle">
                  {t('contactAdministrator', currentLanguage)}
                </span>
              </div>
            )}
            
            <div className="app-launcher-footer">
              <button 
                className="sync-button"
                onClick={handleSyncMicrosites}
                disabled={isLoadingMicrosites}
                title={t('refreshApplications', currentLanguage)}
              >
                <span>🔄</span>
                {isLoadingMicrosites ? t('syncing', currentLanguage) : t('refresh', currentLanguage)}
              </button>
            </div>
          </div>
        </div>


        {/* User Avatar */}
        <div 
          className="user-avatar"
          onClick={handleUserMenuClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleUserMenuClick(e);
            }
          }}
          title={`User menu for ${userFullName}`}
          tabIndex={0}
          role="button"
          aria-expanded={userDropdownOpen}
          aria-haspopup="true"
        >
          {userInitials}
        </div>
        
        {/* User Details */}
        <div 
          className="user-details"
          onClick={handleUserMenuClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleUserMenuClick(e);
            }
          }}
          title={`User menu for ${userFullName}`}
          tabIndex={0}
          role="button"
          aria-expanded={userDropdownOpen}
          aria-haspopup="true"
        >
          <div className="user-full-name">{userFullName}</div>
          <div className="user-username">{userUsername}</div>
        </div>

        {/* User Menu Dropdown */}
        <div className="user-menu" ref={userDropdownRef}>
          
          <div className={`dropdown ${userDropdownOpen ? 'active' : ''}`} role="menu">
            <div 
              className="dropdown-item" 
              onClick={handleProfileClick}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleProfileClick();
                }
              }}
            >
              <span>👤</span>
              {t('myProfile', currentLanguage)}
            </div>
            
            <div 
              className="dropdown-item" 
              onClick={handleThemeToggle}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleThemeToggle();
                }
              }}
            >
              <span>{isDarkTheme ? '☀️' : '🌙'}</span>
              {isDarkTheme ? t('lightMode', currentLanguage) : t('darkMode', currentLanguage)}
            </div>
            
            <div 
              className="dropdown-item" 
              onClick={handleLanguageToggle}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLanguageToggle();
                }
              }}
            >
              <span>🌐</span>
              {t('language', currentLanguage)} ({currentLanguage.toUpperCase()})
            </div>
            
            
            <div 
              className="dropdown-item" 
              onClick={handleLogout}
              role="menuitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLogout();
                }
              }}
            >
              <span>🚪</span>
              {t('signOut', currentLanguage)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;