/**
 * Deployment Configuration Constants
 * Central configuration for deployment-specific settings
 */

export const DEPLOYMENT_CONFIG = {
  // Base paths
  BASE_PATH: '/sirius-microsites',
  MICROSITES_PATH: '/sirius-microsites/microsites',
  
  // External URLs
  PUBLIC_PORTAL_URL: 'https://publicgis.petronas.com/sirius-portal',
  MAIN_PORTAL_URL: 'https://publicgis.petronas.com/sirius-microsites',
  
  // Microsite URLs
  EP_MICROSITE_URL: 'https://publicgis.petronas.com/sirius-microsites/ep',
  
  // Group IDs
  SIRIUS_USERS_GROUP: 'Sirius Users',
  EP_MICROSITE_GROUP_ID: '4a8b631d6f384dd8b8ca5b91c10c22f6',
  EP_MICROSITE_GROUP_NAME: 'Sirius - E&P microsite',
  
  // Cache settings
  CACHE_TTL: {
    MICROSITE_DATA: 5 * 60 * 1000, // 5 minutes
    COMPONENT_CACHE: 30 * 60 * 1000, // 30 minutes
    USER_SESSION: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // Performance settings
  LAZY_LOADING: {
    ENABLED: true,
    PRELOAD_DELAY: 2000, // 2 seconds
    COMPONENT_TIMEOUT: 10000 // 10 seconds
  },
  
  // Feature flags
  FEATURES: {
    ANALYTICS: true,
    MICROSITE_SWITCHER: true,
    DARK_MODE: true,
    MULTI_LANGUAGE: true,
    OFFLINE_SUPPORT: false
  },
  
  // API endpoints
  API: {
    PORTAL: process.env.REACT_APP_PORTAL_URL || '',
    REST_SERVICES: '/rest/services',
    SHARING: '/sharing/rest',
    OAUTH: '/oauth2'
  },
  
  // Build information
  BUILD: {
    VERSION: process.env.REACT_APP_VERSION || '1.0.0',
    BUILD_DATE: new Date().toISOString(),
    ENVIRONMENT: process.env.NODE_ENV || 'development'
  }
};

/**
 * Get microsite URL
 */
export const getMicrositeUrl = (micrositeId: string): string => {
  return `${DEPLOYMENT_CONFIG.MAIN_PORTAL_URL}/microsites/${micrositeId}`;
};

/**
 * Get full URL path
 */
export const getFullPath = (path: string): string => {
  return `${DEPLOYMENT_CONFIG.BASE_PATH}${path}`;
};

/**
 * Check if feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof DEPLOYMENT_CONFIG.FEATURES): boolean => {
  return DEPLOYMENT_CONFIG.FEATURES[feature];
};