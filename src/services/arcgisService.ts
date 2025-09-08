import { Microsite, Country } from '../types/microsite';

interface ArcGISFeatureService {
  objectIdFieldName?: string;
  features?: Array<{
    attributes: Record<string, any>;
    geometry?: any;
  }>;
  error?: {
    code: number;
    message: string;
    details?: any[];
  };
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
  private readonly baseUrl = process.env.NODE_ENV === 'development' 
    ? '/gisserver/rest/services' 
    : 'https://publicgis.petronas.com/gisserver/rest/services';
  private readonly portalUrl = process.env.NODE_ENV === 'development' 
    ? '/arcgis' 
    : 'https://publicgis.petronas.com/arcgis';
  private readonly primaryItemId = '2a2bb33b814a4abeb26929a5efb8c664';
  private readonly fallbackItemId = '4bcf0c909a7b4f27abb3b9dea0383b76';
  private readonly siriusUsersGroupId = 'afa4ae2949554ec59972abebbfd0034c';
  private token: string | null = null;
  
  // Lazy loading cache
  private micrositesCache: Microsite[] | null = null;
  private countriesCache: Country[] | null = null;
  private metadataCache: MicrositeData['metadata'] | null = null;
  private cacheTimestamp: number | null = null;
  private readonly cacheExpirationMs = 5 * 60 * 1000; // 5 minutes
  
  // Loading states
  private micrositesLoading: Promise<Microsite[]> | null = null;
  private countriesLoading: Promise<Country[]> | null = null;

  private isCacheValid(): boolean {
    return this.cacheTimestamp !== null && 
           Date.now() - this.cacheTimestamp < this.cacheExpirationMs;
  }

  private invalidateCache(): void {
    this.micrositesCache = null;
    this.countriesCache = null;
    this.metadataCache = null;
    this.cacheTimestamp = null;
    this.micrositesLoading = null;
    this.countriesLoading = null;
  }

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
        if (response.status === 401 || response.status === 403) {
          // Authentication required - trigger login flow
          await this.handleAuthenticationRequired();
          throw new Error('Authentication required for ArcGIS access');
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

  private async handleAuthenticationRequired(): Promise<void> {
    console.warn('ArcGIS authentication required. User must be member of "sirius users" group.');
    // Redirect to ArcGIS login or show authentication prompt
    const loginUrl = `${this.portalUrl}/home/signin.html?returnUrl=${encodeURIComponent(window.location.href)}`;
    console.log('Please login at:', loginUrl);
    
    // In a real application, you might want to:
    // 1. Redirect the user to login
    // 2. Show a login modal
    // 3. Use OAuth flow
    // window.location.href = loginUrl;
  }

  async authenticateUser(): Promise<boolean> {
    try {
      // Check if user is already authenticated
      console.log('Checking authentication status...');
      const response = await fetch(`${this.portalUrl}/sharing/rest/portals/self?f=json`, {
        credentials: 'include'
      });
      
      console.log('Authentication response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Authentication response data:', data);
        
        if (data.user) {
          console.log('User authenticated successfully:', data.user.username);
          return true;
        } else {
          console.log('No user found in response, user not authenticated');
        }
      } else {
        console.log('Authentication response not ok:', response.status, response.statusText);
        const responseText = await response.text();
        console.log('Authentication error response:', responseText);
      }
      
      return false;
    } catch (error) {
      console.error('Authentication check failed with error:', error);
      return false;
    }
  }

