import React from 'react';
import { CalciteIcon } from '@esri/calcite-components-react';
import './MapsAndScenes.css';

interface MapItem {
  id: string;
  title: string;
  icon: string;
  iconType: 'emoji' | 'calcite';
  updated: string;
  thumbnail?: boolean;
}

const MapsAndScenes: React.FC = () => {
  const mapItems: MapItem[] = [
    {
      id: '1',
      title: 'Malaysia Base Map',
      icon: '🗺️',
      iconType: 'emoji',
      updated: '2 days ago',
      thumbnail: true
    },
    {
      id: '2',
      title: 'Global Operations',
      icon: 'globe',
      iconType: 'calcite',
      updated: '1 week ago'
    },
    {
      id: '3',
      title: 'Oil Fields Map',
      icon: 'folder',
      iconType: 'calcite',
      updated: '3 days ago'
    },
    {
      id: '4',
      title: 'Pipeline Network',
      icon: 'pin',
      iconType: 'calcite',
      updated: '5 days ago'
    }
  ];

  return (
    <div className="maps-scenes-container">
      <div className="sirius-header">
        <div className="sirius-logo">
          <span className="logo-icon">S</span>
          <div className="header-text">
            <h1>SIRIUS Portal</h1>
            <p>Enterprise GIS Platform</p>
          </div>
        </div>
      </div>

      <div className="maps-scenes-content">
        <div className="section-header">
          <CalciteIcon icon="layer" className="section-icon" />
          <h2>Maps &amp; Scenes</h2>
        </div>

        <div className="maps-list">
          {mapItems.map((item) => (
            <div key={item.id} className="map-item">
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
                <p>Updated: {item.updated}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="help-section">
          <CalciteIcon icon="question" className="help-icon" />
        </div>
      </div>
    </div>
  );
};

export default MapsAndScenes;