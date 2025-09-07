/**
 * Centralized logging utility for the SIRIUS application
 * Provides controlled logging with different levels and categories
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

export enum LogCategory {
  AUTH = 'AUTH',
  SECURITY = 'SECURITY',
  GROUP_VALIDATION = 'GROUP_VALIDATION',
  SESSION = 'SESSION',
  UI = 'UI',
  API = 'API'
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private enabledCategories: Set<LogCategory>;

  private constructor() {
    // Set log level based on environment - be more restrictive in production
    this.logLevel = process.env.NODE_ENV === 'development' ? LogLevel.INFO : LogLevel.ERROR;
    
    // Enable specific categories based on environment - only critical ones in production
    this.enabledCategories = new Set([
      LogCategory.SECURITY,
      ...(process.env.NODE_ENV === 'development' ? [LogCategory.AUTH, LogCategory.GROUP_VALIDATION] : [])
    ]);
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel, category?: LogCategory): boolean {
    if (level < this.logLevel) return false;
    if (category && !this.enabledCategories.has(category)) return false;
    return true;
  }

  private formatMessage(category: LogCategory | undefined, message: string, data?: any): string {
    const timestamp = new Date().toISOString().substr(11, 12); // HH:mm:ss.SSS
    const categoryStr = category ? `[${category}]` : '';
    const dataStr = data ? ` ${JSON.stringify(data, null, 2)}` : '';
    return `${timestamp} ${categoryStr} ${message}${dataStr}`;
  }

  debug(message: string, category?: LogCategory, data?: any): void {
    if (!this.shouldLog(LogLevel.DEBUG, category)) return;
    console.debug(this.formatMessage(category, message, data));
  }

  info(message: string, category?: LogCategory, data?: any): void {
    if (!this.shouldLog(LogLevel.INFO, category)) return;
    console.info(this.formatMessage(category, message, data));
  }

  warn(message: string, category?: LogCategory, data?: any): void {
    if (!this.shouldLog(LogLevel.WARN, category)) return;
    console.warn(this.formatMessage(category, message, data));
  }

  error(message: string, category?: LogCategory, data?: any): void {
    if (!this.shouldLog(LogLevel.ERROR, category)) return;
    console.error(this.formatMessage(category, message, data));
  }

  // Security-specific logging (always enabled in production)
  security(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logMessage = `🔐 [SECURITY] ${timestamp} ${message}`;
    console.warn(logMessage, data || '');
    
    // In production, this could be sent to a security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to security audit service
      // securityAuditService.log(message, data);
    }
  }

  // Group validation specific logging with throttling
  private lastGroupValidationLog = 0;
  private readonly GROUP_VALIDATION_LOG_THROTTLE = 300000; // 5 minutes - very restrictive

  groupValidation(message: string, data?: any): void {
    const now = Date.now();
    const shouldThrottle = (now - this.lastGroupValidationLog) < this.GROUP_VALIDATION_LOG_THROTTLE;
    
    // Only log critical events (access denied, service start/stop, lost access)
    const isCritical = message.includes('ACCESS_DENIED') || 
                      message.includes('initialized') || 
                      message.includes('Stopping') ||
                      message.includes('LOST') ||
                      message.includes('lost') ||
                      message.includes('denied');

    // In production, only log critical events
    if (process.env.NODE_ENV === 'production' && !isCritical) {
      return;
    }

    // In development, throttle non-critical messages
    if (shouldThrottle && !isCritical) {
      return;
    }

    if (this.shouldLog(LogLevel.INFO, LogCategory.GROUP_VALIDATION)) {
      console.log(`🔍 [GROUP_VALIDATION] ${message}`, data || '');
    }

    if (!shouldThrottle || isCritical) {
      this.lastGroupValidationLog = now;
    }
  }

  // Configure logging at runtime
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  enableCategory(category: LogCategory): void {
    this.enabledCategories.add(category);
  }

  disableCategory(category: LogCategory): void {
    this.enabledCategories.delete(category);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Convenience functions for common categories
export const authLogger = {
  debug: (msg: string, data?: any) => logger.debug(msg, LogCategory.AUTH, data),
  info: (msg: string, data?: any) => logger.info(msg, LogCategory.AUTH, data),
  warn: (msg: string, data?: any) => logger.warn(msg, LogCategory.AUTH, data),
  error: (msg: string, data?: any) => logger.error(msg, LogCategory.AUTH, data)
};

export const securityLogger = {
  debug: (msg: string, data?: any) => logger.debug(msg, LogCategory.SECURITY, data),
  info: (msg: string, data?: any) => logger.info(msg, LogCategory.SECURITY, data),
  warn: (msg: string, data?: any) => logger.warn(msg, LogCategory.SECURITY, data),
  error: (msg: string, data?: any) => logger.error(msg, LogCategory.SECURITY, data),
  security: (msg: string, data?: any) => logger.security(msg, data)
};

export const groupValidationLogger = {
  debug: (msg: string, data?: any) => logger.debug(msg, LogCategory.GROUP_VALIDATION, data),
  info: (msg: string, data?: any) => logger.groupValidation(msg, data),
  warn: (msg: string, data?: any) => logger.warn(msg, LogCategory.GROUP_VALIDATION, data),
  error: (msg: string, data?: any) => logger.error(msg, LogCategory.GROUP_VALIDATION, data)
};

export const sessionLogger = {
  debug: (msg: string, data?: any) => logger.debug(msg, LogCategory.SESSION, data),
  info: (msg: string, data?: any) => logger.info(msg, LogCategory.SESSION, data),
  warn: (msg: string, data?: any) => logger.warn(msg, LogCategory.SESSION, data),
  error: (msg: string, data?: any) => logger.error(msg, LogCategory.SESSION, data)
};