import { MicrositeConfig } from '../types/microsite';

/**
 * Centralized microsite configuration
 * This file defines all available microsites and their properties
 */

export const MICROSITE_CONFIGS: Record<string, MicrositeConfig> = {
  // E&P Microsite
  ep: {
    id: 'ep',
    path: '/ep',
    title: {
      en: 'E&P Microsite',
      bm: 'Mikrosite E&P'
    },
    description: {
      en: 'Exploration & Production data and analytics platform',
      bm: 'Platform data dan analitik Eksplorasi & Pengeluaran'
    },
    icon: '🛢️',
    color: '#0079c1',
    requiredGroupId: '4a8b631d6f384dd8b8ca5b91c10c22f6',
    requiredGroupName: 'Sirius - E&P microsite',
    status: 'active',
    features: ['maps', 'analytics', 'reports'],
    mapConfig: {
      defaultExtent: {
        xmin: 99.0,
        ymin: 1.0,
        xmax: 120.0,
        ymax: 7.5,
        spatialReference: { wkid: 4326 }
      },
      defaultZoom: 6,
      basemap: 'hybrid'
    },
    layout: 'map-focused',
    theme: {
      primary: '#0079c1',
      secondary: '#00a19c',
      accent: '#f39c12'
    },
    metadata: {
      createdBy: 'UTDI Team',
      createdDate: '2024-01-01',
      lastModified: '2024-09-08',
      version: '1.0.0'
    }
  },

  // Template for future microsites
  refinery: {
    id: 'refinery',
    path: '/refinery',
    title: {
      en: 'Refinery Operations',
      bm: 'Operasi Penapisan'
    },
    description: {
      en: 'Refinery monitoring and operations dashboard',
      bm: 'Papan pemuka pemantauan dan operasi penapisan'
    },
    icon: '🏭',
    color: '#e74c3c',
    requiredGroupId: 'refinery-group-id-here',
    requiredGroupName: 'Refinery Operations Group',
    status: 'coming-soon',
    features: ['monitoring', 'alerts', 'maintenance'],
    mapConfig: {
      defaultExtent: {
        xmin: 100.0,
        ymin: 2.0,
        xmax: 105.0,
        ymax: 6.0,
        spatialReference: { wkid: 4326 }
      },
      defaultZoom: 8,
      basemap: 'satellite'
    },
    layout: 'dashboard-focused',
    theme: {
      primary: '#e74c3c',
      secondary: '#c0392b',
      accent: '#f39c12'
    },
    metadata: {
      createdBy: 'Refinery Team',
      createdDate: '2024-02-01',
      lastModified: '2024-09-08',
      version: '0.1.0'
    }
  },

  sustainability: {
    id: 'sustainability',
    path: '/sustainability',
    title: {
      en: 'Sustainability Hub',
      bm: 'Hub Kelestarian'
    },
    description: {
      en: 'Environmental monitoring and sustainability metrics',
      bm: 'Pemantauan alam sekitar dan metrik kelestarian'
    },
    icon: '🌱',
    color: '#27ae60',
    requiredGroupId: 'sustainability-group-id-here',
    requiredGroupName: 'Sustainability Group',
    status: 'coming-soon',
    features: ['environmental', 'metrics', 'reporting'],
    mapConfig: {
      defaultExtent: {
        xmin: 95.0,
        ymin: 0.0,
        xmax: 125.0,
        ymax: 10.0,
        spatialReference: { wkid: 4326 }
      },
      defaultZoom: 5,
      basemap: 'terrain'
    },
    layout: 'analytics-focused',
    theme: {
      primary: '#27ae60',
      secondary: '#229954',
      accent: '#f1c40f'
    },
    metadata: {
      createdBy: 'Sustainability Team',
      createdDate: '2024-03-01',
      lastModified: '2024-09-08',
      version: '0.1.0'
    }
  }
};

/**
 * Get microsite configuration by ID
 */
export const getMicrositeConfig = (id: string): MicrositeConfig | undefined => {
  return MICROSITE_CONFIGS[id];
};

/**
 * Get all active microsites
 */
export const getActiveMicrosites = (): MicrositeConfig[] => {
  return Object.values(MICROSITE_CONFIGS).filter(config => config.status === 'active');
};

/**
 * Get microsites user has access to based on their groups
 */
export const getAccessibleMicrosites = (userGroups: string[]): MicrositeConfig[] => {
  return Object.values(MICROSITE_CONFIGS).filter(config => {
    return userGroups.includes(config.requiredGroupId);
  });
};

/**
 * Get all microsite paths for routing
 */
export const getAllMicrositePaths = (): string[] => {
  return Object.values(MICROSITE_CONFIGS).map(config => config.path);
};