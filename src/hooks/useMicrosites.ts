import { useState, useMemo, useEffect } from 'react';
import { Microsite, CountryCode, Country } from '../types/microsite';
import { arcgisService } from '../services/arcgisService';

export const useMicrosites = (initialCountry: CountryCode = 'MY') => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(initialCountry);
  const [microsites, setMicrosites] = useState<Microsite[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMicrosites = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await arcgisService.fetchMicrositesFromArcGIS();
        setMicrosites(data.microsites);
        setCountries(data.countries);
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
    return microsites.filter(site => {
      if (selectedCountry === 'GLOBAL') {
        return site.country === 'GLOBAL';
      }
      if (selectedCountry === 'MY') {
        return ['MY', 'GLOBAL'].includes(site.country);
      }
      return site.country === selectedCountry;
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
      const data = await arcgisService.fetchMicrositesFromArcGIS();
      setMicrosites(data.microsites);
      setCountries(data.countries);
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
    loading,
    error,
    handleCountryChange,
    handleMicrositeAccess,
    refreshData
  };
};