  async fetchMicrositesFromArcGIS(): Promise<MicrositeData> {
    console.log(`Attempting to fetch microsite data from ArcGIS...`);
    console.log('Note: Authentication and authorization handled by main app authentication system');

    // Try primary item first
    try {
      console.log(`Trying primary item: ${this.primaryItemId}`);
      console.log(`Primary item URL: https://publicgis.petronas.com/arcgis/home/item.html?id=${this.primaryItemId}`);
      
      const serviceUrl = await this.getServiceUrlFromItem(this.primaryItemId);
      const queryUrl = `${serviceUrl}/query`;
      const params = new URLSearchParams({
        where: '1=1',
        outFields: '*',
        f: 'json',
        returnGeometry: 'true'
      });

      console.log(`Fetching from primary ArcGIS URL: ${queryUrl}?${params}`);
      
      const response = await this.fetchWithRetry(`${queryUrl}?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: ArcGISFeatureService = await response.json();

      console.log('Primary ArcGIS data received:', data);
      
      if (data.error) {
        throw new Error(`ArcGIS API Error: ${data.error.message}`);
      }

      return this.transformArcGISData(data);
    } catch (primaryError) {
      console.warn('Primary item failed:', primaryError);
      
      // Try fallback item
      console.log(`Trying fallback item: ${this.fallbackItemId}`);
      console.log(`Fallback item URL: https://publicgis.petronas.com/arcgis/home/item.html?id=${this.fallbackItemId}`);
      
      const serviceUrl = await this.getServiceUrlFromItem(this.fallbackItemId);
      const queryUrl = `${serviceUrl}/query`;
      const params = new URLSearchParams({
        where: '1=1',
        outFields: '*',
        f: 'json',
        returnGeometry: 'true'
      });

      console.log(`Fetching from fallback ArcGIS URL: ${queryUrl}?${params}`);
      
      const response = await this.fetchWithRetry(`${queryUrl}?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: ArcGISFeatureService = await response.json();

      console.log('Fallback ArcGIS data received:', data);
      
      if (data.error) {
        throw new Error(`ArcGIS API Error: ${data.error.message}`);
      }

      return this.transformArcGISData(data);
    }
  }

  private async getServiceUrlFromItem(itemId: string): Promise<string> {
    try {
      // Get item details first
      const itemUrl = `${this.portalUrl}/sharing/rest/content/items/${itemId}`;
      const itemParams = new URLSearchParams({
        f: 'json'
      });

      console.log(`Fetching item details from: ${itemUrl}?${itemParams}`);
      
      const itemResponse = await this.fetchWithRetry(`${itemUrl}?${itemParams}`, {
        credentials: 'include'
      });
      const itemData = await itemResponse.json();

      console.log(`Item ${itemId} full data:`, JSON.stringify(itemData, null, 2));

      if (itemData.error) {
        throw new Error(`Item fetch error: ${itemData.error.message}`);
      }

      // Check if this is a Web Map or Web Application that references a service
      if (itemData.type === 'Web Map' || itemData.type === 'Web Mapping Application') {
        console.log(`Item is a ${itemData.type}, need to extract service from data`);
        
        // Try to get the data/layers information
        const dataUrl = `${itemUrl}/data?f=json`;
        console.log(`Fetching item data from: ${dataUrl}`);
        
        const dataResponse = await this.fetchWithRetry(dataUrl, {
          credentials: 'include'
        });
        const data = await dataResponse.json();
        console.log(`Item data content:`, JSON.stringify(data, null, 2));
        
        // Look for operational layers or baseMap layers that might contain our service
        if (data.operationalLayers && data.operationalLayers.length > 0) {
          const layer = data.operationalLayers[0];
          if (layer.url) {
            console.log(`Found operational layer URL: ${layer.url}`);
            return `${layer.url}/0`;
          }
        }
      }

      if (itemData.url) {
        // If item has a direct service URL, use it
        const serviceUrl = itemData.url.endsWith('/0') ? itemData.url : `${itemData.url}/0`;
        console.log(`Using direct service URL for ${itemId}:`, serviceUrl);
        return serviceUrl;
      } else if (itemData.type === 'Feature Service') {
        // For hosted feature services, construct the URL using item name or id
        const serviceName = itemData.name || itemData.title || itemId;
        const constructedUrl = process.env.NODE_ENV === 'development'
          ? `/gisserver/rest/services/Hosted/${serviceName}/FeatureServer/0`
          : `https://publicgis.petronas.com/gisserver/rest/services/Hosted/${serviceName}/FeatureServer/0`;
        console.log(`Using constructed service URL for ${itemId}:`, constructedUrl);
        return constructedUrl;
      } else {
        console.log(`Item type: ${itemData.type}, trying generic construction`);
        console.log(`Available properties: name=${itemData.name}, title=${itemData.title}`);
        const constructedUrl = process.env.NODE_ENV === 'development'
          ? `/gisserver/rest/services/Hosted/${itemData.name || itemData.title || itemId}/FeatureServer/0`
          : `https://publicgis.petronas.com/gisserver/rest/services/Hosted/${itemData.name || itemData.title || itemId}/FeatureServer/0`;
        console.log(`Using generic constructed service URL for ${itemId}:`, constructedUrl);
        return constructedUrl;
      }
    } catch (error) {
      console.warn(`Failed to get service URL for item ${itemId}, using fallback construction:`, error);
      // Fallback to generic constructed URL
      const fallbackUrl = process.env.NODE_ENV === 'development'
        ? `/gisserver/rest/services/Hosted/${itemId}/FeatureServer/0`
        : `https://publicgis.petronas.com/gisserver/rest/services/Hosted/${itemId}/FeatureServer/0`;
      console.log(`Using fallback service URL:`, fallbackUrl);
      return fallbackUrl;
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
        hasAccess: attrs.hasaccess === "-1" ? true : attrs.hasaccess === "0" ? false : (attrs.has_access !== undefined ? attrs.has_access : true),
        icon: attrs.icon || '🌐',
        gradient: attrs.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        country: attrs.country || 'GLOBAL',
        groupId: attrs.groupId || attrs.group_id || null
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

  async getMicrositeById(id: string): Promise<Microsite | null> {
    try {
      const microsites = await this.getMicrosites();
      return microsites.find(site => site.id === id) || null;
    } catch (error) {
      console.error('Failed to get microsite by ID:', error);
      throw error;
    }
  }

  async refreshCache(): Promise<void> {
    try {
      console.log('Refreshing cache...');
      this.invalidateCache();
      
      // Pre-load both microsites and countries to warm the cache
      await Promise.all([
        this.getMicrosites(),
        this.getCountries()
      ]);
      
      console.log('Cache refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh cache:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  async fetchMicrositeById(id: string): Promise<Microsite | null> {
    return this.getMicrositeById(id);
  }

  async fetchMicrositesFromPortal(): Promise<MicrositeData> {
    console.log('Fetching microsite data directly from portal item...');
    
    const portalDataUrl = `${this.portalUrl}/sharing/rest/content/items/${this.primaryItemId}/data?f=json`;
    console.log(`Portal data URL: ${portalDataUrl}`);
    
    try {
      const response = await this.fetchWithRetry(portalDataUrl, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error(`Portal API failed with status: ${response.status}`);
        // Try without credentials for public access
        const publicResponse = await this.fetchWithRetry(portalDataUrl);
        if (!publicResponse.ok) {
          throw new Error(`HTTP ${publicResponse.status}: ${publicResponse.statusText}`);
        }
        const publicData = await publicResponse.json();
        console.log('Portal data received (public access):', publicData);
        if (publicData.error) {
          throw new Error(`Portal API Error: ${publicData.error.message}`);
        }
        return this.transformPortalData(publicData);
      }
      
      const data = await response.json();
      console.log('Portal data received:', data);
      
      if (data.error) {
        throw new Error(`Portal API Error: ${data.error.message}`);
      }

      return this.transformPortalData(data);
    } catch (error) {
      console.error('Portal API completely failed:', error);
      throw error;
    }
  }

  private transformPortalData(portalData: any): MicrositeData {
    if (!portalData || !portalData.layers || !Array.isArray(portalData.layers)) {
      throw new Error('Invalid portal data structure: missing or invalid layers array');
    }

    const layer = portalData.layers[0];
    if (!layer.featureSet || !layer.featureSet.features) {
      throw new Error('Invalid portal data structure: missing featureSet or features');
    }

    const microsites: Microsite[] = layer.featureSet.features.map((feature: any) => {
      const attrs = feature.attributes;
      return {
        id: attrs.id || attrs.objectid?.toString() || Math.random().toString(),
        title: attrs.title || 'Untitled Microsite',
        description: {
          en: attrs.description_en || 'No description available',
          bm: attrs.description_bm || 'Tiada perihalan tersedia'
        },
        status: attrs.status || 'online',
        hasAccess: attrs.hasaccess === "-1" ? true : attrs.hasaccess === "0" ? false : true,
        icon: attrs.icon || '🌐',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        country: attrs.country || 'GLOBAL',
        groupId: attrs.groupid || null
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

  async getMicrosites(): Promise<Microsite[]> {
    if (this.isCacheValid() && this.micrositesCache) {
      console.log('Returning cached microsites');
      return this.micrositesCache;
    }

    if (this.micrositesLoading) {
      console.log('Microsites already loading, waiting...');
      return this.micrositesLoading;
    }

    console.log('Loading microsites...');
    this.micrositesLoading = this.loadMicrosites();
    
    try {
      const microsites = await this.micrositesLoading;
      return microsites;
    } finally {
      this.micrositesLoading = null;
    }
  }

  async getCountries(): Promise<Country[]> {
    if (this.isCacheValid() && this.countriesCache) {
      console.log('Returning cached countries');
      return this.countriesCache;
    }

    if (this.countriesLoading) {
      console.log('Countries already loading, waiting...');
      return this.countriesLoading;
    }

    console.log('Loading countries...');
    this.countriesLoading = this.loadCountries();
    
    try {
      const countries = await this.countriesLoading;
      return countries;
    } finally {
      this.countriesLoading = null;
    }
  }

  async getCountryList(): Promise<{value: string, label: string, count: number}[]> {
    try {
      const [countries, microsites] = await Promise.all([
        this.getCountries(),
        this.getMicrosites()
      ]);
      
      const countryCounts: Record<string, number> = {};
      microsites.forEach(site => {
        countryCounts[site.country] = (countryCounts[site.country] || 0) + 1;
      });

      return countries.map(country => ({
        ...country,
        count: countryCounts[country.value] || 0
      }));
    } catch (error) {
      console.error('Failed to get country list:', error);
      throw error;
    }
  }

  private async loadMicrosites(): Promise<Microsite[]> {
    try {
      const data = await this.fetchMicrositesFromPortal();
      this.micrositesCache = data.microsites;
      this.countriesCache = data.countries;
      this.metadataCache = data.metadata;
      this.cacheTimestamp = Date.now();
      
      console.log(`Loaded and cached ${data.microsites.length} microsites`);
      return data.microsites;
    } catch (error) {
      console.error('Failed to load microsites:', error);
      throw error;
    }
  }

  private async loadCountries(): Promise<Country[]> {
    try {
      const data = await this.fetchMicrositesFromPortal();
      this.micrositesCache = data.microsites;
      this.countriesCache = data.countries;
      this.metadataCache = data.metadata;
      this.cacheTimestamp = Date.now();
      
      console.log(`Loaded and cached ${data.countries.length} countries`);
      return data.countries;
    } catch (error) {
      console.error('Failed to load countries:', error);
      throw error;
    }
  }

  async getMetadata(): Promise<MicrositeData['metadata']> {
    if (this.isCacheValid() && this.metadataCache) {
      console.log('Returning cached metadata');
      return this.metadataCache;
    }

    // If we don't have cached metadata, load it by getting microsites
    await this.getMicrosites();
    
    if (this.metadataCache) {
      return this.metadataCache;
    }
    
    throw new Error('Failed to load metadata');
  }

  // Legacy method for backward compatibility
  async fetchCountries(): Promise<Country[]> {
    return this.getCountries();
  }

  async testPortalApi(): Promise<void> {
    console.log('=== TESTING PORTAL API ===');
    try {
      // Test direct portal URL first
      const portalDataUrl = `${this.portalUrl}/sharing/rest/content/items/${this.primaryItemId}/data?f=json`;
      console.log('Testing URL:', portalDataUrl);
      
      const response = await fetch(portalDataUrl);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (response.ok) {
        const rawData = await response.json();
        console.log('Raw response keys:', Object.keys(rawData));
        
        const [microsites, countries, metadata] = await Promise.all([
          this.getMicrosites(),
          this.getCountries(), 
          this.getMetadata()
        ]);
        console.log('✅ API call successful');
        console.log('Total microsites:', metadata.totalMicrosites);
        console.log('Countries found:', countries);
        console.log('Statistics:', metadata.statistics);
        
        const countryList = await this.getCountryList();
        console.log('Country list with counts:', countryList);
      } else {
        console.error('❌ Direct URL test failed with status:', response.status);
      }
    } catch (error) {
      console.error('❌ API call failed:', error);
    }
    console.log('=== END PORTAL API TEST ===');
  }

  async redirectToLogin(): Promise<void> {
    const loginUrl = `${this.portalUrl}/home/signin.html?returnUrl=${encodeURIComponent(window.location.href)}`;
    console.log('Redirecting to login URL:', loginUrl);
    window.location.href = loginUrl;
  }

  async debugUserStatus(): Promise<void> {
    console.log('=== DEBUGGING USER STATUS FOR HISYAM ===');
    console.log('Portal URL:', this.portalUrl);
    console.log('Primary Item ID:', this.primaryItemId);
    console.log('Fallback Item ID:', this.fallbackItemId);
    console.log('Required Group ID:', this.siriusUsersGroupId);
    
    const isAuth = await this.authenticateUser();
    console.log('Is Authenticated:', isAuth);
    
    if (isAuth) {
      const hasGroupAccess = await this.checkGroupMembership();
      console.log('Has Group Access:', hasGroupAccess);
    }
    
    console.log('=== END DEBUG ===');
  }

  async debugItem(itemId?: string): Promise<void> {
    const targetItemId = itemId || this.primaryItemId;
    console.log('=== DEBUGGING ARCGIS ITEM ===');
    console.log('Item ID:', targetItemId);
    console.log('Item URL:', `https://publicgis.petronas.com/arcgis/home/item.html?id=${targetItemId}`);
    
    try {
      const itemUrl = `${this.portalUrl}/sharing/rest/content/items/${targetItemId}?f=json`;
      console.log('Item API URL:', itemUrl);
      const response = await fetch(itemUrl, { credentials: 'include' });
      console.log('Item response status:', response.status);
      const data = await response.json();
      console.log('Item data:', data);
    } catch (error) {
      console.error('Item test failed:', error);
    }
    
    console.log('=== END ITEM DEBUG ===');
  }

  async testItemQuery(itemId?: string): Promise<void> {
    const targetItemId = itemId || this.primaryItemId;
    console.log('=== TESTING ARCGIS ITEM QUERY ===');
    console.log('Item ID:', targetItemId);
    console.log('Item URL:', `https://publicgis.petronas.com/arcgis/home/item.html?id=${targetItemId}`);
    
    try {
      const serviceUrl = await this.getServiceUrlFromItem(targetItemId);
      console.log('Service URL constructed:', serviceUrl);
      
      const queryUrl = `${serviceUrl}/query`;
      const params = new URLSearchParams({
        where: '1=1',
        outFields: '*',
        f: 'json',
        returnGeometry: 'false'
      });
      
      console.log('Testing query:', `${queryUrl}?${params}`);
      
      const response = await fetch(`${queryUrl}?${params}`, { credentials: 'include' });
      console.log('Query response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Query response data:', data);
        
        if (data.features && data.features.length > 0) {
          console.log('Sample feature attributes:', data.features[0].attributes);
        }
      } else {
        const errorText = await response.text();
        console.log('Query error response:', errorText);
      }
      
    } catch (error) {
      console.error('Item query test failed:', error);
    }
    
    console.log('=== END ITEM QUERY TEST ===');
  }


  async checkGroupMembership(): Promise<boolean> {
    try {
      console.log('Checking group membership...');
      const response = await fetch(`${this.portalUrl}/sharing/rest/community/users/self?f=json`, {
        credentials: 'include'
      });
      
      console.log('Group membership response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User data for group check:', userData);
        
        if (userData.groups) {
          console.log('User groups:', userData.groups.map((g: any) => `${g.title} (${g.id})`));
          
          // Check if user is member of "Sirius Users" group using specific group ID
          const siriusGroup = userData.groups.find((group: any) => 
            group.id === this.siriusUsersGroupId
          );
          
          if (siriusGroup) {
            console.log('User is member of Sirius Users group:', siriusGroup.title, `(${siriusGroup.id})`);
            return true;
          } else {
            console.log('User is NOT member of the Sirius Users group');
            console.log(`Looking for group ID: ${this.siriusUsersGroupId}`);
            console.log('Available group IDs:', userData.groups.map((g: any) => `${g.id} (${g.title})`));
          }
        } else {
          console.log('No groups found in user data');
        }
      } else {
        console.log('Group membership response not ok:', response.status, response.statusText);
        const responseText = await response.text();
        console.log('Group membership error response:', responseText);
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check group membership:', error);
      return false;
    }
  }
}

export const arcgisService = new ArcGISService();

// Make service available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).arcgisService = arcgisService;
}