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