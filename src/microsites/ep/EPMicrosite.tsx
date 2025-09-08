import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { MicrositeProps } from '../../types/microsite';
import MicrositeLayout from '../../components/MicrositeLayout/MicrositeLayout';
import EPDashboard from './components/EPDashboard';
import EPMaps from './components/EPMaps';
import EPAnalytics from './components/EPAnalytics';
import { micrositeRegistry } from '../../services/micrositeRegistry';
import './EPMicrosite.css';

const EPMicrosite: React.FC<MicrositeProps> = ({
  config,
  user,
  currentLanguage,
  sidebarExpanded,
  panelWidth
}) => {
  const [activeTab, setActiveTab] = React.useState('dashboard');

  // Navigation tabs for EP microsite
  const navigationTabs = [
    {
      id: 'dashboard',
      label: currentLanguage === 'en' ? 'Dashboard' : 'Papan Pemuka',
      icon: '📊',
      component: EPDashboard
    },
    {
      id: 'maps',
      label: currentLanguage === 'en' ? 'Maps & Data' : 'Peta & Data',
      icon: '🗺️',
      component: EPMaps
    },
    {
      id: 'analytics',
      label: currentLanguage === 'en' ? 'Analytics' : 'Analitik',
      icon: '📈',
      component: EPAnalytics
    }
  ];

  const ActiveComponent = navigationTabs.find(tab => tab.id === activeTab)?.component || EPDashboard;

  return (
    <MicrositeLayout
      config={config}
      currentLanguage={currentLanguage}
      sidebarExpanded={sidebarExpanded}
      panelWidth={panelWidth}
    >
      <div className="ep-microsite">
        {/* Navigation Tabs */}
        <div className="ep-navigation">
          <div className="ep-nav-tabs">
            {navigationTabs.map(tab => (
              <button
                key={tab.id}
                className={`ep-nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="ep-nav-icon">{tab.icon}</span>
                <span className="ep-nav-label">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="ep-content">
          <Suspense fallback={
            <div className="ep-loading">
              <div className="loading-spinner"></div>
              <div className="loading-text">
                {currentLanguage === 'en' ? 'Loading E&P data...' : 'Memuatkan data E&P...'}
              </div>
            </div>
          }>
            <ActiveComponent 
              config={config}
              user={user}
              currentLanguage={currentLanguage}
              sidebarExpanded={sidebarExpanded}
              panelWidth={panelWidth}
            />
          </Suspense>
        </div>
      </div>
    </MicrositeLayout>
  );
};

export default EPMicrosite;