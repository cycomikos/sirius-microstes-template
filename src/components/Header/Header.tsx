import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClickOutside } from '../../hooks/useClickOutside';
import { getTranslation, TranslationKey, Language } from '../../utils/translations';
import { User } from '../../types/auth';
import siriusLogo from '../../assets/images/logo-sirius.jpeg';
import './Header.css';

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



  const handleLogoClick = () => {
    navigate('/');
    onNavigateHome?.();
  };


  // Click outside handlers
  const userDropdownRef = useClickOutside<HTMLDivElement>(
    () => setUserDropdownOpen(false),
    userDropdownOpen
  );

  return (
    <header className="header">
      <div className="header-left">
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