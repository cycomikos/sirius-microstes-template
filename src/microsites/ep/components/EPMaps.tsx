import React from 'react';
import { MicrositeProps } from '../../../types/microsite';
import EsriMapView from '../../../components/EsriMapView/EsriMapView';
import './EPMaps.css';

interface MapLayer {
  id: string;
  name: string;
  icon: string;
  visible: boolean;
}

interface MapData {
  layers: MapLayer[];
  extent: any;
  basemap: string;
}

const EPMaps: React.FC<MicrositeProps> = ({
  config,
  user,
  currentLanguage
}) => {
  const [selectedLayer, setSelectedLayer] = React.useState('exploration');
  const [mapData, setMapData] = React.useState<MapData | null>(null);

  // Map layers specific to E&P operations
  const mapLayers = [
    {
      id: 'exploration',
      name: currentLanguage === 'en' ? 'Exploration Sites' : 'Tapak Penerokaan',
      icon: '🔍',
      visible: selectedLayer === 'exploration'
    },
    {
      id: 'production',
      name: currentLanguage === 'en' ? 'Production Wells' : 'Telaga Pengeluaran',
      icon: '⛽',
      visible: selectedLayer === 'production'
    },
    {
      id: 'seismic',
      name: currentLanguage === 'en' ? 'Seismic Data' : 'Data Seismik',
      icon: '📊',
      visible: selectedLayer === 'seismic'
    },
    {
      id: 'geology',
      name: currentLanguage === 'en' ? 'Geological Layers' : 'Lapisan Geologi',
      icon: '🌍',
      visible: selectedLayer === 'geology'
    }
  ];

  React.useEffect(() => {
    // Load map data specific to EP microsite group
    const loadMapData = async () => {
      try {
        // This would fetch data from ArcGIS Enterprise using the group ID
        // 4a8b631d6f384dd8b8ca5b91c10c22f6
        console.log(`Loading map data for EP microsite group: ${config.requiredGroupId}`);
        
        // Simulate loading data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMapData({
          layers: mapLayers,
          extent: config.mapConfig.defaultExtent,
          basemap: config.mapConfig.basemap
        });
      } catch (error) {
        console.error('Failed to load EP map data:', error);
      }
    };

    loadMapData();
  }, [config.requiredGroupId, selectedLayer]);

  const handleLayerToggle = (layerId: string) => {
    setSelectedLayer(layerId);
  };

  return (
    <div className="ep-maps">
      {/* Map Controls */}
      <div className="map-controls">
        <div className="map-layers-panel">
          <h3 className="panel-title">
            {currentLanguage === 'en' ? 'Map Layers' : 'Lapisan Peta'}
          </h3>
          <div className="layers-list">
            {mapLayers.map(layer => (
              <button
                key={layer.id}
                className={`layer-toggle ${layer.visible ? 'active' : ''}`}
                onClick={() => handleLayerToggle(layer.id)}
              >
                <span className="layer-icon">{layer.icon}</span>
                <span className="layer-name">{layer.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="map-tools-panel">
          <h3 className="panel-title">
            {currentLanguage === 'en' ? 'Tools' : 'Alatan'}
          </h3>
          <div className="tools-list">
            <button className="tool-button">
              <span className="tool-icon">📏</span>
              <span className="tool-name">
                {currentLanguage === 'en' ? 'Measure' : 'Ukur'}
              </span>
            </button>
            <button className="tool-button">
              <span className="tool-icon">📍</span>
              <span className="tool-name">
                {currentLanguage === 'en' ? 'Mark Location' : 'Tanda Lokasi'}
              </span>
            </button>
            <button className="tool-button">
              <span className="tool-icon">🎯</span>
              <span className="tool-name">
                {currentLanguage === 'en' ? 'Identify' : 'Kenal Pasti'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="map-container">
        <EsriMapView />
        
        {/* Map Legend */}
        <div className="map-legend">
          <h4 className="legend-title">
            {currentLanguage === 'en' ? 'Legend' : 'Legenda'}
          </h4>
          <div className="legend-items">
            {selectedLayer === 'exploration' && (
              <>
                <div className="legend-item">
                  <div className="legend-symbol exploration-active"></div>
                  <span>{currentLanguage === 'en' ? 'Active Exploration' : 'Penerokaan Aktif'}</span>
                </div>
                <div className="legend-item">
                  <div className="legend-symbol exploration-planned"></div>
                  <span>{currentLanguage === 'en' ? 'Planned Sites' : 'Tapak Dirancang'}</span>
                </div>
              </>
            )}
            {selectedLayer === 'production' && (
              <>
                <div className="legend-item">
                  <div className="legend-symbol production-high"></div>
                  <span>{currentLanguage === 'en' ? 'High Production' : 'Pengeluaran Tinggi'}</span>
                </div>
                <div className="legend-item">
                  <div className="legend-symbol production-medium"></div>
                  <span>{currentLanguage === 'en' ? 'Medium Production' : 'Pengeluaran Sederhana'}</span>
                </div>
                <div className="legend-item">
                  <div className="legend-symbol production-low"></div>
                  <span>{currentLanguage === 'en' ? 'Low Production' : 'Pengeluaran Rendah'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Map Info Panel */}
      <div className="map-info">
        <div className="info-card">
          <h4 className="info-title">
            {currentLanguage === 'en' ? 'Current Layer Info' : 'Maklumat Lapisan Semasa'}
          </h4>
          <div className="info-content">
            {selectedLayer === 'exploration' && (
              <div>
                <p><strong>{currentLanguage === 'en' ? 'Active Sites:' : 'Tapak Aktif:'}</strong> 12</p>
                <p><strong>{currentLanguage === 'en' ? 'Planned Sites:' : 'Tapak Dirancang:'}</strong> 8</p>
                <p><strong>{currentLanguage === 'en' ? 'Last Updated:' : 'Kemaskini Terakhir:'}</strong> {new Date().toLocaleDateString()}</p>
              </div>
            )}
            {selectedLayer === 'production' && (
              <div>
                <p><strong>{currentLanguage === 'en' ? 'Active Wells:' : 'Telaga Aktif:'}</strong> 156</p>
                <p><strong>{currentLanguage === 'en' ? 'Total Production:' : 'Jumlah Pengeluaran:'}</strong> 95.7%</p>
                <p><strong>{currentLanguage === 'en' ? 'Last Updated:' : 'Kemaskini Terakhir:'}</strong> {new Date().toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EPMaps;