import React from 'react';
import { MicrositeRegistryEntry, MicrositeConfig, MicrositeProps } from '../types/microsite';
import { MICROSITE_CONFIGS } from '../config/microsites.config';

/**
 * Microsite Registry - Manages lazy loading and dynamic imports of microsite components
 * This enables code splitting and modular architecture
 */

class MicrositeRegistry {
  private registry: Map<string, MicrositeRegistryEntry> = new Map();
  private loadedComponents: Map<string, React.ComponentType<MicrositeProps>> = new Map();

  constructor() {
    this.initializeRegistry();
  }

  /**
   * Initialize registry with available microsites
   */
  private initializeRegistry() {
    // Register E&P Microsite
    this.register('ep', {
      config: MICROSITE_CONFIGS.ep,
      component: () => import('../microsites/ep/EPMicrosite'),
      routes: [
        { path: '/ep', component: React.lazy(() => import('../microsites/ep/EPMicrosite')), exact: true },
        { path: '/ep/dashboard', component: React.lazy(() => import('../microsites/ep/components/EPDashboard')) },
        { path: '/ep/maps', component: React.lazy(() => import('../microsites/ep/components/EPMaps')) },
        { path: '/ep/analytics', component: React.lazy(() => import('../microsites/ep/components/EPAnalytics')) }
      ]
    });

    // Register future microsites (coming soon)
    this.register('refinery', {
      config: MICROSITE_CONFIGS.refinery,
      component: () => import('../microsites/refinery/RefineryMicrosite')
    });

    this.register('sustainability', {
      config: MICROSITE_CONFIGS.sustainability,
      component: () => import('../microsites/sustainability/SustainabilityMicrosite')
    });
  }

  /**
   * Register a new microsite
   */
  register(id: string, entry: MicrositeRegistryEntry) {
    this.registry.set(id, entry);
  }

  /**
   * Unregister a microsite
   */
  unregister(id: string) {
    this.registry.delete(id);
    this.loadedComponents.delete(id);
  }

  /**
   * Get microsite configuration
   */
  getConfig(id: string): MicrositeConfig | undefined {
    const entry = this.registry.get(id);
    return entry?.config;
  }

  /**
   * Get all registered microsite configs
   */
  getAllConfigs(): MicrositeConfig[] {
    return Array.from(this.registry.values()).map(entry => entry.config);
  }

  /**
   * Get active microsite configs
   */
  getActiveConfigs(): MicrositeConfig[] {
    return this.getAllConfigs().filter(config => config.status === 'active');
  }

  /**
   * Get microsites user has access to
   */
  getAccessibleConfigs(userGroups: string[]): MicrositeConfig[] {
    return this.getAllConfigs().filter(config => 
      userGroups.includes(config.requiredGroupId) && config.status === 'active'
    );
  }

  /**
   * Load microsite component dynamically
   */
  async loadComponent(id: string): Promise<React.ComponentType<MicrositeProps> | null> {
    // Return cached component if already loaded
    if (this.loadedComponents.has(id)) {
      return this.loadedComponents.get(id)!;
    }

    const entry = this.registry.get(id);
    if (!entry) {
      console.warn(`Microsite '${id}' not found in registry`);
      return null;
    }

    try {
      const module = await entry.component();
      const Component = module.default;
      this.loadedComponents.set(id, Component);
      return Component;
    } catch (error) {
      console.error(`Failed to load microsite component '${id}':`, error);
      return null;
    }
  }

  /**
   * Check if microsite is registered
   */
  isRegistered(id: string): boolean {
    return this.registry.has(id);
  }

  /**
   * Check if microsite component is loaded
   */
  isLoaded(id: string): boolean {
    return this.loadedComponents.has(id);
  }

  /**
   * Get all microsite paths for routing
   */
  getAllPaths(): string[] {
    return Array.from(this.registry.values()).map(entry => entry.config.path);
  }

  /**
   * Get microsite by path
   */
  getByPath(path: string): MicrositeConfig | undefined {
    const entries = Array.from(this.registry.values());
    for (const entry of entries) {
      if (entry.config.path === path || path.startsWith(entry.config.path + '/')) {
        return entry.config;
      }
    }
    return undefined;
  }

  /**
   * Preload microsite components (for performance)
   */
  async preloadComponents(ids: string[]): Promise<void> {
    const loadPromises = ids.map(id => this.loadComponent(id));
    await Promise.allSettled(loadPromises);
  }

  /**
   * Clear component cache
   */
  clearCache(): void {
    this.loadedComponents.clear();
  }

  /**
   * Get registry statistics
   */
  getStats() {
    const total = this.registry.size;
    const loaded = this.loadedComponents.size;
    const active = this.getActiveConfigs().length;
    
    return {
      total,
      loaded,
      active,
      loadedPercentage: total > 0 ? Math.round((loaded / total) * 100) : 0
    };
  }
}

// Export singleton instance
export const micrositeRegistry = new MicrositeRegistry();

/**
 * React hook for microsite registry
 */
export const useMicrositeRegistry = () => {
  return {
    registry: micrositeRegistry,
    loadComponent: micrositeRegistry.loadComponent.bind(micrositeRegistry),
    getConfig: micrositeRegistry.getConfig.bind(micrositeRegistry),
    getAllConfigs: micrositeRegistry.getAllConfigs.bind(micrositeRegistry),
    getActiveConfigs: micrositeRegistry.getActiveConfigs.bind(micrositeRegistry),
    getAccessibleConfigs: micrositeRegistry.getAccessibleConfigs.bind(micrositeRegistry),
    isRegistered: micrositeRegistry.isRegistered.bind(micrositeRegistry),
    isLoaded: micrositeRegistry.isLoaded.bind(micrositeRegistry)
  };
};