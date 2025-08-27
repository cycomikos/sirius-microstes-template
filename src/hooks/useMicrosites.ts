import { useState, useMemo } from 'react';
import { Microsite, CountryCode } from '../types/microsite';
import { MICROSITES } from '../data/microsites';

export const useMicrosites = (initialCountry: CountryCode = 'MY') => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(initialCountry);

  const filteredMicrosites = useMemo(() => {
    return MICROSITES.filter(site => {
      if (selectedCountry === 'GLOBAL') {
        return site.country === 'GLOBAL';
      }
      if (selectedCountry === 'MY') {
        return ['MY', 'GLOBAL'].includes(site.country);
      }
      return site.country === selectedCountry;
    });
  }, [selectedCountry]);

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

  return {
    selectedCountry,
    filteredMicrosites,
    handleCountryChange,
    handleMicrositeAccess
  };
};