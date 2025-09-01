import { useState, useEffect } from 'react';

type Language = 'en' | 'bm';

export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Check localStorage first, then fallback to 'en'
    const saved = localStorage.getItem('sirius-language');
    return (saved === 'bm' || saved === 'en') ? saved : 'en';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('sirius-language', currentLanguage);
  }, [currentLanguage]);

  const toggleLanguage = () => {
    setCurrentLanguage(prev => prev === 'en' ? 'bm' : 'en');
  };

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
  };

  return {
    currentLanguage,
    toggleLanguage,
    setLanguage
  };
};