import { SESSION_CONFIG } from '../constants';

export class SecurityConfig {

  static isHttps(): boolean {
    return window.location.protocol === 'https:';
  }

  static enforceHttps(): void {
    if (!this.isHttps() && process.env.NODE_ENV === 'production') {
      // In production, redirect to HTTPS
      window.location.replace(window.location.href.replace('http://', 'https://'));
    }
  }

  static validateSecureContext(): { isSecure: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let isSecure = true;

    // Check HTTPS
    if (!this.isHttps()) {
      warnings.push('Connection is not using HTTPS');
      isSecure = false;
    }

    // Check if running on localhost (development)
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         process.env.NODE_ENV === 'development';

    if (isDevelopment && !this.isHttps()) {
      warnings.push('Development environment detected - HTTPS not enforced');
      isSecure = true; // Allow for development
    }

    // Check for required environment variables
    if (!process.env.REACT_APP_PORTAL_URL) {
      warnings.push('Portal URL not configured');
      isSecure = false;
    }

    if (!process.env.REACT_APP_ARCGIS_APP_ID) {
      warnings.push('ArcGIS App ID not configured');
      isSecure = false;
    }

    return { isSecure, warnings };
  }

  static getSessionTimeout(): number {
    return SESSION_CONFIG.TIMEOUT;
  }

  static getActivityCheckInterval(): number {
    return SESSION_CONFIG.ACTIVITY_CHECK_INTERVAL;
  }

  // Generate a secure random token for CSRF protection
  static generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Check if the browser supports secure features
  static checkBrowserSecurity(): { isSecure: boolean; missingFeatures: string[] } {
    const missingFeatures: string[] = [];

    if (!window.crypto || !window.crypto.getRandomValues) {
      missingFeatures.push('Web Crypto API');
    }

    if (!window.localStorage) {
      missingFeatures.push('Local Storage');
    }

    return {
      isSecure: missingFeatures.length === 0,
      missingFeatures
    };
  }
}

export class SessionManager {
  private static lastActivity: number = Date.now();
  private static activityTimer: NodeJS.Timeout | null = null;
  private static sessionCheckCallback: (() => void) | null = null;

  static initialize(onSessionExpired: () => void): void {
    SecurityConfig.enforceHttps();
    
    this.sessionCheckCallback = onSessionExpired;
    this.updateActivity();
    this.startActivityMonitoring();
    
    // Add event listeners for user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.addEventListener(event, this.updateActivity.bind(this), { passive: true });
    });
  }

  private static updateActivity(): void {
    this.lastActivity = Date.now();
  }

  private static startActivityMonitoring(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
    }

    this.activityTimer = setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivity;
      
      if (timeSinceLastActivity > SecurityConfig.getSessionTimeout()) {
        this.expireSession();
      }
    }, SecurityConfig.getActivityCheckInterval());
  }

  private static expireSession(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }

    // Clear any stored session data
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.warn('Could not clear storage:', error);
    }

    // Notify the application
    if (this.sessionCheckCallback) {
      this.sessionCheckCallback();
    }
  }

  static cleanup(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }

    // Remove event listeners
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
      document.removeEventListener(event, this.updateActivity.bind(this));
    });
  }

  static getRemainingTime(): number {
    const elapsed = Date.now() - this.lastActivity;
    return Math.max(0, SecurityConfig.getSessionTimeout() - elapsed);
  }

  static isSessionActive(): boolean {
    return this.getRemainingTime() > 0;
  }
}

// Content Security Policy helper
export const CSPConfig = {
  // Generate CSP meta tag content
  generateCSP(): string {
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://*.arcgis.com https://*.esri.com",
      "style-src 'self' 'unsafe-inline' https://*.arcgis.com https://*.esri.com",
      "img-src 'self' data: https://*.arcgis.com https://*.esri.com",
      "connect-src 'self' https://*.arcgis.com https://*.esri.com",
      "font-src 'self' https://*.arcgis.com https://*.esri.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ];

    return directives.join('; ');
  }
};