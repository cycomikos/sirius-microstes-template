import React, { useState } from 'react';
import { User } from '../../types/auth';
import { useClickOutside } from '../../hooks/useClickOutside';
import { APP_CONFIG } from '../../constants';
import './Header.css';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  isDarkTheme: boolean;
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  onToggleTheme, 
  onLogout, 
  isDarkTheme,
  user 
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const userFullName = user?.fullName || 'User';
  const userInitials = userFullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleToggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'en' ? 'ms' : 'en');
    setUserDropdownOpen(false);
  };

  const handleUserMenuClick = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  const handleThemeToggle = () => {
    onToggleTheme();
    setUserDropdownOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setUserDropdownOpen(false);
  };

  const dropdownRef = useClickOutside<HTMLDivElement>(
    () => setUserDropdownOpen(false),
    userDropdownOpen
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
        <span className="welcome-text">
          Welcome, {userFullName}
        </span>
        
        <div className="user-menu" ref={dropdownRef}>
          <div 
            className="user-avatar" 
            onClick={handleUserMenuClick}
            title={`User menu for ${userFullName}`}
          >
            {userInitials}
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