import { useState, useEffect } from 'react';
import { InputValidator } from '../utils/validation';

const VALID_THEMES = ['light', 'dark'] as const;
type Theme = typeof VALID_THEMES[number];

const isValidTheme = (theme: string): theme is Theme => {
  return VALID_THEMES.includes(theme as Theme);
};

export const useTheme = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  useEffect(() => {
    try {
      // Safely check for saved theme preference with validation
      const savedTheme = localStorage.getItem('theme');
      const sanitizedTheme = savedTheme ? InputValidator.sanitizeString(savedTheme) : null;
      
      if (sanitizedTheme && isValidTheme(sanitizedTheme) && sanitizedTheme === 'dark') {
        setIsDarkTheme(true);
        document.body.classList.add('dark-theme');
      }
    } catch (error) {
      // If localStorage is not available or fails, default to light theme
      console.warn('Could not access theme preference:', error);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    
    try {
      if (newTheme) {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
      }
    } catch (error) {
      // If localStorage fails, still apply the theme visually
      console.warn('Could not save theme preference:', error);
    }
  };

  return {
    isDarkTheme,
    toggleTheme
  };
};