import { VALIDATION_LIMITS } from '../constants';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class InputValidator {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;
  private static readonly SQL_INJECTION_PATTERNS = [
    /('|(\\')|(;|\\x3B)|(--|\\x2D\\x2D))/i,
    /(union|select|insert|delete|update|create|drop|exec|execute|script)/i
  ];
  private static readonly XSS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ];

  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove HTML brackets
      .replace(/['"]/g, '') // Remove quotes
      .substring(0, 255); // Limit length
  }

  static validateEmail(email: string): ValidationResult {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required' };
    }

    const sanitized = this.sanitizeString(email);
    
    if (sanitized.length === 0) {
      return { isValid: false, error: 'Email cannot be empty' };
    }

    if (!this.EMAIL_REGEX.test(sanitized)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
  }

  static validateUsername(username: string): ValidationResult {
    if (!username || typeof username !== 'string') {
      return { isValid: false, error: 'Username is required' };
    }

    const sanitized = this.sanitizeString(username);
    
    if (sanitized.length < VALIDATION_LIMITS.USERNAME_MIN) {
      return { isValid: false, error: `Username must be at least ${VALIDATION_LIMITS.USERNAME_MIN} characters` };
    }

    if (sanitized.length > VALIDATION_LIMITS.USERNAME_MAX) {
      return { isValid: false, error: `Username must be less than ${VALIDATION_LIMITS.USERNAME_MAX} characters` };
    }

    if (!this.USERNAME_REGEX.test(sanitized)) {
      return { isValid: false, error: 'Username can only contain letters, numbers, dots, underscores, and hyphens' };
    }

    return { isValid: true };
  }

  static validateSearchQuery(query: string): ValidationResult {
    if (!query || typeof query !== 'string') {
      return { isValid: false, error: 'Search query is required' };
    }

    const sanitized = this.sanitizeString(query);
    
    if (sanitized.length === 0) {
      return { isValid: false, error: 'Search query cannot be empty' };
    }

    if (sanitized.length > VALIDATION_LIMITS.SEARCH_QUERY_MAX) {
      return { isValid: false, error: 'Search query is too long' };
    }

    // Check for SQL injection patterns
    for (const pattern of this.SQL_INJECTION_PATTERNS) {
      if (pattern.test(sanitized)) {
        return { isValid: false, error: 'Invalid characters in search query' };
      }
    }

    return { isValid: true };
  }

  static validateGenericText(text: string, fieldName: string, maxLength: number = 255): ValidationResult {
    if (!text || typeof text !== 'string') {
      return { isValid: false, error: `${fieldName} is required` };
    }

    const sanitized = this.sanitizeString(text);
    
    if (sanitized.length === 0) {
      return { isValid: false, error: `${fieldName} cannot be empty` };
    }

    if (sanitized.length > maxLength) {
      return { isValid: false, error: `${fieldName} must be less than ${maxLength} characters` };
    }

    // Check for XSS patterns
    for (const pattern of this.XSS_PATTERNS) {
      if (pattern.test(text)) {
        return { isValid: false, error: `${fieldName} contains invalid content` };
      }
    }

    return { isValid: true };
  }

  static sanitizeForDisplay(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  static validateUrl(url: string): ValidationResult {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL is required' };
    }

    try {
      const urlObj = new URL(url);
      
      // Only allow https URLs for security
      if (urlObj.protocol !== 'https:') {
        return { isValid: false, error: 'Only HTTPS URLs are allowed' };
      }

      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }
}

// React hook for form validation
export const useFormValidation = () => {
  const validateField = (value: string, type: 'email' | 'username' | 'text' | 'search' | 'url', fieldName?: string): ValidationResult => {
    switch (type) {
      case 'email':
        return InputValidator.validateEmail(value);
      case 'username':
        return InputValidator.validateUsername(value);
      case 'search':
        return InputValidator.validateSearchQuery(value);
      case 'url':
        return InputValidator.validateUrl(value);
      case 'text':
        return InputValidator.validateGenericText(value, fieldName || 'Field');
      default:
        return { isValid: true };
    }
  };

  const sanitizeValue = (value: string): string => {
    return InputValidator.sanitizeString(value);
  };

  return { validateField, sanitizeValue };
};