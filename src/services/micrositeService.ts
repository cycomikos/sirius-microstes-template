import { MicrositeConfig } from '../types/microsite';
import { micrositeRegistry } from './micrositeRegistry';

/**
 * Microsite Service - Handles microsite-specific data operations
 */

export interface MicrositeDataRequest {
  micrositeId: string;
  dataType: 'maps' | 'analytics' | 'dashboard' | 'reports';
  filters?: Record<string, any>;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface MicrositeDataResponse {
  data: any;
  metadata: {
    lastUpdated: Date;
    source: string;
    version: string;
  };
  pagination?: {
    total: number;
    page: number;
    limit: number;
  };
}

class MicrositeService {
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  constructor() {
    this.baseUrl = process.env.REACT_APP_PORTAL_URL || '';
  }

  /**
   * Fetch microsite-specific data from ArcGIS Enterprise
   */
  async fetchMicrositeData(request: MicrositeDataRequest): Promise<MicrositeDataResponse> {
    const config = micrositeRegistry.getConfig(request.micrositeId);
    if (!config) {
      throw new Error(`Microsite ${request.micrositeId} not found`);
    }

    const cacheKey = this.getCacheKey(request);
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      let data;
      
      switch (request.micrositeId) {
        case 'ep':
          data = await this.fetchEPData(config, request);
          break;
        case 'refinery':
          data = await this.fetchRefineryData(config, request);
          break;
        case 'sustainability':
          data = await this.fetchSustainabilityData(config, request);
          break;
        default:
          data = await this.fetchGenericMicrositeData(config, request);
      }

      const response: MicrositeDataResponse = {
        data,
        metadata: {
          lastUpdated: new Date(),
          source: `ArcGIS Enterprise - ${config.requiredGroupName}`,
          version: config.metadata.version
        }
      };

      // Cache the response
      this.setCache(cacheKey, response, 5 * 60 * 1000); // 5 minutes TTL
      
      return response;

    } catch (error) {
      console.error(`Failed to fetch data for microsite ${request.micrositeId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch microsite data: ${errorMessage}`);
    }
  }

  /**
   * Fetch E&P specific data
   */
  private async fetchEPData(config: MicrositeConfig, request: MicrositeDataRequest): Promise<any> {
    const groupId = config.requiredGroupId; // 4a8b631d6f384dd8b8ca5b91c10c22f6
    
    switch (request.dataType) {
      case 'dashboard':
        return {
          stats: {
            totalProjects: 24,
            activeWells: 156,
            productionRate: 95.7,
            explorationSites: 12
          },
          recentActivities: [
            {
              id: 1,
              type: 'survey',
              title: 'New seismic survey completed in Block PM-8',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              location: { lat: 4.5, lng: 114.2 }
            },
            {
              id: 2,
              type: 'production',
              title: 'Well PKG-15 production updated',
              timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
              location: { lat: 4.8, lng: 114.9 }
            }
          ]
        };

      case 'maps':
        return {
          layers: [
            {
              id: 'exploration_sites',
              name: 'Exploration Sites',
              url: `${this.baseUrl}/rest/services/EP/ExplorationSites/MapServer`,
              visible: true,
              opacity: 1
            },
            {
              id: 'production_wells',
              name: 'Production Wells',
              url: `${this.baseUrl}/rest/services/EP/ProductionWells/MapServer`,
              visible: true,
              opacity: 1
            },
            {
              id: 'seismic_data',
              name: 'Seismic Data',
              url: `${this.baseUrl}/rest/services/EP/SeismicData/MapServer`,
              visible: false,
              opacity: 0.7
            }
          ],
          extent: config.mapConfig.defaultExtent,
          basemap: config.mapConfig.basemap
        };

      case 'analytics':
        return {
          production: {
            current: 95.7,
            target: 98.0,
            trend: [89, 91, 93, 95, 96, 95.7],
            forecasts: [96, 97, 98, 99, 98, 97]
          },
          exploration: {
            activeSites: 12,
            successRate: 78.5,
            investmentROI: 145.2
          },
          environmental: {
            emissions: 45.2,
            target: 50.0,
            reduction: 9.6
          }
        };

      default:
        return {};
    }
  }

  /**
   * Fetch Refinery specific data (placeholder for future implementation)
   */
  private async fetchRefineryData(config: MicrositeConfig, request: MicrositeDataRequest): Promise<any> {
    // Placeholder for refinery-specific data fetching
    return {
      message: 'Refinery data will be available soon',
      status: 'coming_soon'
    };
  }

  /**
   * Fetch Sustainability specific data (placeholder for future implementation)
   */
  private async fetchSustainabilityData(config: MicrositeConfig, request: MicrositeDataRequest): Promise<any> {
    // Placeholder for sustainability-specific data fetching
    return {
      message: 'Sustainability data will be available soon',
      status: 'coming_soon'
    };
  }

  /**
   * Generic microsite data fetcher
   */
  private async fetchGenericMicrositeData(config: MicrositeConfig, request: MicrositeDataRequest): Promise<any> {
    // Generic implementation for any microsite
    // This would typically query ArcGIS Enterprise using the group ID
    const groupId = config.requiredGroupId;
    
    return {
      groupId,
      message: 'Generic microsite data',
      features: config.features,
      status: config.status
    };
  }

  /**
   * Preload data for multiple microsites
   */
  async preloadMicrositeData(micrositeIds: string[]): Promise<void> {
    const preloadPromises = micrositeIds.map(id => 
      this.fetchMicrositeData({
        micrositeId: id,
        dataType: 'dashboard'
      }).catch(error => {
        console.warn(`Failed to preload data for microsite ${id}:`, error);
      })
    );

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear cache for specific microsite
   */
  clearMicrositeCache(micrositeId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.includes(micrositeId));
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Generate cache key
   */
  private getCacheKey(request: MicrositeDataRequest): string {
    return `${request.micrositeId}:${request.dataType}:${JSON.stringify(request.filters || {})}`;
  }

  /**
   * Get data from cache
   */
  private getFromCache(key: string): MicrositeDataResponse | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: MicrositeDataResponse, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const micrositeService = new MicrositeService();

/**
 * React hook for microsite service
 */
export const useMicrositeService = () => {
  return {
    fetchData: micrositeService.fetchMicrositeData.bind(micrositeService),
    preloadData: micrositeService.preloadMicrositeData.bind(micrositeService),
    clearCache: micrositeService.clearCache.bind(micrositeService),
    clearMicrositeCache: micrositeService.clearMicrositeCache.bind(micrositeService),
    getCacheStats: micrositeService.getCacheStats.bind(micrositeService)
  };
};