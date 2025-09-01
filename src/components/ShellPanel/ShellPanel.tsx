import React from 'react';
import { APP_CONFIG } from '../../constants';
import { getTranslation, Language, translations } from '../../utils/translations';
import './ShellPanel.css';

interface PanelItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  onClick?: () => void;
}

interface StatCard {
  value: string;
  label: string;
}

interface PanelData {
  title: string;
  stats?: StatCard[];
  items: PanelItem[];
}

interface ShellPanelProps {
  activePanel: string;
  isVisible: boolean;
  currentLanguage: Language;
  panelWidth: number;
  isResizing: boolean;
  onResizeStart: (e: React.MouseEvent) => void;
}

const ShellPanel: React.FC<ShellPanelProps> = ({ 
  activePanel, 
  isVisible, 
  currentLanguage, 
  panelWidth, 
  isResizing, 
  onResizeStart 
}) => {
  // Helper function to get translated text
  const t = (key: keyof typeof translations.en) => getTranslation(key, currentLanguage);
  const panelData: Record<string, PanelData> = {
    applications: {
      title: t('applications'),
      stats: [
        { value: '16', label: t('totalApps') },
        { value: '5', label: t('accessible') }
      ],
      items: [
        {
          id: '1',
          title: `🔥 ${t('recentlyAccessed')}`,
          description: t('viewRecentApps'),
          icon: '🔥'
        },
        {
          id: '2',
          title: `⭐ ${t('favorites')}`,
          description: t('quickAccessStarred'),
          icon: '⭐'
        },
        {
          id: '3',
          title: `📊 ${t('analyticsDashboard')}`,
          description: t('usageStatistics'),
          icon: '📊'
        }
      ]
    },
    maps: {
      title: t('mapsScenes'),
      items: [
        {
          id: '1',
          title: `🗺️ ${t('malaysiaBaseMap')}`,
          description: t('updatedDaysAgo'),
          icon: '🗺️'
        },
        {
          id: '2',
          title: `🌍 ${t('globalOperations')}`,
          description: t('updatedWeekAgo'),
          icon: '🌍'
        },
        {
          id: '3',
          title: `🛢️ ${t('oilFieldsMap')}`,
          description: t('updated3DaysAgo'),
          icon: '🛢️'
        },
        {
          id: '4',
          title: `📍 ${t('pipelineNetwork')}`,
          description: t('updated5DaysAgo'),
          icon: '📍'
        }
      ]
    },
    layers: {
      title: t('dataLayers'),
      items: [
        {
          id: '1',
          title: `🔷 ${t('explorationBlocks')}`,
          description: t('polygonFeatures'),
          icon: '🔷'
        },
        {
          id: '2',
          title: `📍 ${t('wellLocations')}`,
          description: t('pointFeatures'),
          icon: '📍'
        },
        {
          id: '3',
          title: `🛤️ ${t('pipelines')}`,
          description: t('lineFeatures'),
          icon: '🛤️'
        },
        {
          id: '4',
          title: `🏭 ${t('facilities')}`,
          description: t('pointFeatures2'),
          icon: '🏭'
        }
      ]
    },
    data: {
      title: t('dataManagement'),
      stats: [
        { value: '2.5TB', label: t('storageUsed') },
        { value: '847', label: t('datasets') }
      ],
      items: [
        {
          id: '1',
          title: `📤 ${t('uploadData')}`,
          description: t('importDatasets'),
          icon: '📤'
        },
        {
          id: '2',
          title: `🔄 ${t('dataProcessing')}`,
          description: t('etlWorkflows'),
          icon: '🔄'
        },
        {
          id: '3',
          title: `📊 ${t('qualityCheck')}`,
          description: t('validationTools'),
          icon: '📊'
        }
      ]
    },
    version: {
      title: t('versionInformation'),
      stats: [
        { value: APP_CONFIG.VERSION, label: t('version') },
        { value: 'React', label: t('framework') }
      ],
      items: [
        {
          id: '1',
          title: `📋 ${t('applicationDetails')}`,
          description: `${t('appName')} - ${t('appDescription')}`,
          icon: '📋'
        },
        {
          id: '2',
          title: `🔧 ${t('buildInformation')}`,
          description: t('builtWithReact'),
          icon: '🔧'
        },
        {
          id: '3',
          title: `📅 ${t('releaseDate')}`,
          description: t('latestRelease'),
          icon: '📅'
        },
        {
          id: '4',
          title: `📖 ${t('documentation')}`,
          description: t('userGuideApi'),
          icon: '📖'
        }
      ]
    }
  };

  const currentPanel: PanelData | undefined = panelData[activePanel];

  if (!currentPanel) return null;

  const handleItemClick = (item: PanelItem) => {
    if (item.onClick) {
      item.onClick();
    } else {
      console.log('Clicked:', item.title);
    }
  };

  return (
    <div 
      className={`shell-panel-wrapper ${isVisible ? 'visible' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{ width: `${panelWidth}px` }}
    >
      <div className="shell-panel">
        <div className="shell-panel-header">
          {currentPanel.title}
        </div>
        
        {currentPanel.stats && (
          <div className="panel-stats">
            {currentPanel.stats.map((stat: StatCard, index: number) => (
              <div key={index} className="stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="panel-content">
          {currentPanel.items.map((item) => (
            <div
              key={item.id}
              className="panel-item"
              onClick={() => handleItemClick(item)}
            >
              <div className="panel-item-title">{item.title}</div>
              <div className="panel-item-desc">{item.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div 
        className="resize-handle"
        onMouseDown={onResizeStart}
      />
    </div>
  );
};

export default ShellPanel;