import React from 'react';
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
}

const ShellPanel: React.FC<ShellPanelProps> = ({ activePanel, isVisible }) => {
  const panelData: Record<string, PanelData> = {
    applications: {
      title: 'Applications',
      stats: [
        { value: '16', label: 'Total Apps' },
        { value: '5', label: 'Accessible' }
      ],
      items: [
        {
          id: '1',
          title: '🔥 Recently Accessed',
          description: 'View your recent applications',
          icon: '🔥'
        },
        {
          id: '2',
          title: '⭐ Favorites',
          description: 'Quick access to starred apps',
          icon: '⭐'
        },
        {
          id: '3',
          title: '📊 Analytics Dashboard',
          description: 'Usage statistics and metrics',
          icon: '📊'
        }
      ]
    },
    maps: {
      title: 'Maps & Scenes',
      items: [
        {
          id: '1',
          title: '🗺️ Malaysia Base Map',
          description: 'Updated: 2 days ago',
          icon: '🗺️'
        },
        {
          id: '2',
          title: '🌍 Global Operations',
          description: 'Updated: 1 week ago',
          icon: '🌍'
        },
        {
          id: '3',
          title: '🛢️ Oil Fields Map',
          description: 'Updated: 3 days ago',
          icon: '🛢️'
        },
        {
          id: '4',
          title: '📍 Pipeline Network',
          description: 'Updated: 5 days ago',
          icon: '📍'
        }
      ]
    },
    layers: {
      title: 'Data Layers',
      items: [
        {
          id: '1',
          title: '🔷 Exploration Blocks',
          description: 'Polygon • 1,234 features',
          icon: '🔷'
        },
        {
          id: '2',
          title: '📍 Well Locations',
          description: 'Point • 5,678 features',
          icon: '📍'
        },
        {
          id: '3',
          title: '🛤️ Pipelines',
          description: 'Line • 890 features',
          icon: '🛤️'
        },
        {
          id: '4',
          title: '🏭 Facilities',
          description: 'Point • 345 features',
          icon: '🏭'
        }
      ]
    },
    data: {
      title: 'Data Management',
      stats: [
        { value: '2.5TB', label: 'Storage Used' },
        { value: '847', label: 'Datasets' }
      ],
      items: [
        {
          id: '1',
          title: '📤 Upload Data',
          description: 'Import new datasets',
          icon: '📤'
        },
        {
          id: '2',
          title: '🔄 Data Processing',
          description: 'ETL workflows and tools',
          icon: '🔄'
        },
        {
          id: '3',
          title: '📊 Quality Check',
          description: 'Validation and QA tools',
          icon: '📊'
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
    <div className={`shell-panel ${isVisible ? 'visible' : ''}`}>
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
  );
};

export default ShellPanel;