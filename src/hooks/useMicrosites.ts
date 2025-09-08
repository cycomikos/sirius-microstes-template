import { useState, useMemo, useEffect } from 'react';
import { Microsite, CountryCode, Country } from '../types/microsite';
import { arcgisService } from '../services/arcgisService';

interface CountryWithCount extends Country {
  count: number;
}

export const useMicrosites = (initialCountry: CountryCode = 'MY') => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(initialCountry);
  const [microsites, setMicrosites] = useState<Microsite[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countriesWithCounts, setCountriesWithCounts] = useState<CountryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMicrosites = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await arcgisService.fetchMicrositesFromPortal();
        setMicrosites(data.microsites);
        setCountries(data.countries);
        
        // Calculate country counts
        const countryCountsMap: Record<string, number> = {};
        data.microsites.forEach(site => {
          countryCountsMap[site.country] = (countryCountsMap[site.country] || 0) + 1;
        });
        
        const countriesWithCounts = data.countries.map(country => ({
          ...country,
          count: countryCountsMap[country.value] || 0
        }));
        
        setCountriesWithCounts(countriesWithCounts);
      } catch (err) {
        console.error('Failed to fetch microsites:', err);
        setError(err instanceof Error ? err.message : 'Failed to load microsite data');
      } finally {
        setLoading(false);
      }
    };

    fetchMicrosites();
  }, []);

  const filteredMicrosites = useMemo(() => {
    const filtered = microsites.filter(site => {
      if (selectedCountry === 'GLOBAL') {
        return site.country === 'GLOBAL';
      }
      if (selectedCountry === 'MY') {
        return ['MY', 'GLOBAL'].includes(site.country);
      }
      return site.country === selectedCountry;
    });

    // Sort by: 1. Get Started button availability (hasAccess && online), 2. microsite name
    return filtered.sort((a, b) => {
      const aCanGetStarted = a.hasAccess && a.status === 'online';
      const bCanGetStarted = b.hasAccess && b.status === 'online';
      
      // First sort by Get Started availability (true comes before false)
      if (aCanGetStarted !== bCanGetStarted) {
        return bCanGetStarted ? 1 : -1;
      }
      
      // Then sort alphabetically by title
      return a.title.localeCompare(b.title);
    });
  }, [microsites, selectedCountry]);

  const handleCountryChange = (country: CountryCode) => {
    setSelectedCountry(country);
  };

  const handleMicrositeAccess = (microsite: Microsite): { canAccess: boolean; message?: string } => {
    if (microsite.status === 'offline') {
      return { 
        canAccess: false, 
        message: 'This system is currently offline' 
      };
    }
    
    if (!microsite.hasAccess) {
      return { 
        canAccess: false, 
        message: 'You do not have access to this application. Please request access from your administrator.' 
      };
    }
    
    return { canAccess: true };
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await arcgisService.fetchMicrositesFromPortal();
      setMicrosites(data.microsites);
      setCountries(data.countries);
      
      // Calculate country counts
      const countryCountsMap: Record<string, number> = {};
      data.microsites.forEach(site => {
        countryCountsMap[site.country] = (countryCountsMap[site.country] || 0) + 1;
      });
      
      const countriesWithCounts = data.countries.map(country => ({
        ...country,
        count: countryCountsMap[country.value] || 0
      }));
      
      setCountriesWithCounts(countriesWithCounts);
    } catch (err) {
      console.error('Failed to refresh microsites:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh microsite data');
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedCountry,
    filteredMicrosites,
    countries,
    countriesWithCounts,
    loading,
    error,
    handleCountryChange,
    handleMicrositeAccess,
    refreshData
  };
};