import React, { useMemo, useCallback } from 'react';
import { CalciteIcon } from '@esri/calcite-components-react';
import { Language } from '../../utils/translations';
import { useTranslation, calculateLayoutStyles } from '../../utils/componentHelpers';
import { logger, LogCategory } from '../../utils/logger';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import './MapsAndScenes.css';

interface MapItem {
  id: string;
  title: string;
  icon: string;
  iconType: 'emoji' | 'calcite';
  updated: string;
  thumbnail?: boolean;
}

interface MapsAndScenesProps {
  currentLanguage?: Language;
  sidebarExpanded?: boolean;
  panelWidth?: number;
}

const MapsAndScenes: React.FC<MapsAndScenesProps> = ({ currentLanguage = 'en', sidebarExpanded = false, panelWidth = 280 }) => {
  const t = useTranslation(currentLanguage);

  const layoutStyles = useMemo(() => 
    calculateLayoutStyles(sidebarExpanded, panelWidth),
    [sidebarExpanded, panelWidth]
  );

  const breadcrumbItems = useMemo(() => [
    { 
      label: t('home'), 
      href: '/',
      ariaLabel: `${t('home')} - Navigate to home page`
    },
    { 
      label: t('mapsScenes'), 
      isActive: true,
      ariaLabel: `${t('mapsScenes')} - Current page`
    }
  ], [t]);

  const handleBreadcrumbNavigate = useCallback((href: string) => {
    logger.debug('Navigating to breadcrumb', LogCategory.UI, { href });
  }, []);

  const mapItems: MapItem[] = [
    {
      id: '1',
      title: t('malaysiaBaseMap'),
      icon: '🗺️',
      iconType: 'emoji',
      updated: t('updatedDaysAgo'),
      thumbnail: true
    },
    {
      id: '2',
      title: t('globalOperations'),
      icon: 'globe',
      iconType: 'calcite',
      updated: t('updatedWeekAgo')
    },
    {
      id: '3',
      title: t('oilFieldsMap'),
      icon: 'folder',
      iconType: 'calcite',
      updated: t('updated3DaysAgo')
    },
    {
      id: '4',
      title: t('pipelineNetwork'),
      icon: 'pin',
      iconType: 'calcite',
      updated: t('updated5DaysAgo')
    }
  ];

  return (
    <main className="content-area" style={layoutStyles}>
      <div className="content-wrapper">
        <Breadcrumb 
          items={breadcrumbItems} 
          currentLanguage={currentLanguage}
          onNavigate={handleBreadcrumbNavigate}
        />

        <div className="section-header">
          <CalciteIcon icon="layer" className="section-icon" />
          <h2>{t('mapsScenes')}</h2>
        </div>

        <div className="microsites-grid">
          {mapItems.map((item) => (
            <div key={item.id} className="map-card">
              <div className="map-thumbnail">
                {item.thumbnail ? (
                  <div className="thumbnail-image">
                    <span className="map-emoji">{item.icon}</span>
                  </div>
                ) : (
                  <div className="icon-container">
                    {item.iconType === 'calcite' ? (
                      <CalciteIcon icon={item.icon} />
                    ) : (
                      <span>{item.icon}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="map-info">
                <h3>{item.title}</h3>
                <p>{item.updated}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default MapsAndScenes;