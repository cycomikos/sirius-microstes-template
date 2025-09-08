// Legacy interface - kept for backward compatibility
export interface Microsite {
  id: string;
  title: string;
  description: {
    en: string;
    bm: string;
  };
  status: 'online' | 'offline';
  hasAccess: boolean;
  icon: string;
  gradient: string;
  country: string;
  groupId?: string;
}

// New scalable microsite configuration interface
export interface MicrositeConfig {
  id: string;
  path: string;
  title: {
    en: string;
    bm: string;
  };
  description: {
    en: string;
    bm: string;
  };
  icon: string;
  color: string;
  requiredGroupId: string;
  requiredGroupName: string;
  status: 'active' | 'inactive' | 'coming-soon' | 'maintenance';
  features: string[];
  mapConfig: {
    defaultExtent: {
      xmin: number;
      ymin: number;
      xmax: number;
      ymax: number;
      spatialReference: { wkid: number };
    };
    defaultZoom: number;
    basemap: string;
  };
  layout: 'map-focused' | 'dashboard-focused' | 'analytics-focused' | 'custom';
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  metadata: {
    createdBy: string;
    createdDate: string;
    lastModified: string;
    version: string;
  };
}

// Microsite instance with runtime data
export interface MicrositeInstance extends MicrositeConfig {
  hasAccess: boolean;
  isLoading: boolean;
  error?: string;
  data?: any;
}

// Microsite component props
export interface MicrositeProps {
  config: MicrositeConfig;
  user?: any;
  currentLanguage: 'en' | 'bm';
  sidebarExpanded: boolean;
  panelWidth: number;
}

// Microsite route information
export interface MicrositeRoute {
  path: string;
  component: React.ComponentType<MicrositeProps>;
  exact?: boolean;
  redirectTo?: string;
}

// Microsite registry entry
export interface MicrositeRegistryEntry {
  config: MicrositeConfig;
  component: () => Promise<{ default: React.ComponentType<MicrositeProps> }>;
  routes?: MicrositeRoute[];
}

export interface Country {
  value: string;
  label: string;
}

export type MicrositeStatus = 'online' | 'offline' | 'active' | 'inactive' | 'coming-soon' | 'maintenance';
export type CountryCode = 'MY' | 'GLOBAL' | 'BR' | 'BN' | 'GA' | 'ID' | 'IQ' | 'SS' | 'SR' | 'TM';
export type MicrositeLayout = 'map-focused' | 'dashboard-focused' | 'analytics-focused' | 'custom';
export type Language = 'en' | 'bm';