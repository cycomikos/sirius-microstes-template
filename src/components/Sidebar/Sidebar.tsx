import React from 'react';
import ShellPanel from '../ShellPanel/ShellPanel';
import { APP_CONFIG } from '../../constants';
import './Sidebar.css';

interface SidebarProps {
  isExpanded: boolean;
  activePanel: string;
  onPanelChange: (panel: string) => void;
  isMobileOpen?: boolean;
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
  isMobileOpen = false 
}) => {
  const navItems: NavItem[] = [
    { id: 'applications', icon: '📱', label: 'Applications', tooltip: 'Applications' },
    { id: 'maps', icon: '🗺️', label: 'Maps', tooltip: 'Maps & Scenes' },
    { id: 'layers', icon: '📑', label: 'Layers', tooltip: 'Data Layers' },
    { id: 'data', icon: '💾', label: 'Data', tooltip: 'Data Management' }
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
        data-tooltip={`Version ${APP_CONFIG.VERSION}`}
        onClick={handleVersionClick}
      >
        <span className="nav-icon">❓</span>
        <span className="nav-text">Version {APP_CONFIG.VERSION}</span>
      </div>
      
      <div className="resize-handle"></div>
      
      <ShellPanel 
        activePanel={activePanel} 
        isVisible={isExpanded || isMobileOpen}
      />
    </aside>
  );
};

export default Sidebar;