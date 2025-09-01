import { useCallback } from 'react';
import { getTranslation, Language, translations } from './translations';

type TranslationKey = keyof typeof translations.en;

export const useTranslation = (currentLanguage: Language) => {
  return useCallback(
    (key: TranslationKey) => getTranslation(key, currentLanguage),
    [currentLanguage]
  );
};

export type { TranslationKey };

export const createPageRange = (totalPages: number): number[] => {
  return Array.from({ length: totalPages }, (_, i) => i + 1);
};

export const scrollToElement = (selector: string, behavior: ScrollBehavior = 'smooth'): void => {
  document.querySelector(selector)?.scrollIntoView({ behavior });
};

export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const calculateLayoutStyles = (
  sidebarExpanded: boolean, 
  panelWidth: number,
  baseWidth: number = 60
) => {
  // Check if we're on mobile (using media query approach for consistency)
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  if (isMobile) {
    // On mobile, sidebar is overlay, content should use full width
    return {
      marginLeft: '0px',
      width: '100vw',
      transition: 'margin-left 0.3s ease, width 0.3s ease'
    };
  }
  
  // Desktop layout with sidebar pushing content
  const sidebarWidth = sidebarExpanded ? baseWidth + panelWidth : baseWidth;
  return {
    marginLeft: `${sidebarWidth}px`,
    width: `calc(100vw - ${sidebarWidth}px)`,
    transition: 'margin-left 0.3s ease, width 0.3s ease'
  };
};

export interface ErrorDisplayOptions {
  duration?: number;
  type?: 'error' | 'success' | 'warning' | 'info';
}

export const createErrorHandler = (
  setError: (message: string | null) => void,
  options: ErrorDisplayOptions = {}
) => {
  const { duration = 3000 } = options;
  
  return (message: string) => {
    setError(message);
    if (duration > 0) {
      setTimeout(() => setError(null), duration);
    }
  };
};