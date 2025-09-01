import React, { useEffect, useRef, useState } from 'react';
import { 
  CalciteShell,
  CalciteShellPanel,
  CalciteActionBar,
  CalciteAction,
  CalcitePanel,
  CalciteBlock,
  CalciteLoader,
  CalciteCard,
  CalciteChip,
  CalciteIcon
} from '@esri/calcite-components-react';
import './EsriMapView.css';

// Declare ArcGIS Map Components for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'arcgis-map': any;
      'arcgis-zoom': any;
      'arcgis-layer-list': any;
      'arcgis-basemap-gallery': any;
      'arcgis-legend': any;
      'arcgis-bookmarks': any;
      'arcgis-print': any;
    }
  }
}

interface EsriMapViewProps {
  onMapLoad?: (mapElement: any) => void;
}

const EsriMapView: React.FC<EsriMapViewProps> = ({ onMapLoad }) => {
  const mapRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeWidget, setActiveWidget] = useState<string>('');
  const [mapInfo, setMapInfo] = useState<{
    title?: string;
    thumbnailUrl?: string;
    snippet?: string;
    modified?: string;
    tags?: string[];
  }>({});

  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

    const handleViewReady = () => {
      console.log('✅ ArcGIS Map loaded successfully');
      setLoading(false);
      
      // Get map information from portal item
      const { map } = mapElement;
      if (map && map.portalItem) {
        const { title, thumbnailUrl, snippet, modified, tags } = map.portalItem;
        setMapInfo({
          title: title || 'Interactive Map',
          thumbnailUrl,
          snippet,
          modified: modified ? new Date(modified).toLocaleDateString() : '',
          tags: tags || []
        });
      } else {
        setMapInfo({
          title: 'SIRIUS Interactive Map',
          snippet: 'Interactive mapping application for geospatial data exploration',
          modified: new Date().toLocaleDateString(),
          tags: ['GIS', 'Malaysia', 'Petronas', 'Mapping']
        });
      }

      if (onMapLoad) {
        onMapLoad(mapElement);
      }
    };

    const handleViewError = (error: any) => {
      console.error('❌ Failed to load ArcGIS Map:', error);
      setLoading(false);
    };

    // Add event listeners
    mapElement.addEventListener('arcgisViewReadyChange', handleViewReady);
    mapElement.addEventListener('arcgisViewError', handleViewError);

    return () => {
      mapElement.removeEventListener('arcgisViewReadyChange', handleViewReady);
      mapElement.removeEventListener('arcgisViewError', handleViewError);
    };
  }, [onMapLoad]);

  const handleActionClick = (actionId: string) => {
    if (activeWidget === actionId) {
      setActiveWidget('');
    } else {
      setActiveWidget(actionId);
    }
  };

  return (
    <div className="esri-mapview-container">
      {/* Header */}
      <div className="sirius-header">
        <div className="sirius-logo">
          <span className="logo-icon">S</span>
          <div className="header-text">
            <h1>SIRIUS Portal</h1>
            <p>Enterprise GIS Platform - Interactive Map</p>
          </div>
        </div>
      </div>

      {/* Calcite Shell Layout */}
      <CalciteShell className="calcite-shell-container" contentBehind>
        {loading && (
          <CalciteLoader 
            className="map-loader"
            label="Loading map..."
          />
        )}

        {/* ArcGIS Map Component */}
        <arcgis-map 
          ref={mapRef}
          id="mapEl"
          item-id="03d584a7c9874b44821c6a766c3bbc11" // Sample web map
          className="map-view"
          slot="primary"
        >
          <arcgis-zoom position="top-left"></arcgis-zoom>
        </arcgis-map>

        {/* Navigation Panel */}
        <CalciteShellPanel 
          slot="panel-end" 
          displayMode="float"
          collapsed={!activeWidget}
          widthScale="l"
          className="shell-panel-nav"
        >
          {/* App Header Panel */}
          <CalcitePanel 
            heading={`${mapInfo.title || 'Map'} Explorer`}
            hidden={loading}
          >
            <CalciteIcon 
              icon="explore" 
              slot="header-actions-start"
              textLabel="explore"
            />
            
            {/* Action Bar */}
            <CalciteActionBar slot="action-bar" layout="horizontal" expandDisabled>
              <CalciteAction
                icon="layers"
                text="Layers"
                active={activeWidget === 'layers'}
                onClick={() => handleActionClick('layers')}
              />
              <CalciteAction
                icon="basemap"
                text="Basemaps"
                active={activeWidget === 'basemaps'}
                onClick={() => handleActionClick('basemaps')}
              />
              <CalciteAction
                icon="legend"
                text="Legend"
                active={activeWidget === 'legend'}
                onClick={() => handleActionClick('legend')}
              />
              <CalciteAction
                icon="bookmark"
                text="Bookmarks"
                active={activeWidget === 'bookmarks'}
                onClick={() => handleActionClick('bookmarks')}
              />
              <CalciteAction
                icon="print"
                text="Print"
                active={activeWidget === 'print'}
                onClick={() => handleActionClick('print')}
              />
              <CalciteAction
                icon="information"
                text="About"
                active={activeWidget === 'information'}
                onClick={() => handleActionClick('information')}
              />
            </CalciteActionBar>
          </CalcitePanel>

          {/* Map-specific blocks containing ArcGIS Map Components */}
          <CalciteBlock 
            heading="Layers" 
            hidden={activeWidget !== 'layers'}
            className="map-block"
          >
            <arcgis-layer-list 
              dragEnabled
              referenceElement="mapEl"
              visibilityAppearance="checkbox"
            />
          </CalciteBlock>

          <CalciteBlock 
            heading="Basemaps" 
            hidden={activeWidget !== 'basemaps'}
            className="map-block"
          >
            <arcgis-basemap-gallery referenceElement="mapEl" />
          </CalciteBlock>

          <CalciteBlock 
            heading="Legend" 
            hidden={activeWidget !== 'legend'}
            className="map-block"
          >
            <arcgis-legend 
              legendStyle="classic" 
              referenceElement="mapEl"
            />
          </CalciteBlock>

          <CalciteBlock 
            heading="Bookmarks" 
            hidden={activeWidget !== 'bookmarks'}
            className="map-block"
          >
            <arcgis-bookmarks 
              editingEnabled={false}
              referenceElement="mapEl"
            />
          </CalciteBlock>

          <CalciteBlock 
            heading="Print" 
            hidden={activeWidget !== 'print'}
            className="map-block"
          >
            <arcgis-print 
              allowedFormats="all"
              allowedLayouts="all"
              includeDefaultTemplates={false}
              referenceElement="mapEl"
            />
          </CalciteBlock>

          {/* Info block */}
          <CalciteBlock 
            heading="About the data" 
            hidden={activeWidget !== 'information'}
            className="map-block"
          >
            <CalciteCard>
              {mapInfo.thumbnailUrl && (
                <img 
                  src={mapInfo.thumbnailUrl} 
                  alt="Map thumbnail" 
                  slot="thumbnail" 
                />
              )}
              <div slot="heading" className="card-heading">
                {mapInfo.title}
              </div>
              <div slot="description" className="card-description">
                <p>{mapInfo.snippet}</p>
                {mapInfo.modified && (
                  <p>Last modified on {mapInfo.modified}.</p>
                )}
              </div>
              <div slot="footer-end" className="card-tags">
                {mapInfo.tags?.map((tag, index) => (
                  <CalciteChip key={index} value={tag}>{tag}</CalciteChip>
                ))}
              </div>
            </CalciteCard>
          </CalciteBlock>
        </CalciteShellPanel>
      </CalciteShell>
    </div>
  );
};

export default EsriMapView;