import React from 'react';
import ShellPanel from '../ShellPanel/ShellPanel';
import { APP_CONFIG } from '../../constants';
import { getTranslation, Language, translations } from '../../utils/translations';
import './Sidebar.css';

interface SidebarProps {
  isExpanded: boolean;
  activePanel: string;
  onPanelChange: (panel: string) => void;
  isMobileOpen?: boolean;
  currentLanguage: Language;
  panelWidth: number;
  isResizing: boolean;
  onResizeStart: (e: React.MouseEvent) => void;
}

interface NavItem {
  id: string;
  icon: string;
  label: string;
  tooltip: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isExpanded, 
  activePanel, 
  onPanelChange, 
  isMobileOpen = false,
  currentLanguage,
  panelWidth,
  isResizing,
  onResizeStart
}) => {
  // Helper function to get translated text
  const t = (key: keyof typeof translations.en) => getTranslation(key, currentLanguage);
  
  const navItems: NavItem[] = [
    { id: 'applications', icon: '📱', label: t('applications'), tooltip: t('applications') },
    { id: 'maps', icon: '🗺️', label: t('maps'), tooltip: t('mapsScenes') },
    { id: 'layers', icon: '📑', label: t('layers'), tooltip: t('dataLayers') },
    { id: 'data', icon: '💾', label: t('data'), tooltip: t('dataManagement') }
  ];

  const handleNavClick = (panelId: string) => {
    onPanelChange(panelId);
  };

  const handleVersionClick = () => {
    onPanelChange('version');
  };

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item ${activePanel === item.id ? 'active' : ''}`}
            data-panel={item.id}
            data-tooltip={item.tooltip}
            onClick={() => handleNavClick(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </div>
        ))}
      </nav>
      
      <div 
        className={`nav-item version-info ${activePanel === 'version' ? 'active' : ''}`} 
        data-tooltip={`${t('version')} ${APP_CONFIG.VERSION}`}
        onClick={handleVersionClick}
      >
        <span className="nav-icon">❓</span>
        <span className="nav-text">{t('version')} {APP_CONFIG.VERSION}</span>
      </div>
      
      <ShellPanel 
        activePanel={activePanel} 
        isVisible={isExpanded || isMobileOpen}
        currentLanguage={currentLanguage}
        panelWidth={panelWidth}
        isResizing={isResizing}
        onResizeStart={onResizeStart}
      />
    </aside>
  );
};

export default Sidebar;