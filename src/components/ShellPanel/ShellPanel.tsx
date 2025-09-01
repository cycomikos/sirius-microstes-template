import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../../constants';
import { Language } from '../../utils/translations';
import { useTranslation, TranslationKey } from '../../utils/componentHelpers';
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
  onViewChange?: (view: string) => void;
}

const ShellPanel: React.FC<ShellPanelProps> = ({ 
  activePanel, 
  isVisible, 
  currentLanguage, 
  panelWidth, 
  isResizing, 
  onResizeStart,
  onViewChange 
}) => {
  const t = useTranslation(currentLanguage);
  const navigate = useNavigate();
  const createPanelItem = useCallback((id: string, icon: string, titleKey: TranslationKey, descriptionKey: TranslationKey, onClick?: () => void) => ({
    id,
    title: `${icon} ${t(titleKey)}`,
    description: t(descriptionKey),
    icon,
    onClick
  }), [t]);

  const navigateToMaps = useCallback(() => {
    navigate('/maps');
  }, [navigate]);

  const navigateToMapsAndScenes = useCallback(() => {
    if (onViewChange) {
      onViewChange('maps-and-scenes');
    }
  }, [onViewChange]);

  const navigateToDashboard = useCallback(() => {
    if (onViewChange) {
      onViewChange('dashboard');
    }
  }, [onViewChange]);

  const handleItemClick = useCallback((item: PanelItem) => {
    if (item.onClick) {
      item.onClick();
    } else {
      console.log('Clicked:', item.title);
    }
  }, []);

  const panelData: Record<string, PanelData> = useMemo(() => ({
    applications: {
      title: t('applications'),
      stats: [
        { value: '16', label: t('totalApps') },
        { value: '5', label: t('accessible') }
      ],
      items: [
        createPanelItem('1', '🔥', 'recentlyAccessed', 'viewRecentApps'),
        createPanelItem('2', '⭐', 'favorites', 'quickAccessStarred'),
        createPanelItem('3', '📊', 'analyticsDashboard', 'usageStatistics')
      ]
    },
    maps: {
      title: t('mapsScenes'),
      items: [
        createPanelItem('1', '🗺️', 'malaysiaBaseMap', 'updatedDaysAgo', navigateToMapsAndScenes),
        createPanelItem('2', '🌍', 'globalOperations', 'updatedWeekAgo', navigateToMaps),
        createPanelItem('3', '🛢️', 'oilFieldsMap', 'updated3DaysAgo', navigateToMaps),
        createPanelItem('4', '📍', 'pipelineNetwork', 'updated5DaysAgo', navigateToMaps)
      ]
    },
    layers: {
      title: t('dataLayers'),
      items: [
        createPanelItem('1', '🔷', 'explorationBlocks', 'polygonFeatures'),
        createPanelItem('2', '📍', 'wellLocations', 'pointFeatures'),
        createPanelItem('3', '🛤️', 'pipelines', 'lineFeatures'),
        createPanelItem('4', '🏭', 'facilities', 'pointFeatures2')
      ]
    },
    data: {
      title: t('dataManagement'),
      stats: [
        { value: '2.5TB', label: t('storageUsed') },
        { value: '847', label: t('datasets') }
      ],
      items: [
        createPanelItem('1', '📤', 'uploadData', 'importDatasets'),
        createPanelItem('2', '🔄', 'dataProcessing', 'etlWorkflows'),
        createPanelItem('3', '📊', 'qualityCheck', 'validationTools')
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
        createPanelItem('2', '🔧', 'buildInformation', 'builtWithReact'),
        createPanelItem('3', '📅', 'releaseDate', 'latestRelease'),
        createPanelItem('4', '📖', 'documentation', 'userGuideApi')
      ]
    }
  }), [t, createPanelItem, navigateToMaps]);

  const currentPanel: PanelData | undefined = panelData[activePanel];

  if (!currentPanel) return null;

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