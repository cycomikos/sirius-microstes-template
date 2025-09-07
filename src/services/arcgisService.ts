import { Microsite, Country } from '../types/microsite';

interface ArcGISFeatureService {
  objectIdFieldName: string;
  features: Array<{
    attributes: Record<string, any>;
    geometry?: any;
  }>;
}

interface MicrositeData {
  metadata: {
    title: string;
    description: string;
    version: string;
    lastUpdated: string;
    totalMicrosites: number;
    countries: string[];
    statistics: {
      online: number;
      offline: number;
      withAccess: number;
      withoutAccess: number;
    };
  };
  microsites: Microsite[];
  countries: Country[];
}

class ArcGISService {
  private readonly baseUrl = 'https://publicgis.petronas.com/arcgis/rest/services';
  private readonly itemId = 'fe921c56cac94f928fa17bf41f12f280';

  private async fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
    const defaultOptions: RequestInit = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      ...options,
    };

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, defaultOptions);
        if (response.ok) {
          return response;
        }
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Client error: ${response.status}`);
        }
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw new Error('Max retries exceeded');
  }

  async fetchMicrositesFromArcGIS(): Promise<MicrositeData> {
    try {
      const queryUrl = `${this.baseUrl}/Hosted/microsites_portal/FeatureServer/0/query`;
      const params = new URLSearchParams({
        where: '1=1',
        outFields: '*',
        f: 'json',
        returnGeometry: 'false'
      });

      const response = await this.fetchWithRetry(`${queryUrl}?${params}`);
      const data: ArcGISFeatureService = await response.json();

      return this.transformArcGISData(data);
    } catch (error) {
      console.warn('Failed to fetch from ArcGIS, falling back to local data:', error);
      return this.fetchLocalFallback();
    }
  }

  private async fetchLocalFallback(): Promise<MicrositeData> {
    try {
      const response = await fetch('/microsites-portal.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch local fallback data:', error);
      throw new Error('Unable to fetch microsite data from any source');
    }
  }

  private transformArcGISData(arcgisData: ArcGISFeatureService): MicrositeData {
    if (!arcgisData || !arcgisData.features || !Array.isArray(arcgisData.features)) {
      throw new Error('Invalid ArcGIS data structure: missing or invalid features array');
    }

    const microsites: Microsite[] = arcgisData.features.map((feature, index) => {
      const attrs = feature.attributes;
      return {
        id: attrs.id || (index + 1).toString(),
        title: attrs.title || attrs.name || 'Untitled Microsite',
        description: {
          en: attrs.description_en || attrs.description || 'No description available',
          bm: attrs.description_bm || attrs.description || 'Tiada perihalan tersedia'
        },
        status: attrs.status || 'online',
        hasAccess: attrs.has_access !== undefined ? attrs.has_access : true,
        icon: attrs.icon || '🌐',
        gradient: attrs.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        country: attrs.country || 'GLOBAL'
      };
    });

    const countries = this.getUniqueCountries(microsites);
    const statistics = this.calculateStatistics(microsites);

    return {
      metadata: {
        title: 'PETRONAS Microsites Registry',
        description: 'Comprehensive registry of PETRONAS microsite applications and their metadata',
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        totalMicrosites: microsites.length,
        countries: countries.map(c => c.value),
        statistics
      },
      microsites,
      countries
    };
  }

  private getUniqueCountries(microsites: Microsite[]): Country[] {
    const countrySet = new Set(microsites.map(site => site.country));
    const uniqueCountryCodes = Array.from(countrySet);
    
    const countryLabels: Record<string, string> = {
      'MY': '🇲🇾 Malaysia',
      'GLOBAL': '🌍 Global',
      'BR': '🇧🇷 Brazil',
      'BN': '🇧🇳 Brunei Darussalam',
      'GA': '🇬🇦 Gabon',
      'ID': '🇮🇩 Indonesia',
      'IQ': '🇮🇶 Iraq',
      'SS': '🇸🇸 South Sudan',
      'SR': '🇸🇷 Suriname',
      'TM': '🇹🇲 Turkmenistan'
    };

    return uniqueCountryCodes.map(code => ({
      value: code,
      label: countryLabels[code] || `${code}`
    }));
  }

  private calculateStatistics(microsites: Microsite[]) {
    return {
      online: microsites.filter(site => site.status === 'online').length,
      offline: microsites.filter(site => site.status === 'offline').length,
      withAccess: microsites.filter(site => site.hasAccess).length,
      withoutAccess: microsites.filter(site => !site.hasAccess).length
    };
  }

  async fetchMicrositeById(id: string): Promise<Microsite | null> {
    const data = await this.fetchMicrositesFromArcGIS();
    return data.microsites.find(site => site.id === id) || null;
  }

  async refreshCache(): Promise<void> {
    try {
      await this.fetchMicrositesFromArcGIS();
    } catch (error) {
      console.error('Failed to refresh cache:', error);
      throw error;
    }
  }

  async fetchCountries(): Promise<Country[]> {
    try {
      const data = await this.fetchMicrositesFromArcGIS();
      return data.countries;
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      throw error;
    }
  }
}

export const arcgisService = new ArcGISService();