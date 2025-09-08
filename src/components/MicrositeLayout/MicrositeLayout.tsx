import React from 'react';
import { MicrositeConfig, Language } from '../../types/microsite';
import { useTheme } from '../../hooks/useTheme';
import './MicrositeLayout.css';

interface MicrositeLayoutProps {
  config: MicrositeConfig;
  currentLanguage: Language;
  sidebarExpanded: boolean;
  panelWidth: number;
  children: React.ReactNode;
}

const MicrositeLayout: React.FC<MicrositeLayoutProps> = ({
  config,
  currentLanguage,
  sidebarExpanded,
  panelWidth,
  children
}) => {
  const { isDarkTheme } = useTheme();

  // Apply microsite-specific theme
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--microsite-primary', config.theme.primary);
    root.style.setProperty('--microsite-secondary', config.theme.secondary);
    root.style.setProperty('--microsite-accent', config.theme.accent);
    
    return () => {
      // Cleanup on unmount
      root.style.removeProperty('--microsite-primary');
      root.style.removeProperty('--microsite-secondary');
      root.style.removeProperty('--microsite-accent');
    };
  }, [config.theme]);

  const layoutClass = `microsite-layout microsite-layout--${config.layout}`;
  const themeClass = isDarkTheme ? 'theme-dark' : 'theme-light';
  
  return (
    <div 
      className={`${layoutClass} ${themeClass}`}
      style={{
        marginLeft: sidebarExpanded ? `${panelWidth}px` : '60px',
        transition: 'margin-left 0.3s ease-in-out'
      }}
    >
      {/* Microsite Header */}
      <div className="microsite-header">
        <div className="microsite-header-content">
          <div className="microsite-header-icon">{config.icon}</div>
          <div className="microsite-header-text">
            <h1 className="microsite-title">
              {config.title[currentLanguage]}
            </h1>
            <p className="microsite-description">
              {config.description[currentLanguage]}
            </p>
          </div>
          <div className="microsite-header-status">
            <span className={`status-badge status-${config.status}`}>
              {config.status}
            </span>
          </div>
        </div>
      </div>

      {/* Microsite Content */}
      <div className="microsite-content">
        {children}
      </div>

      {/* Microsite Footer */}
      <div className="microsite-footer">
        <div className="microsite-metadata">
          <span>v{config.metadata.version}</span>
          <span>•</span>
          <span>{config.metadata.createdBy}</span>
        </div>
      </div>
    </div>
  );
};

export default MicrositeLayout;